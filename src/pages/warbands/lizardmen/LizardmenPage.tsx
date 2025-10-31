import lizardmenData from "./data/lizardmen.data.json";
import sacredMarksData from "./data/sacred-marks.data.json";
import QuickNavigation from "../../../components/QuickNavigation";
import MobileSection from "../../../components/MobileSection";
import HeaderH1 from "../../../components/HeaderH1";
import HeaderH2 from "../../../components/HeaderH2";
import MobileText from "../../../components/MobileText";
import UnitCard from "../../../components/UnitCard";
import PageTitle from "../../../components/PageTitle";

interface Unit {
  id: string;
  name: string;
  role?: string;
  quantity?: string;
  lore?: string;
  stats: {
    move: number;
    fight: string;
    shoot: string;
    armour: number;
    Vontade: string;
    health: number;
    cost: string;
    skills?: string[];
  };
  spellAffinity?: {
    aligned0?: string[];
    aligned2?: string[];
  };
  abilities: Array<{
    name: string;
    description: string;
  }>;
  equipment?: {
    "hand-to-hand"?: Array<{ name: string; cost: string }>;
    ranged?: Array<{ name: string; cost: string }>;
    armor?: Array<{ name: string; cost: string }>;
    miscellaneous?: Array<{ name: string; cost: string }>;
    modifiers?: Array<{ name: string; cost: string }>;
  };
}

interface SacredMark {
  id: string;
  name: string;
  restrictions?: string;
  cost: string;
  description: string;
}

