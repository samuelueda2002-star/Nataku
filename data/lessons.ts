import type { Lesson, VocabularyItem } from "@/types/learning";
import { createLessonActivities } from "@/data/lesson-activities";

interface LessonSeed {
  id: number;
  unit: number;
  title: string;
  description: string;
  icon: string;
  vocabulary: string;
}

const LESSON_SEEDS: LessonSeed[] = [
  { id: 1, unit: 1, title: "Core Emotions", description: "Describe common feelings in everyday conversations", icon: "😊", vocabulary: "Happy|Feliz|HAP-ee;Sad|Triste|sad;Calm|Calmo|kahm;Angry|Bravo|ANG-gree;Confident|Confiante|KON-fi-dent" },
  { id: 2, unit: 1, title: "Stress & Worry", description: "Talk about fear, nerves, and difficult feelings", icon: "😟", vocabulary: "Nervous|Nervoso|NER-vus;Anxious|Ansioso|ANGK-shus;Worried|Preocupado|WUR-eed;Afraid|Com medo|uh-FRAYD;Annoyed|Incomodado|uh-NOYD" },
  { id: 3, unit: 1, title: "Energy & Mood", description: "Express excitement, boredom, freedom, and confusion", icon: "🎭", vocabulary: "Excited|Entusiasmado|ik-SY-tid;Bored|Entediado|bord;Carefree|Despreocupado|KAIR-free;Confused|Confuso|kun-FYOOZD" },
  { id: 4, unit: 1, title: "Social Style", description: "Describe how people behave around others", icon: "🤝", vocabulary: "Shy|Tímido|shy;Outgoing|Extrovertido|OWT-goh-ing;Polite|Educado|puh-LYT;Rude|Rude|rood;Friendly|Amigável|FREND-lee;Unfriendly|Hostil|un-FREND-lee" },
  { id: 5, unit: 1, title: "Confidence & Attitude", description: "Compare pride, humility, selfishness, and generosity", icon: "🧠", vocabulary: "Arrogant|Arrogante|AIR-uh-gunt;Humble|Humilde|HUM-bul;Proud|Orgulhoso|prowd;Selfish|Egoísta|SEL-fish;Generous|Generoso|JEN-er-us" },
  { id: 6, unit: 1, title: "Temperament", description: "Describe strong, peaceful, and adventurous personalities", icon: "🧭", vocabulary: "Aggressive|Agressivo|uh-GRES-iv;Peaceful|Pacífico|PEES-ful;Adventurous|Aventureiro|ad-VEN-chur-us;Romantic|Romântico|roh-MAN-tik;Sociable|Sociável|SOH-shuh-bul" },
  { id: 7, unit: 1, title: "Character & Judgment", description: "Talk about wisdom, sympathy, and unusual behavior", icon: "💭", vocabulary: "Sympathetic|Simpático|sim-puh-THET-ik;Unsympathetic|Antipático|un-sim-puh-THET-ik;Wise|Sábio|wyz;Foolish|Tolo|FOO-lish;Crazy|Louco|KRAY-zee" },
  { id: 8, unit: 1, title: "Habits & Experience", description: "Describe activity, responsibility, and experience", icon: "🌱", vocabulary: "Lazy|Preguiçoso|LAY-zee;Active|Ativo|AK-tiv;Naive|Ingênuo|ny-EEV;Experienced|Experiente|ik-SPEER-ee-enst;Responsible|Responsável|ri-SPON-suh-bul;Irresponsible|Irresponsável|ir-ri-SPON-suh-bul;Elegant|Elegante|EL-uh-gunt" },
  { id: 9, unit: 1, title: "Height & Build", description: "Use respectful words for height, build, and strength", icon: "📏", vocabulary: "Tall|Alto|tawl;Short|Baixo|short;Slim|Magro|slim;Fat|Gordo|fat;Skinny|Magrinho|SKIN-ee;Chubby|Gordinho|CHUB-ee;Strong|Forte|strong" },
  { id: 10, unit: 1, title: "Looks & Hair Color", description: "Describe appearance and common hair colors", icon: "🪞", vocabulary: "Beautiful|Bonita|BYOO-ti-ful;Handsome|Bonito|HAN-sum;Blonde|Loiro(a)|blond;Redhead|Ruivo(a)|RED-hed;Dark hair|Cabelo escuro|dark hair;Gray hair|Cabelo grisalho|gray hair;Brown hair|Cabelo castanho|brown hair" },
  { id: 11, unit: 1, title: "Hair & Eyes", description: "Describe hair length, texture, and eye color", icon: "👀", vocabulary: "Long hair|Cabelo comprido|long hair;Short hair|Cabelo curto|short hair;Wavy hair|Cabelo ondulado|WAY-vee hair;Curly hair|Cabelo encaracolado|KUR-lee hair;Straight hair|Cabelo liso|strayt hair;Light eyes|Olhos claros|lyt eyes;Dark eyes|Olhos escuros|dark eyes" },
  { id: 12, unit: 2, title: "Movement & Play", description: "Use action verbs for exercise, sports, and music", icon: "🏃", vocabulary: "to Walk|Caminhar|wawk;to Jog|Trotar|jog;to Run|Correr|run;to Sprint|Correr bem rápido|sprint;to Play (a sport)|Jogar|play;to Play (an instrument)|Tocar|play" },
  { id: 13, unit: 2, title: "Thinking & Speaking", description: "Share thoughts, stories, and information", icon: "🗣️", vocabulary: "to Think|Pensar|think;to Talk|Falar|tawk;to Tell|Contar|tel;to Say|Dizer|say;to Speak (a language)|Falar|speek" },
  { id: 14, unit: 2, title: "Calls & Requests", description: "Call, ask, offer, meet, and direct attention", icon: "📞", vocabulary: "to Call|Ligar|kawl;to Ask|Perguntar|ask;to Offer|Oferecer|AW-fer;to Meet|Conhecer/Encontrar|meet;to Look|Olhar|look" },
  { id: 15, unit: 2, title: "Ways of Seeing", description: "Choose precise verbs for looking and watching", icon: "🔭", vocabulary: "to See|Ver|see;to Watch|Assistir|woch;to Gaze|Encarar|gayz;to Glimpse|Ver de relance|glimps;to Sight|Avistar|syt;to Observe|Observar|ub-ZURV" },
  { id: 16, unit: 2, title: "Actions & Study", description: "Use practical verbs for objects, reading, and writing", icon: "📚", vocabulary: "to Open|Abrir|OH-pun;to Close|Fechar|klohz;to Push|Empurrar|push;to Pull|Puxar|pool;to Write|Escrever|ryt;to Read|Ler|reed" },
  { id: 17, unit: 2, title: "Starts & Finishes", description: "Talk about beginnings, endings, memory, and falling", icon: "🏁", vocabulary: "to Start|Começar|start;to Begin|Começar|bi-GIN;to Stop|Parar|stop;to Finish|Terminar|FIN-ish;to Remember|Lembrar|ri-MEM-ber;to Forget|Esquecer|fer-GET;to Fall|Cair|fawl" },
  { id: 18, unit: 2, title: "Change & Creation", description: "Build, destroy, grow, raise, and cut things", icon: "🛠️", vocabulary: "to Destroy|Destruir|di-STROY;to Build|Construir|bild;to Grow|Crescer|groh;to Raise|Aumentar|rayz;to Cut|Cortar|kut" },
  { id: 19, unit: 2, title: "Likes & Dislikes", description: "Express strong and mild preferences", icon: "❤️", vocabulary: "to Hate|Odiar|hayt;to Love|Amar|luv;to Like|Gostar|lyk;to Dislike|Não gostar|dis-LYK" },
  { id: 20, unit: 2, title: "Eating Actions", description: "Use the verbs connected to eating and cooking", icon: "🍽️", vocabulary: "to Eat|Comer|eet;to Bite|Morder|byt;to Feed|Alimentar|feed;to Chew|Mastigar|choo;to Swallow|Engolir|SWOL-oh;to Cook|Cozinhar|kook;to Choke|Engasgar|chohk" },
  { id: 21, unit: 2, title: "Drinks & Rest", description: "Talk about drinking, tasting, sleeping, and waking", icon: "🥤", vocabulary: "to Drink|Beber|drink;to Sip|Dar um gole|sip;to Taste|Provar|tayst;to Sleep|Dormir|sleep;to Wake|Acordar|wayk" },
  { id: 22, unit: 3, title: "Rooms Around Home", description: "Name the main rooms and outdoor areas of a home", icon: "🏠", vocabulary: "Bedroom|Quarto|BED-room;Bathroom|Banheiro|BATH-room;Living room|Sala de estar|LIV-ing room;Dining room|Sala de jantar|DY-ning room;Garage|Garagem|guh-RAHZH;Kitchen|Cozinha|KITCH-un;Yard|Quintal|yard" },
  { id: 23, unit: 3, title: "Bedtime Basics", description: "Learn the objects that make a bedroom comfortable", icon: "🛏️", vocabulary: "Bed|Cama|bed;Pillow|Travesseiro|PIL-oh;Bed sheet|Lençol de cama|bed sheet;Blanket|Cobertor|BLANG-kit;Bedside table|Mesa de cabeceira|BED-syd TAY-bul;Carpet|Carpete|KAR-pit;Rug|Tapete|rug" },
  { id: 24, unit: 3, title: "Bedroom Furniture", description: "Organize clothes, books, lighting, and seating", icon: "🛋️", vocabulary: "Wardrobe|Guarda-roupa|WOR-drohb;Chest of drawers|Cômoda|chest of drorz;Shelf|Prateleira|shelf;Bookcase|Estante de livros|BOOK-kays;Armchair|Poltrona|ARM-chair;Slippers|Pantufas|SLIP-erz;Lampshade|Abajur|LAMP-shayd" },
  { id: 25, unit: 3, title: "Bathroom Fixtures", description: "Name the main fixtures used in a bathroom", icon: "🚿", vocabulary: "Bathtub|Banheira|BATH-tub;Toilet|Vaso sanitário|TOY-lit;Sink|Pia|sink;Faucet|Torneira|FAW-sit;Towel|Toalha|TOW-ul;Shower|Chuveiro|SHOW-er;Mirror|Espelho|MEER-er" },
  { id: 26, unit: 3, title: "Bathroom Care", description: "Learn daily hygiene and cleaning essentials", icon: "🪥", vocabulary: "Toothbrush|Escova de dente|TOOTH-brush;Toothpaste|Pasta de dente|TOOTH-payst;Bath sponge|Esponja de banho|bath spunj;Soap|Sabonete|sohp;Hair brush|Escova para cabelo|hair brush;Toilet paper|Papel higiênico|TOY-lit PAY-per;Trash can|Lixeira|trash kan" },
  { id: 27, unit: 3, title: "Bathroom Extras", description: "Use words for grooming and bathroom accessories", icon: "🧴", vocabulary: "Bath mat|Tapete de banho|bath mat;Q-tip|Cotonete|KYOO-tip;Razor|Gilete|RAY-zer;Hair dryer|Secador de cabelo|hair DRY-er" },
  { id: 28, unit: 3, title: "Living Room Comfort", description: "Name furniture and electronics in a living room", icon: "📺", vocabulary: "Couch|Sofá|kowch;Cushion|Almofada|KOOSH-un;Television|Televisão|TEL-uh-vizh-un;TV stand|Rack|tee-vee stand;Remote|Controle remoto|ri-MOHT;Telephone|Telefone|TEL-uh-fohn;Fan|Ventilador|fan" },
  { id: 29, unit: 3, title: "Living Room Decor", description: "Describe decorative and cozy objects", icon: "🖼️", vocabulary: "Vase|Vaso|vays;Curtains|Cortinas|KUR-tunz;Floor lamp|Luminária de piso|floor lamp;Fireplace|Lareira|FY-er-plays;Frame|Quadro|fraym" },
  { id: 30, unit: 3, title: "Set the Table", description: "Name everyday dining furniture and utensils", icon: "🍴", vocabulary: "Table|Mesa|TAY-bul;Chair|Cadeira|chair;Plate|Prato|playt;Bowl|Tigela|bohl;Spoon|Colher|spoon;Knife|Faca|nyf;Fork|Garfo|fork" },
  { id: 31, unit: 3, title: "Linens & Drinkware", description: "Prepare the table for drinks and meals", icon: "☕", vocabulary: "Tablecloth|Toalha de mesa|TAY-bul-kloth;Napkin|Guardanapo|NAP-kin;Jug|Jarro|jug;Mug|Caneca|mug;Glass|Copo|glas;Cup|Xícara|kup;Ladle|Concha|LAY-dul" },
  { id: 32, unit: 3, title: "Dining Room Storage", description: "Learn serving and storage items for the dining room", icon: "🫖", vocabulary: "Sideboard|Guarda-louça|SYD-bord;Saucer|Pires|SAW-ser;Salt shaker|Saleiro|sawlt SHAY-ker;Sugar bowl|Açucareiro|SHOOG-er bohl" },
  { id: 33, unit: 3, title: "Kitchen Appliances", description: "Name the appliances used to store and prepare food", icon: "🍳", vocabulary: "Gas range|Fogão|gas raynj;Coffee maker|Cafeteira|KAW-fee MAY-ker;Blender|Liquidificador|BLEN-der;Microwave|Micro-ondas|MY-kroh-wayv;Fridge|Geladeira|frij;Toaster|Torradeira|TOH-ster;Kettle|Chaleira|KET-ul" },
  { id: 34, unit: 3, title: "Cooking Gear", description: "Use the right cookware and protective gear", icon: "👩‍🍳", vocabulary: "Pan|Panela|pan;Pressure cooker|Panela de pressão|PRESH-er KOOK-er;Apron|Avental|AY-prun;Oven glove|Luva de forno|UV-un gluv;Rolling pin|Rolo de massa|ROH-ling pin;Chopping board|Tábua de corte|CHOP-ing bord;Frying pan|Frigideira|FRY-ing pan" },
  { id: 35, unit: 3, title: "Kitchen Utensils", description: "Learn tools for serving, opening, and straining", icon: "🥄", vocabulary: "Cutlery|Talheres|KUT-ler-ee;Corkscrew|Saca-rolhas|KORK-skroo;Wooden spoon|Colher de pau|WOOD-un spoon;Spatula|Espátula|SPACH-uh-luh;Strainer|Coador|STRAY-ner;Colander|Escorredor|KOL-un-der;Cleaver|Cutelo|KLEE-ver" },
  { id: 36, unit: 3, title: "Garage Transport & Safety", description: "Name vehicles and useful garage equipment", icon: "🚗", vocabulary: "Car|Carro|kar;Motorcycle|Motocicleta|MOH-ter-sy-kul;Bike|Bicicleta|byk;Tool box|Caixa de ferramentas|tool boks;Fire extinguisher|Extintor de incêndio|FY-er ik-STING-gwish-er;Hose|Mangueira|hohz;Ladder|Escada|LAD-er" },
  { id: 37, unit: 3, title: "Garage Tools", description: "Measure, organize, repair, and paint in the garage", icon: "🔨", vocabulary: "Hammer|Martelo|HAM-er;Tape measure|Fita métrica|tayp MEZH-er;Bicycle rack|Porta-bicicletas|BY-si-kul rak;Tool panel|Painel de ferramentas|tool PAN-ul;Paint can|Lata de tinta|paynt kan;Paintbrush|Pincel|PAYNT-brush" },
  { id: 38, unit: 3, title: "Yard & Garden", description: "Care for the garden and describe outdoor features", icon: "🌿", vocabulary: "Shovel|Pá|SHUV-ul;Lawn mower|Cortador de grama|lawn MOH-er;Flower garden|Jardim de flores|FLOW-er GAR-dun;Grass|Grama|gras;Bush|Arbusto|boosh;Fence|Cerca|fens;Doghouse|Casinha de cachorro|DOG-hows" },
  { id: 39, unit: 3, title: "Backyard Leisure", description: "Relax outdoors with two common backyard features", icon: "🏊", vocabulary: "Hammock|Rede de descanso|HAM-uk;Swimming pool|Piscina|SWIM-ing pool" },
  { id: 40, unit: 4, title: "Add, Ask & Break", description: "Start using common two-word verbs in context", icon: "🧩", vocabulary: "Add on|Acrescentar|ad on;Ask after|Perguntar por|ask AF-ter;Ask for|Solicitar|ask for;Break up|Separar-se|brayk up;Break down|Quebrar/desfazer-se|brayk down;Bring back|Devolver|bring bak" },
  { id: 41, unit: 4, title: "Bring, Call & Carry", description: "Use phrasal verbs for topics, calls, and continuing", icon: "📲", vocabulary: "Bring something up|Trazer algo à tona|bring SUM-thing up;Bring up|Criar|bring up;Call back|Retornar uma ligação|kawl bak;Call for|Pedir|kawl for;Call off|Cancelar|kawl off;Carry on|Continuar|KAR-ee on" },
  { id: 42, unit: 4, title: "Plans & Arrivals", description: "Complete tasks, cheer up, and arrive or leave", icon: "🧳", vocabulary: "Carry out|Realizar|KAR-ee owt;Cheer up|Animar|cheer up;Check in|Registrar-se|chek in;Check out|Sair do hotel|chek owt;Come back|Voltar|kum bak;Come in|Entrar|kum in" },
  { id: 43, unit: 4, title: "Origins & Discovery", description: "Talk about origins, separation, forms, and discoveries", icon: "🔎", vocabulary: "Come from|Vir de um lugar|kum from;Drive off|Afastar/Expulsar|dryv off;Fall apart|Desmoronar|fawl uh-PART;Fill in|Preencher|fil in;Fill up|Encher|fil up;Find out|Descobrir|fynd owt" },
  { id: 44, unit: 4, title: "Get Around", description: "Use get with people, places, and transportation", icon: "🚌", vocabulary: "Get along (with)|Se dar bem com|get uh-LONG;Get away|Fugir|get uh-WAY;Get back|Voltar|get bak;Get down|Abaixar-se|get down;Get in/on|Entrar em um veículo|get in, get on;Get out|Sair de um lugar|get owt" },
  { id: 45, unit: 4, title: "Get & Give", description: "Leave transport, wake up, remove, donate, and return", icon: "🎁", vocabulary: "Get off|Sair de um veículo|get off;Get up|Levantar/Acordar|get up;Get rid of|Se livrar de|get rid of;Give away|Doar|giv uh-WAY;Give back|Devolver|giv bak;Give up|Desistir|giv up" },
  { id: 46, unit: 4, title: "Go, Grow & Keep", description: "Move forward, review, grow, and continue", icon: "🚀", vocabulary: "Go out with|Sair com alguém|goh owt with;Go over|Revisar|goh OH-ver;Go ahead|Ir em frente|goh uh-HED;Grow up|Crescer|groh up;Keep away|Afastar|keep uh-WAY;Keep up|Continuar|keep up" },
  { id: 47, unit: 4, title: "Look, Make & Pick", description: "Care, search, prepare, collect, and get dressed", icon: "👕", vocabulary: "Look after|Cuidar|look AF-ter;Look away|Desviar o olhar|look uh-WAY;Look for|Procurar|look for;Make up|Maquiar|mayk up;Pick up|Pegar/Buscar|pik up;Put on|Vestir algo|poot on" },
  { id: 48, unit: 4, title: "Run, Take & Talk", description: "Discuss shortages, removal, plans, and conversations", icon: "💬", vocabulary: "Run out|Esgotar|run owt;Take away|Retirar|tayk uh-WAY;Take out|Tirar|tayk owt;Take back|Retirar/Voltar atrás|tayk bak;Talk about|Falar sobre|tawk uh-BOWT" },
  { id: 49, unit: 4, title: "Throw & Turn", description: "Discard things and control devices or volume", icon: "🔊", vocabulary: "Throw away|Jogar fora|throh uh-WAY;Turn on|Ligar|turn on;Turn off|Desligar|turn off;Turn down|Baixar o volume|turn down;Turn up|Aumentar o volume|turn up" },
  { id: 50, unit: 4, title: "Turn, Walk & Work Out", description: "Finish with movement and fitness phrasal verbs", icon: "🚶", vocabulary: "Turn around|Dar meia-volta|turn uh-ROWND;Walk away|Ir embora/Afastar-se|wawk uh-WAY;Walk in|Entrar|wawk in;Walk off|Sair|wawk off;Work out|Malhar|work owt" },
];

