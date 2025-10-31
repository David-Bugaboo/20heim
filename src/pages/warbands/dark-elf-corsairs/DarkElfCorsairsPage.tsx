import darkElfCorsairsData from "./data/dark-elf-corsairs.data.json";

import QuickNavigation from "../../../components/QuickNavigation";
import MobileSection from "../../../components/MobileSection";
import HeaderH1 from "../../../components/HeaderH1";
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

const DarkElfCorsairsPage: React.FC = () => {
  const leader = darkElfCorsairsData.find(
    (unit) => unit.role === "Líder"
  ) as Unit;
  const heroes = darkElfCorsairsData.filter(
    (unit) => unit.role === "Herói"
  ) as Unit[];
  const soldiers = darkElfCorsairsData.filter((unit) => !unit.role) as Unit[];

  const navigationSections = [
    { id: "introducao", title: "Introdução", level: 0 },
    { id: "estrutura-do-bando", title: "Estrutura do Bando", level: 0 },
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
    { id: "tradicoes-magicas", title: "Tradições Mágicas", level: 0 },
  ];

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#121212] dark group/design-root overflow-x-hidden">
      <div className="py-4">
        <div className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-48">
          <QuickNavigation sections={navigationSections} />
          <PageTitle>Corsários Druchii</PageTitle>
          <MobileSection id="introducao">
            <MobileText>
              Muitos não ousam falar dos parentes malignos dos Altos Elfos — os
              Druchii, mais conhecidos como Elfos Negros. Eles são uma raça para
              quem dor e prazer foram levados ao extremo absoluto. Deixam
              destruição e desespero por onde passam e são temidos mais do que
              os as hordas de Orcs e não menos do que as forças corrompidas do
              Caos e dos Mortos Incansáveis. Para as vítimas dos Elfos Negros, a
              morte é uma misericórdia, pois esse povo distorcido vaga pelo
              Mundo Conhecido em busca de escravos. Os escravos dos Elfos Negros
              trabalham até a morte em suas minas, sacrificados nos altares de
              Khaine, seu deus sombrio, ou torturados sem piedade pelas Noivas
              de Khaine, as Bruxas Élficas. Os Elfos Negros sentem um prazer
              perverso em infligir dor apenas para ver suas vítimas sofrerem.
            </MobileText>
            <MobileText>
              Apesar de seu notório sadismo, só os Alto Elfos se igualam a eles
              como exploradores. É o chamado da Pedra-Bruxa que traz esses
              saqueadores abomináveis para Mordheim, viajando furtivamente em
              seus Arcas Negras e penetrando nos guetos arruínados da cidade. Os
              Elfos Negros são mestres em furtividade e emboscadas,
              perfeitamente adaptados às ruínas da Cidade dos Condenados — a
              maioria das companhias de guerra nem percebe que está sendo
              atacada até ser tarde demais.
            </MobileText>
          </MobileSection>

          <MobileSection id="estrutura-do-bando">
            <HeaderH1 id="estrutura-do-bando">Estrutura do Bando</HeaderH1>
            <MobileText>
              Um bando de Corsários Druchii deve incluir um mínimo de 3 modelos.
              Você tem 500 coroas que pode usar para recrutar seu bando inicial.
              O número máximo de guerreiros no bando é 12.
            </MobileText>
            <MobileText>
              • <strong>Nobre Druchii:</strong> Cada bando de Corsários Druchii
              deve ter um Nobre Druchii: nem mais, nem menos!
              <br />• <strong>Domador de Feras:</strong> Seu bando pode incluir
              um único Domador de Feras (0-1).
              <br />• <strong>Lâmina do Massacre:</strong> Seu bando pode
              incluir até dois Lâminas do Massacre (0-2).
              <br />• <strong>Bruxa Druchii:</strong> Seu bando pode incluir uma
              única Bruxa Druchii (0-1).
              <br />• <strong>Corsários:</strong> Seu bando pode incluir
              qualquer número de Corsários (ilimitado).
              <br />• <strong>Sombras:</strong> Seu bando pode incluir até cinco
              Sombras (0-5).
              <br />• <strong>Feras Gélidas:</strong> Seu bando pode incluir até
              duas Feras Gélidas (0-2) se também incluir um Domador de Feras.
            </MobileText>
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

export default DarkElfCorsairsPage;