const LizardmenPage: React.FC = () => {
  const leader = lizardmenData.find((unit) => unit.role === "Líder") as Unit;
  const heroes = lizardmenData.filter(
    (unit) => unit.role === "Herói"
  ) as Unit[];
  const soldiers = lizardmenData.filter((unit) => !unit.role) as Unit[];

  const navigationSections = [
    { id: "introducao", title: "Introdução", level: 0 },
    { id: "estrutura-do-bando", title: "Estrutura do Bando", level: 0 },
    {
      id: "marcas-sagradas",
      title: "Marcas Sagradas",
      level: 0,
      children: sacredMarksData.map((mark, index) => ({
        id: `mark-${index}`,
        title: mark.name,
        level: 1,
      })),
    },
    {
      id: "lider",
      title: "Líder",
      level: 0,
      children: leader ? [{ id: leader.id, title: leader.name, level: 1 }] : [],
    },
    {
      id: "herois",
      title: "Heróis",
      level: 0,
      children: heroes.map((hero) => ({
        id: hero.id,
        title: hero.name,
        level: 1,
      })),
    },
    {
      id: "soldados",
      title: "Soldados",
      level: 0,
      children: soldiers.map((soldier) => ({
        id: soldier.id,
        title: soldier.name,
        level: 1,
      })),
    },
  ];

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#121212] dark group/design-root overflow-x-hidden">
      <div className="py-4">
        <div className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-48">
          <QuickNavigation sections={navigationSections} />
          <PageTitle>Reptilianos</PageTitle>
          <MobileSection id="introducao">
            <MobileText>
              Os Reptilianos são uma das raças mais antigas do mundo, criadas
              pelos Antigos para serem seus servos perfeitos. Eles habitam as
              selvas tropicais de Lustria, onde construíram vastas
              cidades-templos de pedra e ouro.
            </MobileText>
            <MobileText>
              Os Reptilianos são divididos em várias castas: os Saurídeos são os
              guerreiros, os Geckos são os servos e artesãos, e os Slann são
              seus líderes supremos. Cada casta tem sua função específica na
              sociedade reptiliana, e todos servem aos Grandes Planos dos
              Antigos.
            </MobileText>
            <MobileText>
              Em Mordheim, os Reptilianos são uma presença rara mas temível.
              Eles vêm em busca de artefatos dos Antigos ou para cumprir
              profecias antigas. Sua tecnologia avançada e poderes místicos os
              tornam adversários formidáveis.
            </MobileText>
          </MobileSection>

          <MobileSection id="estrutura-do-bando">
            <HeaderH1 id="estrutura-do-bando">Estrutura do Bando</HeaderH1>
            <MobileText>
              Um bando Reptiliano deve incluir um mínimo de 3 modelos. Você tem
              500 coroas que pode usar para recrutar e equipar seu bando. O
              número máximo de guerreiros no bando é 12.
            </MobileText>
            <MobileText>
              • <strong>Magisacerdote Gecko:</strong> Cada bando Lizardmen deve
              ter um Magisacerdote Gecko – nem mais, nem menos!
              <br />• <strong>Guerreiro Totêmico Saurídeo:</strong> Seu bando
              pode incluir até 1 Guerreiro Totêmico Saurídeo.
              <br />• <strong>Gecko Crista-Alta:</strong> Seu bando pode incluir
              até 2 Geckos Crista-Alta.
              <br />• <strong>Batedor Lagarto:</strong> Seu bando pode incluir
              qualquer número de Batedores Lagarto.
              <br />• <strong>Saurídeo Veterano:</strong> Seu bando pode incluir
              de 1 a 5 Saurídeos Veteranos.
              <br />• <strong>Kroxigor:</strong> Seu bando pode incluir até 1
              Kroxigor.
            </MobileText>
          </MobileSection>

          <MobileSection id="marcas-sagradas">
            <HeaderH1 id="marcas-sagradas">Marcas Sagradas</HeaderH1>
            <MobileText>
              As Marcas Sagradas são bênçãos dos deuses reptilianos que podem
              ser concedidas aos guerreiros mais dignos. Cada marca tem
              restrições específicas e custos diferentes.
            </MobileText>
            <MobileText>
              <strong>Regras das Marcas Sagradas:</strong>
              <br />• Apenas <strong>heróis</strong> podem receber Marcas
              Sagradas
              <br />• Cada herói pode ter <strong>apenas uma</strong> Marca
              Sagrada
              <br />• Marcas Sagradas só podem ser compradas{" "}
              <strong>durante a contratação</strong> do herói
              <br />• Marcas Sagradas não podem ser compradas posteriormente
              durante o jogo
            </MobileText>

            <div className="space-y-6">
              {sacredMarksData.map((mark: SacredMark, index) => (
                <div
                  key={mark.id}
                  id={`mark-${index}`}
                  className="bg-green-900/20 border border-green-500/40 rounded-lg p-4"
                >
                  <HeaderH2 className="text-green-300 mb-2">
                    {mark.name}
                  </HeaderH2>
                  <div className="mb-3">
                    <div className="text-green-400 font-bold text-sm mb-1">
                      Custo: {mark.cost}
                    </div>
                    {mark.restrictions && (
                      <div className="text-green-400 font-bold text-sm mb-1">
                        Restrições: {mark.restrictions}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-green-400 font-bold text-sm mb-1">
                      Descrição:
                    </div>
                    <div className="text-white text-sm">{mark.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </MobileSection>

          <MobileSection id="lider">
            <HeaderH1 id="lider">Líder</HeaderH1>
            {leader && (
              <UnitCard
                id={leader.id}
                name={leader.name}
                role={leader.role}
                quantity={leader.quantity}
                lore={leader.lore}
                qualidade={(leader as any).qualidade || 0}
                stats={leader.stats}
                spellAffinity={leader.spellAffinity}
                abilities={leader.abilities}
                equipment={leader.equipment}
              />
            )}
          </MobileSection>

          <MobileSection id="herois">
            <HeaderH1 id="herois">Heróis</HeaderH1>
            {heroes.map((hero) => (
              <UnitCard
                key={hero.id}
                id={hero.id}
                name={hero.name}
                role={hero.role}
                quantity={hero.quantity}
                lore={hero.lore}
                qualidade={(hero as any).qualidade || 0}
                stats={hero.stats}
                spellAffinity={hero.spellAffinity}
                abilities={hero.abilities}
                equipment={hero.equipment}
              />
            ))}
          </MobileSection>

          <MobileSection id="soldados">
            <HeaderH1 id="soldados">Soldados</HeaderH1>
            {soldiers.map((soldier) => (
              <UnitCard
                key={soldier.id}
                id={soldier.id}
                name={soldier.name}
                quantity={soldier.quantity}
                lore={soldier.lore}
                qualidade={(soldier as any).qualidade || 0}
                stats={soldier.stats}
                abilities={soldier.abilities}
                equipment={soldier.equipment}
              />
            ))}
          </MobileSection>
        </div>
      </div>
    </div>
  );
};

export default LizardmenPage;