function parseVocabulary(serializedVocabulary: string): VocabularyItem[] {
  return serializedVocabulary.split(";").map((entry) => {
    const [word, translation, pronunciation] = entry.split("|");
    return { word, translation, pronunciation };
  });
}

function makePracticePhrase(word: string, unitId: string): string {
  const normalizedWord = word.replace(/\s*\([^)]*\)/g, "").toLowerCase();

  if (unitId === "en-unit-1") {
    return normalizedWord.includes("hair") || normalizedWord.includes("eyes")
      ? `They have ${normalizedWord}.`
      : `They are ${normalizedWord}.`;
  }

  if (unitId === "en-unit-2") return `I like ${normalizedWord}.`;
  if (unitId === "en-unit-3") return `This is the ${normalizedWord}.`;
  return `Let's ${normalizedWord}.`;
}

function createLesson(seed: LessonSeed): Lesson {
  const id = `en-lesson-${seed.id}`;
  const unitId = `en-unit-${seed.unit}`;
  const vocabulary = parseVocabulary(seed.vocabulary);

  return {
    id,
    unitId,
    title: seed.title,
    description: seed.description,
    icon: seed.icon,
    xpReward: 10,
    goals: [
      { description: `Learn ${vocabulary.length} key words`, xpReward: 5 },
      { description: `Use ${seed.title.toLowerCase()} in conversation`, xpReward: 5 },
    ],
    vocabulary,
    phrases: vocabulary.slice(0, 3).map((item) => ({
      text: makePracticePhrase(item.word, unitId),
      translation: `Frase de prática com “${item.word}”`,
      pronunciation: item.pronunciation,
    })),
    activities: createLessonActivities(id, vocabulary),
    aiTeacherPrompt: {
      systemPrompt: `You are Mia, a warm English teacher leading a short beginner lesson called “${seed.title}”. Teach the supplied vocabulary one item at a time, include its Portuguese meaning, model a simple sentence, and wait for the learner to repeat or answer. Keep each turn brief and encouraging.`,
      introMessage: `Welcome! Today we'll practice ${seed.title.toLowerCase()} with ${vocabulary.length} useful words.`,
      topics: vocabulary.slice(0, 3).map((item) => item.word),
    },
  };
}

export const LESSONS: Lesson[] = LESSON_SEEDS.map(createLesson);
