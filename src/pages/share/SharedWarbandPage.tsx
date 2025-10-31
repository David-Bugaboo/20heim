import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import PageTitle from "../../components/PageTitle";
import MobileSection from "../../components/MobileSection";
import MobileText from "../../components/MobileText";
import SkillCard from "../../components/SkillCard";
import LoreSpellCard from "../../components/LoreSpellCard";
import HeaderH1 from "../../components/HeaderH1";
import GameText from "../../components/GameText";
import { db } from "../../firebase.ts";
import { doc, onSnapshot } from "firebase/firestore";
import { type Figure } from "../warband-builder/types/figure.type";

// Modificadores para o PDF
import meleeMods from "../weapons and equipments/data/modificadores-de-arma-refactor.json";
import rangedMods from "../weapons and equipments/data/modificadores-de-arma-refactor.json";
import firearmsMods from "../weapons and equipments/data/modificadores-de-armas-de-fogo-refactor.json";

interface Unit {
  id: string;
  name: string;
  role?: string;
  stats: any;
  figure: Figure;
  abilities: any[];
}

function SharedWarbandPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [sheet, setSheet] = useState<any>(null);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const ref = doc(db, "warband-snapshots", id);
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const data = snap.data();

      // Monta units a partir de figures
      const units: Unit[] = [];
      if (Array.isArray(data.figures) && data.figures.length > 0) {
        data.figures.forEach((fig: any) => {
          const unit: Unit = {
            id: String(fig?.id || crypto.randomUUID()),
            name: String(fig?.name || "Figura"),
            role: fig?.role,
            stats: {
              move: fig?.baseStats?.move ?? 10,
              fight: fig?.baseStats?.fight ?? 0,
              shoot: fig?.baseStats?.shoot ?? 0,
              armour: fig?.baseStats?.armour ?? 10,
              Vontade: fig?.baseStats?.Vontade ?? 0,
              health: fig?.baseStats?.health ?? 10,
              cost: fig?.baseStats?.cost ?? "-",
              startingXp: fig?.xp ?? 0,
              strength: fig?.baseStats?.strength ?? 0,
              skills: fig?.avaiableSkills || [],
              equipmentSlots: fig?.equipmentSlots ?? 5,
            },
            abilities: [],
            figure: fig as Figure,
          };
          units.push(unit);
        });
      }

      setSheet({
        name: data.name || "",
        faction: data.faction || "",
        notes: data.notes || "",
        gold: data.gold || "0",
        wyrdstone: data.wyrdstone || "0",
        vault: Array.isArray(data.vault) ? data.vault : [],
        units,
        ownerName: data.ownerName || "Desconhecido",
      });
      setLoading(false);
    });

    return () => unsub();
  }, [id]);

  const warbandRating = useMemo(() => {
    const activeUnits = (sheet?.units || []).filter(
      (u: any) => !Boolean((u as Unit)?.figure?.inactive)
    );
    const members = activeUnits.length;
    const sum = activeUnits.reduce((acc: number, u: any) => {
      const fig = (u as Unit).figure || {};
      const xp = Number(fig?.xp || 0);
      const quality = Number(fig?.qualidade || 0);
      return acc + xp + quality;
    }, 0);
    return members * 5 + sum;
  }, [sheet?.units]);

  const factionLabel = useMemo(() => {
    const map: Record<string, string> = {
      mercenaries: "Mercenários",
      "sisters-of-sigmar": "Irmãs de Sigmar",
      skaven: "Skaven",
      "beastman-raiders": "Saqueadores Homem-Fera",
      "dwarf-treasure-hunters": "Caçadores de Tesouro Anões",
      lizardmen: "Reptilianos",
      "orc-mob": "Horda Orc",
      goblins: "Goblins",
      "sons-of-hashut": "Filhos de Hashut",
      "vampire-courts": "Cortes Vampíricas",
      "cult-of-the-possessed": "Culto dos Possuídos",
      "carnival-of-chaos": "Circo do Caos",
      "dark-elf-corsairs": "Corsários Druchii",
    };
    return map[sheet?.faction || ""] || sheet?.faction || "";
  }, [sheet?.faction]);

  // Helper para calcular total de stats
  const getTotalStat = (u: Unit, statKey: keyof Figure["baseStats"]) => {
    const base = Number((u.figure?.baseStats as any)?.[statKey] || 0);
    const adv = Number(
      (u.figure?.advancementsStatsModifiers as any)?.[statKey] || 0
    );
    const inj = Number((u.figure?.injuryStatsModifiers as any)?.[statKey] || 0);
    const misc = Number((u.figure?.miscStatsModifiers as any)?.[statKey] || 0);
    return base + adv + inj + misc;
  };

  if (loading) {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#121212] dark group/design-root overflow-x-hidden">
        <div className="py-4">
          <div className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-48">
            <MobileSection>
              <div className="text-center py-12">
                <PageTitle>Carregando bando…</PageTitle>
                <div className="flex items-center justify-center py-12">
                  <div className="h-10 w-10 rounded-full border-4 border-green-500/40 border-t-green-400 animate-spin" />
                </div>
              </div>
            </MobileSection>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !sheet) {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#121212] dark group/design-root overflow-x-hidden">
        <div className="py-4">
          <div className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-48 max-w-3xl mx-auto">
            <MobileSection>
              <div className="text-center py-12">
                <PageTitle>Bando Não Encontrado</PageTitle>
                <MobileText className="mt-4 text-gray-400">
                  O bando compartilhado não existe ou foi excluído.
                </MobileText>
              </div>
            </MobileSection>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#121212] dark group/design-root overflow-x-hidden">
      <div className="py-4">
        <div className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-48">
          <MobileSection>
            <PageTitle>Bando de {sheet.ownerName}</PageTitle>
            <MobileText className="text-green-400 text-sm mb-4">
              📎 Visualização Compartilhada (Somente Leitura)
            </MobileText>

            {/* Exportar PDF */}
            {(() => {
              const handleExportPdf = () => {
                try {
                  const safe = (v: any): string =>
                    v === null || v === undefined ? "" : String(v);

                  const resolveModifier = (e: any): any => {
                    if (!e?.modifier || !e?.modifier?.name) return null;
                    const modNameLc = String(e.modifier.name).toLowerCase();
                    const allMods: any[] = [
                      ...(meleeMods as any[]),
                      ...(rangedMods as any[]),
                      ...(firearmsMods as any[]),
                    ];
                    return (
                      allMods.find(
                        (m) => String(m.name).toLowerCase() === modNameLc
                      ) || e.modifier
                    );
                  };

                  const buildEquipmentName = (e: any): string => {
                    const baseName = safe(e?.name);
                    if (e?.modifier?.name) {
                      return `${baseName} (${safe(e.modifier.name)})`;
                    }
                    return baseName;
                  };

                  const buildEquipmentCards = (equiped: any[]): string => {
                    if (!equiped || equiped.length === 0) return "";
                    const cardsHtml = equiped
                      .map((e: any) => {
                        const mod = resolveModifier(e);
                        const equipName = buildEquipmentName(e);
                        const rules = Array.isArray(e?.specialRules)
                          ? e.specialRules
                              .map((r: any) => {
                                if (r?.label && r?.value)
                                  return `<div><strong>${safe(
                                    r.label
                                  )}:</strong> ${safe(r.value)}</div>`;
                                if (r?.term && r?.description)
                                  return `<div><strong>${safe(
                                    r.term
                                  )}:</strong> ${safe(r.description)}</div>`;
                                return "";
                              })
                              .join("")
                          : "";
                        const modEffect =
                          mod?.effect || e?.modifier?.effect || "";
                        const allRules = modEffect
                          ? rules +
                            `<div><strong>Modificador:</strong> ${safe(
                              modEffect
                            )}</div>`
                          : rules;

                        return `
                          <div class="equip-card">
                            <div class="equip-title">${equipName}</div>
                            <div class="equip-grid">
                              <div><strong>Tipo:</strong> ${safe(e?.type)}</div>
                              <div><strong>Custo:</strong> ${safe(
                                e?.purchaseCost || e?.cost
                              )}</div>
                              <div><strong>Espaços:</strong> ${safe(
                                e?.slots || e?.spaces
                              )}</div>
                              ${
                                e?.damageModifier != null
                                  ? `<div><strong>Mod. Dano:</strong> ${safe(
                                      e?.damageModifier
                                    )}</div>`
                                  : ""
                              }
                              ${
                                e?.armorBonus != null
                                  ? `<div><strong>Bônus Armadura:</strong> ${safe(
                                      e?.armorBonus
                                    )}</div>`
                                  : ""
                              }
                              ${
                                e?.movePenalty != null
                                  ? `<div><strong>Penal. Movimento:</strong> ${safe(
                                      e?.movePenalty
                                    )}</div>`
                                  : ""
                              }
                            </div>
                            ${
                              e?.effect
                                ? `<div><strong>Efeito:</strong> ${safe(
                                    e?.effect
                                  )}</div>`
                                : ""
                            }
                            ${allRules}
                          </div>
                        `;
                      })
                      .join("");
                    return `
                      <div class="equipment-section">
                        <div class="section-title">Cards de Equipamentos</div>
                        <div class="equip-grid-page">${cardsHtml}</div>
                      </div>
                    `;
                  };

                  const buildUnitHtml = (u: Unit): string => {
                    const fig = u?.figure || {};
                    const stats = u?.stats || {};
                    const skills = (fig.skills || [])
                      .map((s: any) => s?.name || s)
                      .filter(Boolean);
                    const spells = (fig.spells || [])
                      .map((s: any) => s?.name || s)
                      .filter(Boolean);
                    const injuries = (fig.injuries || [])
                      .map((i: any) => i?.name || i)
                      .filter(Boolean);
                    const advancements = (fig.advancements || [])
                      .map((a: any) => a?.name || a)
                      .filter(Boolean);
                    const equiped = (fig.equiped || [])
                      .map((e: any) => e?.name || e)
                      .filter(Boolean);
                    const equipedFull = (fig.equiped || []) as any[];
                    const specialAbilities = [
                      ...(Array.isArray(fig.nurgleBlessings)
                        ? fig.nurgleBlessings
                        : []),
                      ...(Array.isArray(fig.mutations) ? fig.mutations : []),
                      ...(Array.isArray(fig.sacredMarks)
                        ? fig.sacredMarks
                        : []),
                    ]
                      .map((a: any) => a?.name || a)
                      .filter(Boolean);
                    const specialRules = Array.isArray(
                      (fig as any).specialRules
                    )
                      ? ((fig as any).specialRules as any[])
                          .map((r: any) => ({
                            name: r?.name || "",
                            description: r?.description || "",
                          }))
                          .filter((r) => r.name)
                      : [];

                    return `
                      <div class="card">
                        <div class="card-header">
                          <div>
                            <div class="title">${
                              safe(fig?.narrativeName)
                                ? safe(fig?.narrativeName) + ", "
                                : ""
                            }${safe(u?.name)}</div>
                            <div class="subtitle">${safe(
                              u?.role || fig?.role || ""
                            )}</div>
                          </div>
                          <div class="right-info">
                            <div><strong>Facção:</strong> ${safe(
                              sheet.faction
                            )}</div>
                            <div><strong>Custo:</strong> ${safe(
                              stats?.cost
                            )}</div>
                          </div>
                        </div>
                        <div class="row">
                          <div class="col">
                            <div class="section-title">Atributos</div>
                            <table class="table">
                              <tr><td>Movimento</td><td>${safe(
                                stats?.move
                              )}</td></tr>
                              <tr><td>Ímpeto</td><td>${safe(
                                stats?.fight
                              )}</td></tr>
                              <tr><td>Precisão</td><td>${safe(
                                stats?.shoot
                              )}</td></tr>
                              <tr><td>Armadura</td><td>${safe(
                                stats?.armour
                              )}</td></tr>
                              <tr><td>Vontade</td><td>${safe(
                                stats?.Vontade
                              )}</td></tr>
                              <tr><td>Vigor</td><td>${safe(
                                stats?.health
                              )}</td></tr>
                              ${
                                stats?.strength !== undefined
                                  ? `<tr><td>Força</td><td>${safe(
                                      stats?.strength
                                    )}</td></tr>`
                                  : ""
                              }
                            </table>
                          </div>
                          <div class="col">
                            <div class="section-title">Equipamentos</div>
                            <ul class="list">${
                              equiped
                                .map((n: string) => `<li>${n}</li>`)
                                .join("") || "<li>-</li>"
                            }</ul>
                            <div class="section-title">Habilidades</div>
                            <ul class="list">${
                              skills
                                .map((n: string) => `<li>${n}</li>`)
                                .join("") || "<li>-</li>"
                            }</ul>
                            <div class="section-title">Habilidades Especiais</div>
                            <ul class="list">${
                              specialAbilities
                                .map((n: string) => `<li>${n}</li>`)
                                .join("") || "<li>-</li>"
                            }</ul>
                          </div>
                          <div class="col">
                            <div class="section-title">Magias</div>
                            <ul class="list">${
                              spells
                                .map((n: string) => `<li>${n}</li>`)
                                .join("") || "<li>-</li>"
                            }</ul>
                            <div class="section-title">Ferimentos</div>
                            <ul class="list">${
                              injuries
                                .map((n: string) => `<li>${n}</li>`)
                                .join("") || "<li>-</li>"
                            }</ul>
                          </div>
                        </div>
                        ${
                          advancements && advancements.length
                            ? `
                        <div class="section-title">Avanços</div>
                        <ul class="list">${advancements
                          .map((n: string) => `<li>${n}</li>`)
                          .join("")}</ul>
                        `
                            : ""
                        }
                        ${
                          specialRules.length
                            ? `
                        <div class="section-title">Regras Especiais</div>
                        <div class="rules-block">
                          ${specialRules
                            .map(
                              (r) =>
                                `<div class="rule-item"><strong>${safe(
                                  r.name
                                )}:</strong> ${safe(r.description)}</div>`
                            )
                            .join("")}
                        </div>`
                            : ""
                        }
                      </div>
                      ${buildEquipmentCards(equipedFull)}
                    `;
                  };

                  const buildAllDetailPages = (): string => {
                    const blocks: string[] = [];
                    (sheet.units || []).forEach((u: Unit) => {
                      const fig = u?.figure || {};
                      const unitName = safe(u?.name);
                      const unitRole = safe(u?.role || fig?.role || "");

                      // Habilidades
                      const skills = (fig.skills || []).map((s: any) => ({
                        name: s?.name || s,
                        description: s?.description || "",
                      }));
                      const skillsHtml = skills.length
                        ? skills
                            .map(
                              (k: any) => `
                              <div class="equip-card">
                                <div class="equip-title">${safe(k.name)}</div>
                                <div>${safe(k.description)}</div>
                              </div>`
                            )
                            .join("")
                        : '<div class="muted">Sem habilidades</div>';

                      // Magias
                      const spells = (fig.spells || []).map((s: any) => ({
                        name: s?.name || s,
                        effect: s?.effect || "",
                        cn: s?.castingNumber || s?.cn || "",
                        keywords: Array.isArray(s?.keywords) ? s.keywords : [],
                      }));
                      const spellsHtml = spells.length
                        ? spells
                            .map(
                              (sp: any) => `
                              <div class="equip-card">
                                <div class="equip-title">${safe(sp.name)}</div>
                                <div><strong>CD:</strong> ${safe(
                                  String(sp.cn)
                                )}</div>
                                ${
                                  Array.isArray(sp.keywords) &&
                                  sp.keywords.length
                                    ? `<div><strong>Palavras-chave:</strong> ${sp.keywords
                                        .map((x: any) => safe(x))
                                        .join(", ")}</div>`
                                    : ""
                                }
                                <div>${safe(sp.effect)}</div>
                              </div>`
                            )
                            .join("")
                        : '<div class="muted">Sem magias</div>';

                      // Habilidades Especiais
                      const specialAbilities = [
                        ...(Array.isArray(fig.nurgleBlessings)
                          ? fig.nurgleBlessings
                          : []),
                        ...(Array.isArray(fig.mutations) ? fig.mutations : []),
                        ...(Array.isArray(fig.sacredMarks)
                          ? fig.sacredMarks
                          : []),
                      ].map((a: any) => ({
                        name: a?.name || a,
                        description: a?.description || "",
                      }));
                      const specHtml = specialAbilities.length
                        ? specialAbilities
                            .map(
                              (a) => `
                              <div class="equip-card">
                                <div class="equip-title">${safe(a.name)}</div>
                                <div>${safe(a.description)}</div>
                              </div>`
                            )
                            .join("")
                        : '<div class="muted">Sem habilidades especiais</div>';

                      blocks.push(`
                        <div class="page-break"></div>
                        <div class="card">
                          <div class="card-header">
                            <div class="title">Cartas de ${unitName}</div>
                            <div class="subtitle">${unitRole}</div>
                          </div>
                          <div class="section-title">Habilidades</div>
                          <div class="equip-grid-page">${skillsHtml}</div>
                          <div class="section-title">Magias</div>
                          <div class="equip-grid-page">${spellsHtml}</div>
                          <div class="section-title">Habilidades Especiais</div>
                          <div class="equip-grid-page">${specHtml}</div>
                        </div>
                      `);
                    });
                    return blocks.join("");
                  };

                  // Todos os cards de figura juntos primeiro
                  const unitsHtml = (sheet.units || [])
                    .map((u: Unit) => buildUnitHtml(u))
                    .join("");

                  // Depois todos os detalhes agrupados
                  const detailPagesHtml = buildAllDetailPages();

                  const html = `<!DOCTYPE html>
                    <html>
                      <head>
                        <meta charset="utf-8" />
                        <meta name="viewport" content="width=device-width, initial-scale=1" />
                        <title>${safe(sheet?.name || "Bando")}</title>
                        <style>
                          @media print {
                            .page-break { page-break-before: always; }
                          }
                          body { background: #ffffff; color: #000; font-family: Arial, Helvetica, sans-serif; margin: 20px; }
                          .header { margin-bottom: 16px; }
                          .header .h1 { font-size: 22px; font-weight: 700; }
                          .muted { color: #333; }
                          .card { border: 1px solid #000; padding: 12px; margin-bottom: 16px; background: #fff; }
                          .card-header { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid #000; padding-bottom: 6px; margin-bottom: 8px; }
                          .title { font-size: 18px; font-weight: 700; }
                          .subtitle { font-size: 12px; }
                          .row { display: flex; gap: 12px; }
                          .col { flex: 1; }
                          .section-title { font-weight: 700; margin: 8px 0 4px; border-bottom: 1px solid #000; }
                          .section-separator { page-break-before: always; margin: 20px 0; }
                          .section-header { font-size: 20px; font-weight: 700; text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; }
                          .equipment-section { margin-top: 12px; }
                          .table { width: 100%; border-collapse: collapse; }
                          .table td { border-bottom: 1px solid #000; padding: 2px 4px; font-size: 12px; }
                          .list { margin: 0; padding-left: 16px; font-size: 12px; }
                          .rules-block { margin-top: 8px; font-size: 12px; }
                          .rule-item { margin-bottom: 4px; }
                          .equip-grid-page { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 8px; }
                          .equip-card { border: 1px solid #000; padding: 8px; background: #fff; }
                          .equip-title { font-weight: 700; margin-bottom: 4px; }
                          .equip-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4px; font-size: 12px; }
                        </style>
                      </head>
                      <body>
                        <div class="header">
                          <div class="h1">${safe(sheet?.name || "Bando")}</div>
                          <div><strong>Facção:</strong> ${safe(
                            sheet.faction
                          )} &nbsp; | &nbsp; <strong>Warband Rating:</strong> ${safe(
                    String(warbandRating)
                  )}</div>
                          <div><strong>Coroas:</strong> ${safe(
                            sheet.gold
                          )} &nbsp; | &nbsp; <strong>Pedra-Bruxa:</strong> ${safe(
                    sheet.wyrdstone
                  )}</div>
                        </div>
                        ${unitsHtml}
                        <div class="page-break"></div>
                        <div class="section-separator">
                          <h2 class="section-header">Cartas Detalhadas de Habilidades e Magias</h2>
                        </div>
                        ${detailPagesHtml}
                        <script>
                          window.onload = function() {
                            setTimeout(function(){ window.print(); }, 100);
                          };
                        </script>
                      </body>
                    </html>`;

                  const w = window.open("", "_blank");
                  if (!w) return;
                  w.document.open();
                  w.document.write(html);
                  w.document.close();
                } catch (e) {
                  // eslint-disable-next-line no-console
                  console.error(e);
                }
              };

              return (
                <div className="mt-4 mb-4 flex gap-3">
                  <button
                    onClick={handleExportPdf}
                    className="px-4 py-2 rounded bg-green-900/20 border border-green-500/40 hover:bg-green-800/30 hover:border-green-400/60 text-white transition-colors duration-200 font-semibold"
                  >
                    📄 Exportar PDF (Printer-friendly)
                  </button>
                </div>
              );
            })()}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm text-gray-300">Nome do Bando</span>
                <input
                  className="bg-[#1f1f1f] border border-gray-600 rounded px-3 py-2 text-white opacity-90"
                  value={sheet.name}
                  readOnly
                  disabled
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm text-gray-300">Facção</span>
                <div className="bg-[#1f1f1f] border border-gray-600 rounded px-3 py-2 text-white opacity-90 select-none">
                  {factionLabel}
                </div>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm text-gray-300">Coroas</span>
                  <input
                    className="bg-[#1f1f1f] border border-gray-600 rounded px-3 py-2 text-white opacity-90"
                    value={sheet.gold}
                    readOnly
                    disabled
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm text-gray-300">Pedra-Bruxa</span>
                  <input
                    className="bg-[#1f1f1f] border border-gray-600 rounded px-3 py-2 text-white opacity-90"
                    value={sheet.wyrdstone}
                    readOnly
                    disabled
                  />
                </label>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="inline-flex items-center gap-2 bg-[#1f1f1f] border border-gray-600 rounded px-3 py-2">
                <span className="text-sm text-gray-300">Warband Rating:</span>
                <span
                  className="text-lg font-bold"
                  style={{ color: "#8fbc8f" }}
                >
                  {warbandRating}
                </span>
              </div>
            </div>

            <label className="flex flex-col gap-2 mt-4">
              <span className="text-sm text-gray-300">Anotações</span>
              <textarea
                className="bg-[#1f1f1f] border border-gray-600 rounded px-3 py-2 text-white min-h-[100px] opacity-90"
                value={sheet.notes}
                readOnly
                disabled
                placeholder="Notas gerais do bando, progresso da campanha etc."
              />
            </label>

            <div className="mt-8">
              <HeaderH1>Figuras</HeaderH1>
              <MobileText className="text-sm text-gray-400 mb-3">
                Visualização somente leitura das figuras do bando.
              </MobileText>

              {(() => {
                const getRoleOrder = (role: string | undefined): number => {
                  const roleLower = (role || "").toString().toLowerCase();
                  if (roleLower === "líder" || roleLower === "lider") return 1;
                  if (roleLower === "lenda") return 2;
                  if (
                    roleLower === "héroi" ||
                    roleLower === "heroi" ||
                    roleLower === "herói"
                  )
                    return 3;
                  if (
                    roleLower.includes("mercen") ||
                    roleLower.includes("mercenário")
                  )
                    return 4;
                  if (roleLower === "soldado" || roleLower === "") return 5;
                  return 6;
                };

                const sortUnits = (units: Unit[]) => {
                  return [...units].sort((a, b) => {
                    const roleA = a.role || a?.figure?.role || "";
                    const roleB = b.role || b?.figure?.role || "";
                    const orderA = getRoleOrder(roleA);
                    const orderB = getRoleOrder(roleB);

                    if (orderA !== orderB) {
                      return orderA - orderB;
                    }

                    const nameA = (a.name || "").toString();
                    const nameB = (b.name || "").toString();
                    return nameA.localeCompare(nameB);
                  });
                };

                const active = sortUnits(
                  sheet.units.filter(
                    (u) => !Boolean((u as Unit)?.figure?.inactive)
                  )
                );

                return (
                  <div className="space-y-6">
                    {active.map((u: Unit) => {
                      const fig = u.figure || {};
                      const isInactive = Boolean(fig.inactive);
                      const narrativeName = fig?.narrativeName || "";
                      const roleStr = (fig?.role || "")
                        .toString()
                        .toLowerCase();
                      const isLenda = roleStr.includes("lenda");
                      const isHero =
                        roleStr.includes("hero") || roleStr.includes("heroi");
                      const isLider =
                        roleStr.includes("lider") || roleStr.includes("líder");
                      const showXP = !isLenda && !(fig as any)?.noXP;

                      return (
                        <div
                          key={u.id}
                          className={
                            "mb-4 border border-gray-700 rounded-lg overflow-hidden bg-[#1a1a1a] text-white " +
                            (isInactive ? " opacity-60 grayscale" : "")
                          }
                        >
                          <div className="w-full p-6 pt-8">
                            <h3
                              className="text-2xl font-bold text-center mt-4"
                              style={{
                                fontFamily: '"Cinzel", serif',
                                color: "#8fbc8f",
                              }}
                            >
                              {isLenda
                                ? u.name
                                : narrativeName
                                ? `${narrativeName}, ${u.name}`
                                : u.name}
                            </h3>
                            {u.role && (isHero || isLider) && (
                              <div className="flex justify-center items-center gap-3 mt-3 flex-wrap">
                                <span className="bg-gray-600 text-white px-2 py-1 rounded text-sm">
                                  {u.role}
                                </span>
                                {u.stats?.cost && (
                                  <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                                    {u.stats.cost}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Avanços */}
                            {showXP &&
                              fig.advancements &&
                              Array.isArray(fig.advancements) &&
                              fig.advancements.length > 0 && (
                                <div className="mb-6">
                                  <h4
                                    className="text-lg font-bold mb-3"
                                    style={{ color: "#8fbc8f" }}
                                  >
                                    AVANÇOS
                                  </h4>
                                  <div className="mt-3 space-y-3">
                                    {fig.advancements.map((a, idx) => {
                                      const advDesc: Record<string, string> = {
                                        "Nova Habilidade":
                                          "Escolha e adicione uma nova habilidade à figura.",
                                        "Nova Magia":
                                          "Escolha e adicione uma nova magia à figura.",
                                        "Diminuir CD de Magia":
                                          "Reduza em 1 o Número de Conjuração (CD) de uma magia conhecida.",
                                        "+1 Ímpeto":
                                          "Aumenta permanentemente o atributo Ímpeto em +1.",
                                        "+1 Precisão":
                                          "Aumenta permanentemente a Precisão em +1.",
                                        "+1 Armadura":
                                          "Aumenta permanentemente a Armadura base em +1.",
                                        "+2 Vigor":
                                          "Aumenta permanentemente o Vigor em +2.",
                                        "+2 Movimento":
                                          "Aumenta permanentemente o Movimento em +2.",
                                        "+1 Vontade":
                                          "Aumenta permanentemente a Vontade em +1.",
                                        "+1 Força":
                                          "Aumenta permanentemente a Força em +1.",
                                        "O Moleque Tem Talento!":
                                          "Promoção: transforme um soldado promissor em herói conforme as regras da sua facção.",
                                      };
                                      const advName =
                                        typeof a === "string"
                                          ? a
                                          : a.name || "";
                                      const desc = advDesc[advName] || "";
                                      return (
                                        <div
                                          key={idx}
                                          className="relative bg-[#2a2a2a] rounded p-3 border border-gray-700"
                                        >
                                          <div className="text-white font-semibold">
                                            {advName}
                                          </div>
                                          {desc && (
                                            <div className="text-sm text-gray-300 mt-1">
                                              {desc}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                            {/* Ferimentos */}
                            {(isHero || isLider || isLenda) &&
                              fig.injuries &&
                              Array.isArray(fig.injuries) &&
                              fig.injuries.length > 0 && (
                                <div className="mb-6">
                                  <h4
                                    className="text-lg font-bold mb-3"
                                    style={{ color: "#8fbc8f" }}
                                  >
                                    FERIMENTOS
                                  </h4>
                                  <div className="mt-3 space-y-3">
                                    {fig.injuries.map((injuryName, idx) => {
                                      const descMap: Record<string, string> = {
                                        "Ferimento na Perna":
                                          "-2 permanentes em Movimento.",
                                        "Ombro Deslocado":
                                          "Perde o Próximo Jogo se recuperando.",
                                        "Antebraço Esmagado":
                                          "Braço Amputado. Só pode usar uma arma por vez e sem a característica Duas Mãos.",
                                        "Insanidade(Estupidez)":
                                          "O Personagem ganha a característica Estupidez.",
                                        "Insanidade(Fúria)":
                                          "O Personagem ganha a característica Fúria.",
                                        "Perna Deslocada":
                                          "Perde o próximo jogo se recuperando.",
                                        "Fratura Exposta na Perna":
                                          "Não pode mais usar a ação de disparada e a ação de carga não dobra mais o movimento.",
                                        "Costelas Quebradas":
                                          "-4 permanentes em Vida.",
                                        "Cego de Um Olho":
                                          "-2 permanentes em Precisão. Se rolar de novo, é removido do bando.",
                                        "Ferimento Infectado":
                                          "Rola um d20 antes de cada partida. Em um resultado de 1-5, não pode participar aquela partida.",
                                        Trauma: "-1 permanente em Vontade.",
                                        "Mão Esmigalhada":
                                          "-1 permanente em Ímpeto.",
                                        "Ferimento Profundo":
                                          "Perde os próximos 3 jogos se recuperando. Não pode fazer atividades na fase de campanha enquanto se recupera.",
                                      };
                                      const injName =
                                        typeof injuryName === "string"
                                          ? injuryName
                                          : injuryName.name || "";
                                      let desc = descMap[injName] || "";
                                      if (!desc) {
                                        const paren =
                                          injName.match(/\(([^)]+)\)/);
                                        if (paren && paren[1]) desc = paren[1];
                                      }
                                      return (
                                        <div
                                          key={idx}
                                          className="relative bg-[#2a2a2a] rounded p-3 border border-gray-700"
                                        >
                                          <div className="text-white font-semibold">
                                            {injName}
                                          </div>
                                          {desc && (
                                            <div className="text-sm text-gray-300 mt-1">
                                              {desc}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                          </div>

                          {/* Content */}
                          <div className="px-6 pt-6 pb-6 border-t border-gray-600">
                            {/* XP */}
                            {showXP && (
                              <div className="mb-6">
                                <h4
                                  className="text-lg font-bold mb-3"
                                  style={{ color: "#8fbc8f" }}
                                >
                                  EXPERIÊNCIA
                                </h4>
                                {isHero || isLider ? (
                                  <div className="bg-[#2a2a2a] p-4 rounded">
                                    <div className="text-center text-3xl font-bold text-white">
                                      {fig.xp || 0}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-[#2a2a2a] p-4 rounded">
                                    <div className="text-center text-2xl font-bold text-white">
                                      {fig.xp || 0}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Stats */}
                            <div className="mb-6">
                              <h4
                                className="text-lg font-bold mb-3"
                                style={{ color: "#8fbc8f" }}
                              >
                                ATRIBUTOS
                              </h4>
                              <div className="bg-[#2a2a2a] p-4 rounded space-y-2">
                                {[
                                  { key: "move", label: "Movimento" },
                                  { key: "fight", label: "Ímpeto" },
                                  { key: "shoot", label: "Precisão" },
                                  { key: "armour", label: "Armadura" },
                                  { key: "Vontade", label: "Vontade" },
                                  { key: "health", label: "Vigor" },
                                  { key: "strength", label: "Força" },
                                ].map(({ key, label }) => {
                                  if (
                                    key === "strength" &&
                                    (fig.baseStats?.strength === undefined ||
                                      fig.baseStats?.strength === null)
                                  )
                                    return null;
                                  const total = getTotalStat(
                                    u,
                                    key as keyof Figure["baseStats"]
                                  );
                                  const showPlus =
                                    key === "fight" ||
                                    key === "shoot" ||
                                    key === "Vontade";
                                  return (
                                    <div
                                      key={key}
                                      className="flex items-center justify-between py-2 border-b border-gray-600 last:border-b-0"
                                    >
                                      <span className="text-gray-300 font-semibold">
                                        {label}
                                      </span>
                                      <span className="text-lg font-bold">
                                        {showPlus && total >= 0
                                          ? `+${total}`
                                          : `${total}`}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Skills */}
                            {fig.role !== "Soldado" &&
                              fig.skills &&
                              Array.isArray(fig.skills) &&
                              fig.skills.length > 0 && (
                                <div className="mb-6">
                                  <h4
                                    className="text-lg font-bold mb-3"
                                    style={{ color: "#8fbc8f" }}
                                  >
                                    HABILIDADES
                                  </h4>
                                  <div className="space-y-3">
                                    {fig.skills.map((skill, idx) => {
                                      const skillObj =
                                        typeof skill === "string"
                                          ? { name: skill }
                                          : skill;
                                      return (
                                        <div key={idx}>
                                          <SkillCard
                                            name={skillObj.name || ""}
                                            description={
                                              skillObj.description || ""
                                            }
                                            footer={undefined}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                            {/* Spells */}
                            {fig.role !== "Soldado" &&
                              fig.spells &&
                              Array.isArray(fig.spells) &&
                              fig.spells.length > 0 && (
                                <div className="mb-6">
                                  <h4
                                    className="text-lg font-bold mb-3"
                                    style={{ color: "#8fbc8f" }}
                                  >
                                    MAGIAS
                                  </h4>
                                  <div className="space-y-3">
                                    {fig.spells.map((spell, idx) => {
                                      const spellObj =
                                        typeof spell === "string"
                                          ? { name: spell }
                                          : spell;
                                      return (
                                        <div key={idx}>
                                          <LoreSpellCard
                                            name={spellObj.name || ""}
                                            castingNumber={
                                              spellObj.castingNumber ||
                                              spellObj.cn ||
                                              0
                                            }
                                            keywords={spellObj.keywords || []}
                                            effect={spellObj.effect || ""}
                                            footer={undefined}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                            {/* Special Abilities */}
                            {fig.role !== "Soldado" &&
                              fig.role !== "Lenda" &&
                              [
                                ...(Array.isArray(fig.nurgleBlessings)
                                  ? fig.nurgleBlessings
                                  : []),
                                ...(Array.isArray(fig.mutations)
                                  ? fig.mutations
                                  : []),
                                ...(Array.isArray(fig.sacredMarks)
                                  ? fig.sacredMarks
                                  : []),
                              ].length > 0 && (
                                <div className="mb-6">
                                  <h4
                                    className="text-lg font-bold mb-3"
                                    style={{ color: "#8fbc8f" }}
                                  >
                                    HABILIDADES ESPECIAIS
                                  </h4>
                                  <div className="space-y-4">
                                    {[
                                      {
                                        key: "nurgleBlessings",
                                        label: "Bênçãos de Nurgle",
                                      },
                                      { key: "mutations", label: "Mutações" },
                                      {
                                        key: "sacredMarks",
                                        label: "Marcas Sagradas",
                                      },
                                    ].map(({ key, label }) => {
                                      const list = (fig as any)[key] || [];
                                      if (!list.length) return null;
                                      return (
                                        <div key={key}>
                                          <div className="text-sm text-gray-300 mb-2">
                                            {label}
                                          </div>
                                          <div className="space-y-3">
                                            {list.map(
                                              (it: any, idx: number) => {
                                                const abName =
                                                  typeof it === "string"
                                                    ? it
                                                    : it?.name || "";
                                                const abDesc =
                                                  typeof it === "string"
                                                    ? ""
                                                    : it?.description || "";
                                                return (
                                                  <div
                                                    key={idx}
                                                    className="bg-[#2a2a2a] rounded p-3 border border-gray-700"
                                                  >
                                                    <div className="text-white font-semibold">
                                                      {abName}
                                                    </div>
                                                    {abDesc && (
                                                      <div className="text-sm text-gray-300 mt-1">
                                                        {abDesc}
                                                      </div>
                                                    )}
                                                  </div>
                                                );
                                              }
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                            {/* Equipment */}
                            {(fig.equipmentSlots ?? 0) > 0 &&
                              fig.equiped &&
                              Array.isArray(fig.equiped) &&
                              fig.equiped.length > 0 && (
                                <div className="mb-6">
                                  <h4
                                    className="text-lg font-bold mb-3"
                                    style={{ color: "#8fbc8f" }}
                                  >
                                    EQUIPAMENTOS
                                  </h4>
                                  <div className="bg-[#2a2a2a] p-4 rounded">
                                    <div className="space-y-2">
                                      {fig.equiped.map((eq, idx) => {
                                        const eqName =
                                          typeof eq === "string"
                                            ? eq
                                            : eq?.name || "";
                                        const eqMod =
                                          typeof eq === "object" &&
                                          eq?.modifier?.name
                                            ? ` ${eq.modifier.name}`
                                            : "";
                                        return (
                                          <div
                                            key={idx}
                                            className="flex items-center justify-between py-2 border-b border-gray-600 last:border-b-0"
                                          >
                                            <span className="text-white">
                                              {eqName}
                                              {eqMod}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              )}

                            {/* Special Rules */}
                            {(u.abilities?.length > 0 ||
                              (Array.isArray((fig as any)?.specialRules) &&
                                (fig as any).specialRules.length > 0)) && (
                              <div className="mb-6">
                                <h4
                                  className="text-lg font-bold mb-3"
                                  style={{ color: "#8fbc8f" }}
                                >
                                  REGRAS ESPECIAIS
                                </h4>
                                <div className="bg-[#2a2a2a] p-4 rounded space-y-3">
                                  {u.abilities && u.abilities.length > 0
                                    ? u.abilities.map((ability, index) => (
                                        <div
                                          key={index}
                                          className="border-b border-gray-600 pb-3 last:border-b-0"
                                        >
                                          <h5
                                            className="font-bold mb-1"
                                            style={{ color: "#8fbc8f" }}
                                          >
                                            {ability.name}
                                          </h5>
                                          {ability.description && (
                                            <GameText
                                              component="p"
                                              className="text-gray-300 text-sm leading-relaxed"
                                            >
                                              {ability.description}
                                            </GameText>
                                          )}
                                        </div>
                                      ))
                                    : ((fig as any).specialRules as any[]).map(
                                        (r, idx) => (
                                          <div
                                            key={idx}
                                            className="border-b border-gray-600 pb-3 last:border-b-0"
                                          >
                                            <h5
                                              className="font-bold mb-1"
                                              style={{ color: "#8fbc8f" }}
                                            >
                                              {r?.name}
                                            </h5>
                                            {r?.description && (
                                              <GameText
                                                component="p"
                                                className="text-gray-300 text-sm leading-relaxed"
                                              >
                                                {r.description}
                                              </GameText>
                                            )}
                                          </div>
                                        )
                                      )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </MobileSection>
        </div>
      </div>
    </div>
  );
}

export default SharedWarbandPage;
