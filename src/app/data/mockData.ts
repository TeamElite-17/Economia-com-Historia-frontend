export type ContentType = 'video' | 'article' | 'podcast';
export type Difficulty = 'facil' | 'medio' | 'dificil';
export type UserRole = 'user' | 'admin';

export interface Author {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  subscribers: number;
  specialty: string;
  institution: string;
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  category: string;
  authorId: string;
  thumbnail: string;
  duration: string;
  views: number;
  likes: number;
  publishedAt: string;
  tags: string[];
  isJindungo: boolean;
  featured: boolean;
  content: string;
  status: 'published' | 'draft';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  questions: QuizQuestion[];
  thumbnail: string;
  estimatedTime: string;
  participants: number;
  status: 'published' | 'draft';
}

export interface ForumReply {
  id: string;
  content: string;
  authorId: string;
  publishedAt: string;
  likes: number;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  category: string;
  likes: number;
  views: number;
  replies: ForumReply[];
  publishedAt: string;
  isPinned: boolean;
  tags: string[];
  status: 'published' | 'draft';
  isPrivate: boolean;
  approvedUsers: string[];
}

export interface RankingEntry {
  userId: string;
  points: number;
  quizzesCompleted: number;
  forumReplies: number;
  badge: 'ouro' | 'prata' | 'bronze' | 'participante';
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar: string;
  role: UserRole;
  bio: string;
  subscriptions: string[];
  completedQuizzes: string[];
  watchHistory: string[];
  joinedAt: string;
  savedContent: string[];
  province: string;
  isActive: boolean;
}

export const AUTHORS: Author[] = [
  {
    id: 'a1',
    name: 'Prof. Domingos Fragoso',
    avatar: 'https://images.unsplash.com/photo-1602788484247-5c1190ca914c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    bio: 'Economista e historiador com mais de 20 anos de experiência no estudo da economia angolana. Professor na Universidade Agostinho Neto.',
    subscribers: 12400,
    specialty: 'História Económica',
    institution: 'Universidade Agostinho Neto',
  },
  {
    id: 'a2',
    name: 'Dra. Luísa Mbala',
    avatar: 'https://images.unsplash.com/photo-1739300293504-234817eead52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    bio: 'Investigadora especializada em desenvolvimento económico e reformas monetárias em África Subsaariana.',
    subscribers: 8900,
    specialty: 'Reformas Monetárias',
    institution: 'Instituto Nacional de Estudos Económicos',
  },
  {
    id: 'a3',
    name: 'Mestre João Kaputo',
    avatar: 'https://images.unsplash.com/photo-1602516807029-0d2b26a43766?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    bio: 'Geógrafo e urbanista dedicado ao estudo das dinâmicas de migração interna e urbanização acelerada em Angola.',
    subscribers: 6700,
    specialty: 'Urbanização e Migração',
    institution: 'Centro de Estudos e Investigação Científica',
  },
  {
    id: 'a4',
    name: 'Prof. Ana Sebastião',
    avatar: 'https://images.unsplash.com/photo-1630343350724-2eafe052719f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    bio: 'Historiadora focada no período colonial e pós-colonial angolano, com ênfase nas transformações sociais e económicas.',
    subscribers: 15200,
    specialty: 'História Colonial',
    institution: 'Arquivo Histórico Nacional de Angola',
  },
];

export const CATEGORIES = [
  'Todos',
  'Inflação',
  'Reformas Monetárias',
  'Migração',
  'Urbanização',
  'História Colonial',
  'Independência',
  'Recursos Naturais',
  'Economia Informal',
  'Desenvolvimento',
];

export const CONTENT_ITEMS: ContentItem[] = [
  {
    id: 'c1',
    title: 'A Hiperinflação em Angola: Causas e Consequências (1991-2002)',
    description: 'Uma análise aprofundada sobre o período de hiperinflação angolana durante a guerra civil, as suas raízes estruturais e o impacto devastador na vida quotidiana das famílias.',
    type: 'video',
    category: 'Inflação',
    authorId: 'a1',
    thumbnail: 'https://images.unsplash.com/photo-1741520965035-263d8a2fc652?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    duration: '24:18',
    views: 45200,
    likes: 3800,
    publishedAt: '2024-03-15',
    tags: ['inflação', 'guerra civil', 'kwanza', 'economia'],
    isJindungo: true,
    featured: true,
    content: `A hiperinflação que Angola viveu entre 1991 e 2002 é um dos capítulos mais dramáticos da história económica africana. No auge da crise, em 1996, a inflação anual ultrapassou os 4.000%, tornando o kwanza praticamente sem valor.

As raízes desta catástrofe económica remontam à independência em 1975, quando Angola herdou uma estrutura económica profundamente dependente da metrópole colonial. A saída abrupta dos colonos portugueses privou o país de técnicos, gestores e capital humano essencial.

A guerra civil que se seguiu agravou dramaticamente a situação. O governo do MPLA financiava o esforço de guerra imprimindo moeda sem respaldo produtivo, enquanto as infraestruturas agrícolas eram destruídas, forçando o país a importar até os alimentos básicos.

**O Impacto nas Famílias Angolanas**

Para as famílias comuns, a hiperinflação significava que o salário recebido numa segunda-feira havia perdido metade do seu valor por sexta-feira. Trabalhadores corriam aos mercados imediatamente após receber os salários, numa tentativa desesperada de converter a moeda em bens antes que perdesse valor.

O mercado informal — o famoso "mercado paralelo" ou "zungueiros" — tornou-se o principal mecanismo de sobrevivência económica para milhões de angolanos, especialmente nas cidades.

**As Reformas de Estabilização**

Em 1995, o governo implementou o Novo Kwanza (NKz), substituindo a moeda antiga numa proporção de 1:1.000. Em 1999, nova reforma criou o Kwanza Reajustado (KZR). Apenas em 2002, com o fim da guerra civil, foi possível iniciar uma estabilização económica duradoura.

A inflação caiu progressivamente: de 105% em 2002 para 31% em 2003 e 12% em 2007. A descoberta e exploração massiva do petróleo transformou Angola numa das economias de crescimento mais rápido do mundo no início do século XXI.`,
    status: 'published',
  },
  {
    id: 'c2',
    title: 'Do Musseque à Cidade: A Urbanização Acelerada de Luanda',
    description: 'Como os movimentos migratórios internos transformaram Luanda de uma cidade colonial de 500 mil habitantes para uma megalópole de mais de 8 milhões, e os desafios urbanísticos que daí resultaram.',
    type: 'article',
    category: 'Urbanização',
    authorId: 'a3',
    thumbnail: 'https://images.unsplash.com/photo-1630343350724-2eafe052719f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    duration: '12 min',
    views: 28700,
    likes: 2100,
    publishedAt: '2024-02-20',
    tags: ['luanda', 'urbanização', 'musseque', 'migração'],
    isJindungo: true,
    featured: false,
    content: `Os musseques de Luanda são muito mais do que bairros informais — são o coração pulsante da identidade angolana urbana, o resultado de décadas de migração, resistência e criatividade popular.

O termo "musseque" vem do quimbundo "mu seke" (areia vermelha), referindo-se originalmente ao solo característico das periferias luandenses. Durante o período colonial, estes bairros eram habitados essencialmente por angolanos que não tinham acesso à "cidade de cimento" reservada aos europeus.

**A Grande Migração Pós-Independência**

Com a independência em 1975 e a subsequente guerra civil, inicia-se um fluxo migratório interno sem precedentes. Populações rurais fugindo do conflito armado convergem para Luanda em busca de segurança. Em duas décadas, a cidade passa de 600 mil para mais de 4 milhões de habitantes.

Esta transformação cria imensos desafios: habitação, saneamento, abastecimento de água, transportes públicos. Os musseques expandem-se horizontalmente, consumindo antigas fazendas e terrenos periféricos.

**O Kwanza do Musseque: Economia Informal**

Paradoxalmente, os musseques desenvolveram economias locais robustas. O comércio informal, as "quitandas" (pequenas lojas), os "candongeiros" (transporte informal) e a troca de serviços criaram redes económicas paralelas que sustentam milhões de famílias.

Estudos recentes estimam que a economia informal representa entre 40% e 60% do emprego em Luanda, tornando-a não apenas um fenómeno de sobrevivência, mas uma estrutura económica permanente.`,
    status: 'published',
  },
  {
    id: 'c3',
    title: 'O Petróleo de Angola: Riqueza, Dependência e o Paradoxo do Desenvolvimento',
    description: 'Angola é o segundo maior produtor de petróleo de África. Mas como é que esta riqueza se transformou numa armadilha? Uma análise da maldição dos recursos naturais no contexto angolano.',
    type: 'podcast',
    category: 'Recursos Naturais',
    authorId: 'a2',
    thumbnail: 'https://images.unsplash.com/photo-1734254807102-fbf62b0cc513?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    duration: '38:45',
    views: 19800,
    likes: 1650,
    publishedAt: '2024-01-30',
    tags: ['petróleo', 'sonangol', 'recursos naturais', 'desenvolvimento'],
    isJindungo: false,
    featured: true,
    content: `Angola descobriu petróleo na região de Cabinda na década de 1950, mas foi apenas após a independência e especialmente após o fim da guerra civil em 2002 que a exploração se intensificou dramaticamente.

O petróleo representa hoje mais de 90% das exportações angolanas e cerca de 70% das receitas do Estado. Esta dependência extrema cria uma vulnerabilidade estrutural conhecida como "doença holandesa" — quando um setor exportador dominante valoriza a moeda nacional, tornando outros setores produtivos não competitivos.

**A Sonangol e o Modelo de Gestão**

A Sonangol, empresa estatal petrolífera, foi criada em 1976 e tornou-se muito mais do que uma empresa de energia. Durante décadas, funcionou como um Estado dentro do Estado, gerindo não apenas o petróleo, mas também bancos, imobiliárias, empresas de telecomunicações e até serviços de saúde privados.

Este modelo concentrou poder e riqueza numa estrutura altamente centralizada, com consequências profundas para a diversificação económica.

**O Crash de 2015 e a Crise**

A queda abrupta do preço internacional do petróleo em 2014-2015 expôs brutalmente a fragilidade do modelo angolano. O kwanza desvalorizou-se 40%, as reservas cambiais caíram drasticamente, e o crescimento económico entrou em terreno negativo.

Esta crise catalisou reformas estruturais e o início de uma tentativa de diversificação económica, com investimentos na agricultura, turismo e indústria transformadora — setores que haviam sido negligenciados durante os anos de petrodólares abundantes.`,
    status: 'published',
  },
  {
    id: 'c4',
    title: 'Reformas Monetárias em Angola: Do Escudo ao Kwanza',
    description: 'A história das moedas angolanas é também a história do país. Do escudo colonial ao kwanza atual, cada reforma monetária reflete transformações políticas e económicas profundas.',
    type: 'article',
    category: 'Reformas Monetárias',
    authorId: 'a2',
    thumbnail: 'https://images.unsplash.com/photo-1678693361607-2b7b66dce8f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    duration: '9 min',
    views: 22400,
    likes: 1890,
    publishedAt: '2024-03-01',
    tags: ['kwanza', 'moeda', 'reforma monetária', 'banco nacional de angola'],
    isJindungo: false,
    featured: false,
    content: `A história monetária de Angola é um espelho das transformações políticas e económicas do país. Em apenas 50 anos de independência, Angola teve múltiplas moedas e inúmeras reformas monetárias.

**O Escudo Angolano (até 1977)**

Durante o período colonial, Angola usava o escudo angolano, ligado ao escudo português. Com a independência em 1975, o governo do MPLA manteve temporariamente o escudo até criar a sua própria moeda.

**O Primeiro Kwanza (1977-1990)**

Em 1977, o governo introduziu o kwanza (KZ), em homenagem ao rio Kwanza. A moeda era declarada inconvertível e o Estado controlava rigidamente as transações cambiais.

**A Espiral Inflacionária (1991-1999)**

Com o fim do sistema de partido único e a abertura económica em 1991, combinados com a continuação da guerra civil, a inflação disparou. O governo criou o Novo Kwanza em 1990 (1 NKZ = 100 KZ) e o Kwanza Reajustado em 1995 (1 KZR = 1.000 NKZ).

**O Kwanza Atual (desde 1999)**

Em 1999, foi introduzido o kwanza atual (AOA), com 1 AOA equivalendo a 1 milhão do kwanza original de 1977. O Banco Nacional de Angola passou a implementar políticas de estabilização monetária progressivamente mais eficazes.

Hoje, o kwanza enfrenta ainda desafios significativos: volatilidade cambial, dependência das reservas petrolíferas e pressões inflacionárias recorrentes, mas a estabilidade macroeconómica melhorou consideravelmente desde o período de hiperinflação.`,
    status: 'published',
  },
  {
    id: 'c5',
    title: 'Migração Interna e Deslocamento Forçado: O Éxodo Rural de Angola',
    description: 'Mais de 4 milhões de angolanos foram deslocados internamente durante a guerra civil. Como esta mobilização forçada moldou a demografia, a economia e a cultura angolana contemporânea.',
    type: 'video',
    category: 'Migração',
    authorId: 'a3',
    thumbnail: 'https://images.unsplash.com/photo-1608052026785-0bc249c733e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    duration: '31:22',
    views: 16500,
    likes: 1340,
    publishedAt: '2024-02-10',
    tags: ['migração', 'deslocamento', 'guerra civil', 'demografia'],
    isJindungo: true,
    featured: false,
    content: `A guerra civil angolana (1975-2002) produziu uma das maiores crises de deslocamento interno em África. Estimativas conservadoras apontam para 4 a 4,5 milhões de deslocados internos no auge do conflito, num país com pouco mais de 15 milhões de habitantes.

Estes movimentos populacionais transformaram radicalmente a geografia humana de Angola, concentrando populações em centros urbanos e despojando vastas regiões rurais de agricultores e comerciantes.

**Os Padrões de Migração**

A migração durante a guerra seguia padrões previsíveis: fuga para zonas controladas pelo governo (maioritariamente urbanas) ou para países vizinhos (República do Congo, Zâmbia, Namíbia). As províncias de Malanje, Huambo e Bié foram as mais afetadas pelo êxodo rural.

Luanda, já superpopulada, absorveu o grosso dos deslocados. As periferias cresceram exponencialmente, sem infraestruturas, serviços básicos ou planeamento urbano.`,
    status: 'published',
  },
  {
    id: 'c6',
    title: 'A Economia Colonial em Angola: Exploração, Trabalho Forçado e Legado',
    description: 'Do contrato ao trabalho forçado, da borracha ao café: como o sistema económico colonial português em Angola moldou estruturas de dependência que persistem até hoje.',
    type: 'article',
    category: 'História Colonial',
    authorId: 'a4',
    thumbnail: 'https://images.unsplash.com/photo-1649299313612-48cc3493f62e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    duration: '15 min',
    views: 31200,
    likes: 2760,
    publishedAt: '2024-01-15',
    tags: ['colonialismo', 'trabalho forçado', 'café', 'história económica'],
    isJindungo: true,
    featured: true,
    content: `O colonialismo português em Angola durou mais de 500 anos, mas foi no século XX que o sistema económico colonial atingiu o seu máximo desenvolvimento e, paradoxalmente, também a sua crise terminal.

**O Sistema de Contrato**

O "contrato" era o eufemismo utilizado para descrever um sistema de trabalho forçado que persistiu formalmente até 1961. Os angolanos eram obrigados a trabalhar para colonos ou para o Estado durante períodos determinados, com remuneração simbólica ou nenhuma.

Este sistema fornecia mão-de-obra barata para as plantações de café do norte (Uíge, Malanje), as minas de diamantes de Lunda, e as obras de infraestrutura do território.

**O Café como Motor Económico**

No início do século XX, Angola tornava-se um dos maiores produtores mundiais de café, especialmente o café robusta cultivado na região do Uíge. Em 1960, Angola era o terceiro maior exportador mundial de café.

As grandes fazendas cafeeiras eram propriedade de colonos portugueses que chegaram em massa nas décadas de 1950 e 1960. A mão-de-obra era essencialmente africana, submetida ao regime de contrato.

**O Legado Estrutural**

Quando os colonos partiram em 1975, levaram consigo conhecimentos técnicos, capital e redes comerciais. As fazendas de café foram abandonadas ou nacionalizadas sem capacidade de gestão adequada. A produção de café — que havia sido pilar da economia — colapsa nos anos seguintes.

Este padrão de dependência e ruptura é fundamental para compreender as dificuldades de desenvolvimento económico que Angola enfrentou após a independência.`,
    status: 'published',
  },
  {
    id: 'c7',
    title: 'Independência e Modelo Económico: Angola entre o Marxismo e o Mercado',
    description: 'Como Angola transitou de uma economia planificada de inspiração soviética para uma economia de mercado? Os ganhos, as perdas e as contradições desta transformação.',
    type: 'podcast',
    category: 'Independência',
    authorId: 'a4',
    thumbnail: 'https://images.unsplash.com/photo-1602516807029-0d2b26a43766?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    duration: '42:10',
    views: 24600,
    likes: 2180,
    publishedAt: '2024-04-05',
    tags: ['independência', 'marxismo', 'MPLA', 'economia planificada'],
    isJindungo: false,
    featured: false,
    content: `Em 11 de novembro de 1975, Angola proclamava a independência sob a liderança do MPLA (Movimento Popular de Libertação de Angola). O novo governo, fortemente influenciado pela ideologia marxista-leninista e apoiado pela União Soviética e Cuba, adotou um modelo de economia planificada.

Nationalizações em massa, coletivização agrária e controlo estatal da economia: estas foram as escolhas políticas que moldaram os primeiros quinze anos da Angola independente.

**A Economia Planificada (1975-1991)**

O Estado angolano assumiu o controlo das principais empresas, dos bancos, do comércio externo e de setores estratégicos como o petróleo (Sonangol), os diamantes (Endiama) e a energia (ENE).

O sistema de planeamento central, importado do bloco soviético, provou-se inadequado para as condições angolanas: falta de quadros técnicos, corrupção incipiente, guerra civil devastadora e desajuste entre planos e realidade.

**A Viragem de 1991**

Com o colapso do bloco soviético e a necessidade de buscar apoio financeiro ocidental (FMI, Banco Mundial), Angola adota em 1991 a Lei das Atividades Económicas, abrindo o país ao investimento privado e iniciando reformas de liberalização.

A transição foi turbulenta: privatizações mal geridas criaram oligarquias, a inflação explodiu sem os mecanismos de controlo estatais, e a continuação da guerra sabotou qualquer tentativa de estabilização.`,
    status: 'published',
  },
  {
    id: 'c8',
    title: 'A Economia Informal de Angola: Zungueiros, Candongos e Kizomba Económica',
    description: 'No coração da economia angolana pulsam as zungueiras, os candongos e os mercados paralelos. Uma exploração da economia informal como sistema de sobrevivência e resistência.',
    type: 'video',
    category: 'Economia Informal',
    authorId: 'a1',
    thumbnail: 'https://images.unsplash.com/photo-1602788484247-5c1190ca914c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    duration: '19:33',
    views: 38900,
    likes: 3450,
    publishedAt: '2024-03-22',
    tags: ['economia informal', 'zungueiro', 'mercado paralelo', 'sobrevivência'],
    isJindungo: true,
    featured: false,
    content: `A economia informal em Angola não é apenas um fenómeno marginal — é o principal sustento de mais de metade da força de trabalho urbana. Compreendê-la é compreender como Angola realmente funciona.

**As Zungueiras: Economia em Movimento**

"Zungueira" vem do quimbundo "zungua" (andar de um lado para o outro). As zungueiras são as vendedoras ambulantes que percorrem as ruas de Luanda e outras cidades, transportando mercadorias na cabeça ou em tabuleiros.

Elas vendem de tudo: refeições quentes, frutas, legumes, artigos de higiene, crédito telefónico. Formam uma rede de distribuição capilar que nenhum supermercado consegue replicar, chegando onde o comércio formal não chega.

**Os Candongos: Mobilidade Informal**

O sistema de transporte informal — os "candongos" (minibuses Toyota Hiace) e mais recentemente os "TVs" — é o principal meio de transporte da maioria dos luandenses.

Na ausência de um sistema de transportes públicos eficiente, o candongo surgiu como solução orgânica. São geridos por proprietários individuais ou pequenas cooperativas, criam emprego para condutores, cobradores e mecânicos.

**O Mercado Paralelo**

Durante décadas de escassez e controlo cambial, o mercado paralelo de divisas foi o único mecanismo acessível à maioria dos angolanos para obter moeda estrangeira. O "kinguilas" (cambista informal) era uma figura omnipresente nas esquinas de Luanda.

A liberalização cambial progressiva reduziu o diferencial entre o câmbio oficial e paralelo, mas o mercado informal de divisas persiste como termómetro das tensões económicas.`,
    status: 'published',
  },
  {
    id: 'c9',
    title: 'Diamantes de Angola: Entre a Riqueza e o Conflito',
    description: 'Os diamantes de Angola financiaram décadas de guerra civil. O documentário examina o trajeto das pedras preciosas desde as minas de Lunda até os mercados internacionais e o seu papel no conflito.',
    type: 'video',
    category: 'Recursos Naturais',
    authorId: 'a1',
    thumbnail: 'https://images.unsplash.com/photo-1734254807102-fbf62b0cc513?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    duration: '28:14',
    views: 20100,
    likes: 1720,
    publishedAt: '2024-02-28',
    tags: ['diamantes', 'Lunda', 'conflito', 'recursos naturais', 'UNITA'],
    isJindungo: false,
    featured: false,
    content: `As províncias de Lunda Norte e Lunda Sul contêm algumas das mais ricas reservas de diamantes do mundo. Mas esta riqueza foi, durante décadas, uma maldição que financiou a guerra e enriqueceu poucos à custa de muitos.

**Os "Blood Diamonds" Angolanos**

O termo "diamantes de sangue" ou "diamantes de conflito" ganhou notoriedade internacional em parte graças à situação angolana. A UNITA (União Nacional para a Independência Total de Angola) controlava vastas regiões diamantíferas e vendia as pedras no mercado internacional para financiar o esforço de guerra.

Estima-se que entre 1992 e 2002, a UNITA arrecadou cerca de 4 a 4,5 mil milhões de dólares com a venda de diamantes, perpetuando um conflito que ceifou cerca de 500 mil vidas.

**O Processo de Kimberley**

A pressão internacional levou à criação em 2003 do Processo de Kimberley, um sistema de certificação internacional que visa garantir que os diamantes comercializados não financiam conflitos armados.

Angola foi um dos países fundadores do processo, o que lhe permitiu reintegrar progressivamente a sua produção diamantífera nos mercados internacionais legítimos.

**A Endiama e o Modelo Atual**

A Endiama, empresa estatal de diamantes, supervisiona atualmente a produção angolana que ronda os 9 milhões de quilates anuais, tornando Angola um dos maiores produtores mundiais.

Mas os benefícios chegam às comunidades das regiões produtoras? Este permanece um tema de debate e controvérsia no país.`,
    status: 'published',
  },
  {
    id: 'c10',
    title: 'Angola 2050: Diversificação Económica e os Desafios do Futuro',
    description: 'Com as reservas petrolíferas a diminuírem, Angola precisa de reinventar a sua economia. Que setores têm potencial? Quais os obstáculos? Uma visão prospetiva sobre o desenvolvimento angolano.',
    type: 'podcast',
    category: 'Desenvolvimento',
    authorId: 'a2',
    thumbnail: 'https://images.unsplash.com/photo-1602516807029-0d2b26a43766?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    duration: '35:50',
    views: 14300,
    likes: 1290,
    publishedAt: '2024-04-10',
    tags: ['desenvolvimento', 'diversificação', 'futuro', 'angola 2050'],
    isJindungo: false,
    featured: false,
    content: `Angola enfrenta uma encruzilhada histórica: as reservas petrolíferas onshore estão em declínio, os preços internacionais do petróleo são voláteis, e a população jovem cresce rapidamente. A diversificação económica deixou de ser uma opção para se tornar uma necessidade imperativa.

**Agricultura: O Potencial Dormido**

Angola possui 35 milhões de hectares de terra arável, dos quais apenas uma fração é cultivada. Com solos férteis e boa pluviosidade em grande parte do território, o país tem potencial para ser um grande exportador agrícola.

Mas os desafios são enormes: infraestruturas rurais degradadas, falta de crédito agrícola, carência de técnicos e tecnologia, e concorrência com importações subsidiadas.`,
    status: 'published',
  },
  {
    id: 'c11',
    title: 'O Kwanza e a Estabilidade Cambial: Desafios do Banco Nacional de Angola',
    description: 'Uma análise técnica das políticas monetárias do BNA, os instrumentos de estabilização cambial e os desafios de manter a estabilidade da moeda numa economia tão dependente do petróleo.',
    type: 'article',
    category: 'Reformas Monetárias',
    authorId: 'a2',
    thumbnail: 'https://images.unsplash.com/photo-1678693361607-2b7b66dce8f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    duration: '11 min',
    views: 11800,
    likes: 980,
    publishedAt: '2024-01-25',
    tags: ['BNA', 'kwanza', 'política monetária', 'câmbio'],
    isJindungo: false,
    featured: false,
    content: `O Banco Nacional de Angola (BNA) enfrenta um desafio estrutural: gerir a política monetária de uma economia altamente dependente de uma única commodity sujeita a grandes variações de preço no mercado internacional.

A taxa de câmbio do kwanza face ao dólar americano é o barómetro mais imediato da saúde económica angolana. Quando o preço do petróleo cai, as receitas em divisas diminuem, a pressão sobre o kwanza aumenta e a inflação tende a acelerar.`,
    status: 'published',
  },
  {
    id: 'c12',
    title: 'Educação e Desenvolvimento em Angola: Indicadores, Desafios e Perspetivas',
    description: 'O capital humano é o principal motor do desenvolvimento sustentável. Como está Angola em termos de educação, qualificações e preparação da sua juventude para o mercado de trabalho do futuro?',
    type: 'video',
    category: 'Desenvolvimento',
    authorId: 'a4',
    thumbnail: 'https://images.unsplash.com/photo-1602788484247-5c1190ca914c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    duration: '22:40',
    views: 17600,
    likes: 1520,
    publishedAt: '2024-03-30',
    tags: ['educação', 'capital humano', 'juventude', 'desenvolvimento'],
    isJindungo: false,
    featured: false,
    content: `Angola investiu significativamente na expansão do sistema educativo desde o fim da guerra civil em 2002. A taxa de analfabetismo caiu de 33% em 2001 para menos de 20% em 2020. O número de escolas, professores e alunos cresceu extraordinariamente.

Mas os desafios qualitativos são imensos: qualidade do ensino, relevância curricular para o mercado de trabalho, acesso ao ensino superior, e integração das novas tecnologias na educação.`,
    status: 'published',
  },
];

export const QUIZZES: Quiz[] = [
  {
    id: 'q1',
    title: 'Hiperinflação e Reformas Monetárias em Angola',
    description: 'Testa os teus conhecimentos sobre o período de hiperinflação angolana e as sucessivas reformas da moeda nacional.',
    category: 'Inflação',
    difficulty: 'medio',
    thumbnail: 'https://images.unsplash.com/photo-1741520965035-263d8a2fc652?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    estimatedTime: '10 min',
    participants: 3840,
    status: 'published',
    questions: [
      {
        id: 'q1q1',
        question: 'Em que ano Angola registou a taxa de inflação mais elevada durante o período de hiperinflação?',
        options: ['1993', '1995', '1996', '1999'],
        correctIndex: 2,
        explanation: 'Em 1996, a inflação anual em Angola ultrapassou os 4.000%, o valor mais elevado do período de hiperinflação.',
      },
      {
        id: 'q1q2',
        question: 'Quantas reformas monetárias Angola realizou entre 1977 e 1999?',
        options: ['1', '2', '3', '4'],
        correctIndex: 2,
        explanation: 'Angola realizou 3 reformas monetárias principais: o Kwanza (1977), o Novo Kwanza (1990) e o Kwanza Reajustado (1995), antes do Kwanza atual de 1999.',
      },
      {
        id: 'q1q3',
        question: 'Qual a principal causa da hiperinflação angolana na década de 1990?',
        options: ['Seca prolongada', 'Emissão excessiva de moeda para financiar a guerra', 'Embargo económico internacional', 'Queda do preço do petróleo'],
        correctIndex: 1,
        explanation: 'A emissão excessiva de moeda sem respaldo produtivo para financiar o esforço de guerra foi a principal causa da hiperinflação angolana.',
      },
      {
        id: 'q1q4',
        question: 'O que significa a sigla AOA?',
        options: ['Angola Official Asset', 'Associação de Operadores Angolanos', 'Kwanza angolano (Angola Oficial)', 'É o código ISO do Kwanza angolano atual'],
        correctIndex: 3,
        explanation: 'AOA é o código ISO 4217 do Kwanza angolano atual, introduzido em 1999.',
      },
      {
        id: 'q1q5',
        question: 'Em que ano o governo angolano criou o Banco Nacional de Angola?',
        options: ['1975', '1976', '1978', '1980'],
        correctIndex: 1,
        explanation: 'O Banco Nacional de Angola foi criado em 1976, um ano após a independência, para gerir a política monetária do novo Estado.',
      },
    ],
  },
  {
    id: 'q2',
    title: 'História Colonial e Económica de Angola',
    description: 'Questões sobre o período colonial português em Angola, o sistema económico de exploração e o seu legado histórico.',
    category: 'História Colonial',
    difficulty: 'dificil',
    thumbnail: 'https://images.unsplash.com/photo-1649299313612-48cc3493f62e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    estimatedTime: '12 min',
    participants: 2150,
    status: 'published',
    questions: [
      {
        id: 'q2q1',
        question: 'Como era denominado o sistema de trabalho forçado durante o período colonial em Angola?',
        options: ['Sistema de tributo', 'Sistema de contrato', 'Sistema de prestação', 'Sistema colonial laboral'],
        correctIndex: 1,
        explanation: 'O "sistema de contrato" era o eufemismo utilizado para o trabalho forçado colonial, formalmente abolido em 1961.',
      },
      {
        id: 'q2q2',
        question: 'Que posição Angola ocupava no ranking mundial de exportação de café por volta de 1960?',
        options: ['1.º lugar', '2.º lugar', '3.º lugar', '5.º lugar'],
        correctIndex: 2,
        explanation: 'Por volta de 1960, Angola era o 3.º maior exportador mundial de café, especialmente café robusta cultivado na região do Uíge.',
      },
      {
        id: 'q2q3',
        question: 'Qual era o principal produto de exportação colonial de Angola antes do petróleo?',
        options: ['Diamantes', 'Açúcar', 'Café', 'Algodão'],
        correctIndex: 2,
        explanation: 'O café foi o principal produto de exportação colonial de Angola durante grande parte do século XX, antes de ser superado pelo petróleo.',
      },
      {
        id: 'q2q4',
        question: 'Em que região se concentravam as minas de diamantes durante o período colonial?',
        options: ['Cabinda', 'Cuando Cubango', 'Lunda Norte e Sul', 'Malanje'],
        correctIndex: 2,
        explanation: 'As principais jazidas de diamantes de Angola situam-se nas províncias de Lunda Norte e Lunda Sul, no nordeste do país.',
      },
      {
        id: 'q2q5',
        question: 'Que empresa geria o petróleo angolano quando da independência em 1975?',
        options: ['Sonangol', 'CABGOC (Cabinda Gulf Oil Company)', 'Petrangol', 'Total Angola'],
        correctIndex: 1,
        explanation: 'A CABGOC (Cabinda Gulf Oil Company), subsidiária da Gulf Oil, era a principal operadora petrolífera em Angola antes e durante a independência.',
      },
    ],
  },
  {
    id: 'q3',
    title: 'Urbanização e Migração em Angola',
    description: 'Explora o fenómeno do crescimento urbano acelerado, os musseques de Luanda e os padrões de migração interna angolana.',
    category: 'Urbanização',
    difficulty: 'facil',
    thumbnail: 'https://images.unsplash.com/photo-1630343350724-2eafe052719f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    estimatedTime: '8 min',
    participants: 4620,
    status: 'published',
    questions: [
      {
        id: 'q3q1',
        question: 'De que língua vem a palavra "musseque"?',
        options: ['Português', 'Quimbundu', 'Umbundu', 'Francês'],
        correctIndex: 1,
        explanation: '"Musseque" deriva do quimbundu "mu seke" que significa "areia vermelha", referindo-se ao solo característico das periferias de Luanda.',
      },
      {
        id: 'q3q2',
        question: 'Qual a estimativa do número de deslocados internos no pico da guerra civil angolana?',
        options: ['1 milhão', '2 milhões', '4 milhões', '6 milhões'],
        correctIndex: 2,
        explanation: 'Estimativas conservadoras apontam para 4 a 4,5 milhões de deslocados internos no auge do conflito civil angolano.',
      },
      {
        id: 'q3q3',
        question: 'O que é um "candongo" no contexto do transporte em Angola?',
        options: ['Um tipo de barco fluvial', 'Um minibus de transporte informal', 'Um motorista de táxi', 'Uma empresa de transportes'],
        correctIndex: 1,
        explanation: 'O "candongo" é o minibus (geralmente Toyota Hiace) que constitui o principal sistema de transporte informal e popular em Luanda e outras cidades angolanas.',
      },
      {
        id: 'q3q4',
        question: 'Que percentagem do emprego em Luanda representa a economia informal, segundo estudos recentes?',
        options: ['10-20%', '20-30%', '40-60%', '70-80%'],
        correctIndex: 2,
        explanation: 'Estudos recentes estimam que a economia informal representa entre 40% e 60% do emprego em Luanda.',
      },
      {
        id: 'q3q5',
        question: 'Como se chama a vendedora ambulante nas ruas de Angola?',
        options: ['Quitandeira', 'Zungueira', 'Kinguila', 'Candonga'],
        correctIndex: 1,
        explanation: '"Zungueira" vem do quimbundu "zungua" (andar de um lado para o outro) e refere-se às vendedoras ambulantes que percorrem as ruas angolanas.',
      },
    ],
  },
  {
    id: 'q4',
    title: 'Petróleo e Recursos Naturais de Angola',
    description: 'Questões sobre a indústria petrolífera angolana, a Sonangol, a maldição dos recursos e o impacto no desenvolvimento económico.',
    category: 'Recursos Naturais',
    difficulty: 'medio',
    thumbnail: 'https://images.unsplash.com/photo-1734254807102-fbf62b0cc513?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    estimatedTime: '10 min',
    participants: 2980,
    status: 'published',
    questions: [
      {
        id: 'q4q1',
        question: 'Em que década foi descoberto petróleo em Angola?',
        options: ['1940s', '1950s', '1960s', '1970s'],
        correctIndex: 1,
        explanation: 'O petróleo foi descoberto em Angola na região de Cabinda durante a década de 1950, embora a exploração em grande escala só tenha acontecido depois.',
      },
      {
        id: 'q4q2',
        question: 'Que percentagem das exportações angolanas representa o petróleo?',
        options: ['Cerca de 50%', 'Cerca de 70%', 'Mais de 90%', 'Cerca de 85%'],
        correctIndex: 2,
        explanation: 'O petróleo representa mais de 90% das exportações angolanas, evidenciando a extrema dependência desta matéria-prima.',
      },
      {
        id: 'q4q3',
        question: 'Qual é o nome da empresa estatal petrolífera de Angola?',
        options: ['Petrangol', 'CABGOC', 'Sonangol', 'Petrodiamond'],
        correctIndex: 2,
        explanation: 'A Sonangol (Sociedade Nacional de Combustíveis de Angola) é a empresa estatal petrolífera, criada em 1976.',
      },
      {
        id: 'q4q4',
        question: 'O que é a "doença holandesa" no contexto económico?',
        options: ['Uma epidemia que afetou trabalhadores das minas', 'O processo pelo qual um setor exportador dominante prejudica outros setores', 'Uma política económica adotada na Holanda', 'O declínio da indústria devido a problemas climáticos'],
        correctIndex: 1,
        explanation: 'A "doença holandesa" é o processo pelo qual um setor exportador dominante (como o petróleo) valoriza a moeda nacional, tornando outros setores menos competitivos.',
      },
      {
        id: 'q4q5',
        question: 'Em que ano foi criado o Processo de Kimberley para certificação de diamantes?',
        options: ['1999', '2001', '2003', '2005'],
        correctIndex: 2,
        explanation: 'O Processo de Kimberley foi criado em 2003 para certificar que os diamantes comercializados não financiam conflitos armados.',
      },
    ],
  },
];

export const FORUM_POSTS: ForumPost[] = [
  {
    id: 'f1',
    title: 'Como a hiperinflação de 1996 afetou a sua família? Partilhe a sua experiência',
    content: `Estou a fazer uma investigação sobre o impacto da hiperinflação angolana nas famílias comuns durante a década de 1990.

Quem viveu esse período sabe o quanto foi difícil. Há relatos de pessoas que corriam ao mercado logo após receber o salário porque no dia seguinte o dinheiro já não valia o mesmo.

Gostaria de recolher testemunhos e experiências pessoais para complementar a análise académica com a perspetiva humana. Que histórias têm para partilhar? Como é que a vossa família sobreviveu a esse período?

É importante documentar estas memórias para que as gerações futuras compreendam o que se passou e possam tomar decisões mais informadas.`,
    authorId: 'u1',
    category: 'Inflação',
    likes: 287,
    views: 3420,
    publishedAt: '2024-03-10',
    isPinned: true,
    tags: ['hiperinflação', 'memória histórica', 'testemunho'],
    status: 'published',
    isPrivate: false,
    approvedUsers: [],
    replies: [
      {
        id: 'r1',
        content: 'O meu pai conta que comprava sacos de farinha logo ao acordar porque até ao fim do dia o preço já tinha mudado. Era uma loucura total. As lojas às vezes nem colocavam preços porque mudavam a toda a hora.',
        authorId: 'u2',
        publishedAt: '2024-03-11',
        likes: 45,
      },
      {
        id: 'r2',
        content: 'Na minha família, o avô guardava dólares americanos debaixo do colchão. Era a única forma de preservar algum valor. O kwanza não servia para nada além de compras imediatas.',
        authorId: 'u3',
        publishedAt: '2024-03-12',
        likes: 67,
      },
      {
        id: 'r3',
        content: 'Excelente iniciativa! Estes testemunhos são fundamentais para a memória histórica. Convido todos a partilharem também no projeto de arquivo oral que estamos a desenvolver na Universidade Agostinho Neto.',
        authorId: 'u1',
        publishedAt: '2024-03-13',
        likes: 32,
      },
    ],
  },
  {
    id: 'f2',
    title: 'Os musseques de Luanda: problema ou solução? Debate aberto',
    content: `Há quem veja os musseques como problema a resolver (falta de infraestruturas, ilegalidade, pobreza). Há quem os veja como solução orgânica (habitação acessível, comunidade, economia informal vital).

Qual é a vossa perspetiva? Os musseques devem ser urbanizados e formalizados? Como?

Tenho estudado casos de urbanização de assentamentos informais noutros países africanos (Quénia, África do Sul) e as lições são ambíguas: a formalização pode resolver problemas mas também pode destruir as redes sociais e económicas que sustentam as comunidades.

O que acham? Quem vive nos musseques, qual é a vossa experiência?`,
    authorId: 'u2',
    category: 'Urbanização',
    likes: 193,
    views: 2870,
    publishedAt: '2024-02-25',
    isPinned: false,
    tags: ['musseque', 'urbanização', 'luanda', 'habitação'],
    status: 'published',
    isPrivate: false,
    approvedUsers: [],
    replies: [
      {
        id: 'r4',
        content: 'Os musseques são a nossa identidade! Fui criado no Cazenga e não trocava por nada. É claro que precisamos de água, eletricidade e saneamento, mas a comunidade que existe lá não pode ser destruída.',
        authorId: 'u3',
        publishedAt: '2024-02-26',
        likes: 89,
      },
      {
        id: 'r5',
        content: 'Concordo que a identidade é importante, mas precisamos ser realistas: sem saneamento básico, doenças como a cólera continuam a ceifar vidas. A dignidade também se mede pelo acesso a infraestruturas básicas.',
        authorId: 'u1',
        publishedAt: '2024-02-27',
        likes: 54,
      },
    ],
  },
  {
    id: 'f3',
    title: 'Debate: A dependência do petróleo é inevitável para Angola?',
    content: `Com as reservas petrolíferas a diminuir e os preços internacionais voláteis, Angola precisa urgentemente de diversificar a sua economia.

Mas será possível? Que setores têm potencial real? A agricultura? O turismo? As energias renováveis? A manufatura?

Partilhe a sua análise e as suas ideias. Precisamos de um debate sério sobre o futuro económico de Angola, sem os habituais discursos vazios.

Alguns pontos para reflexão:
- Angola tem 35 milhões de hectares de terra arável subutilizada
- O país tem potencial turístico enorme mas infraestruturas precárias
- A população jovem e crescente é um ativo se bem formada`,
    authorId: 'u3',
    category: 'Recursos Naturais',
    likes: 241,
    views: 3150,
    publishedAt: '2024-03-18',
    isPinned: false,
    tags: ['petróleo', 'diversificação', 'desenvolvimento', 'angola 2050'],
    status: 'published',
    isPrivate: true,
    approvedUsers: ['u1', 'u3'],
    replies: [
      {
        id: 'r6',
        content: 'O turismo tem potencial imenso! As quedas de Kalandula são das maiores de África e quase ninguém sabe. O Parque Nacional da Kissama está a uma hora de Luanda. Falta investimento em infraestruturas e promoção.',
        authorId: 'u1',
        publishedAt: '2024-03-19',
        likes: 76,
      },
      {
        id: 'r7',
        content: 'A agricultura é fundamental. Com solos férteis e boa pluviosidade no Planalto Central, podemos alimentar o país e exportar. Mas precisamos de reforma agrária séria, crédito rural e formação dos agricultores.',
        authorId: 'u2',
        publishedAt: '2024-03-20',
        likes: 98,
      },
    ],
  },
  {
    id: 'f4',
    title: 'Comparação: Angola vs outros países africanos pós-coloniais',
    content: `Gostaria de iniciar um debate comparativo: como o trajeto económico de Angola se compara com outros países africanos que passaram por situações similares?

Por exemplo:
- Moçambique teve guerra civil mas não tem petróleo
- Nigeria tem petróleo e problemas similares de dependência
- Botswana geriu bem os diamantes

O que podemos aprender com estas comparações? Que políticas funcionaram noutros contextos e poderiam ser adaptadas para Angola?`,
    authorId: 'u1',
    category: 'Desenvolvimento',
    likes: 156,
    views: 2100,
    publishedAt: '2024-04-01',
    isPinned: false,
    tags: ['comparação', 'africa', 'desenvolvimento', 'lições'],
    status: 'published',
    isPrivate: true,
    approvedUsers: ['u1'],
    replies: [
      {
        id: 'r8',
        content: 'O caso do Botswana é fascinante! Criaram um fundo soberano para as receitas dos diamantes e investiram em educação. Angola criou o FSDEA (Fundo Soberano) mas com menos transparência e eficiência.',
        authorId: 'u3',
        publishedAt: '2024-04-02',
        likes: 43,
      },
    ],
  },
];

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Carlos Mwangi',
    email: 'user@angola.ao',
    password: 'user123',
    avatar: 'https://images.unsplash.com/photo-1608052026785-0bc249c733e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    role: 'user',
    bio: 'Estudante de economia na UAN. Apaixonado pela história económica de Angola e pelos desafios do desenvolvimento africano.',
    subscriptions: ['a1', 'a2'],
    completedQuizzes: ['q3'],
    watchHistory: ['c1', 'c2', 'c8'],
    joinedAt: '2024-01-10',
    savedContent: ['c1', 'c6'],
    province: 'Luanda',
    isActive: true,
  },
  {
    id: 'u2',
    name: 'Maria Fernandes',
    email: 'maria@angola.ao',
    password: 'user456',
    avatar: 'https://images.unsplash.com/photo-1739300293504-234817eead52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    role: 'user',
    bio: 'Professora do ensino secundário em Benguela. Utilizo a plataforma como recurso pedagógico nas minhas aulas de história.',
    subscriptions: ['a4', 'a3'],
    completedQuizzes: ['q1', 'q2'],
    watchHistory: ['c3', 'c4', 'c5', 'c6'],
    joinedAt: '2024-02-05',
    savedContent: ['c4', 'c7'],
    province: 'Benguela',
    isActive: true,
  },
  {
    id: 'u3',
    name: 'António Sakala',
    email: 'antonio@angola.ao',
    password: 'user789',
    avatar: 'https://images.unsplash.com/photo-1602788484247-5c1190ca914c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    role: 'user',
    bio: 'Jornalista e investigador. Interesso-me pelo cruzamento entre história, economia e política em Angola.',
    subscriptions: ['a1', 'a4'],
    completedQuizzes: ['q1', 'q3', 'q4'],
    watchHistory: ['c1', 'c7', 'c9'],
    joinedAt: '2024-01-20',
    savedContent: ['c9', 'c10'],
    province: 'Huíla',
    isActive: true,
  },
  {
    id: 'admin1',
    name: 'Admin Sistema',
    email: 'admin@angola.ao',
    password: 'admin123',
    avatar: 'https://images.unsplash.com/photo-1602516807029-0d2b26a43766?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    role: 'admin',
    bio: 'Administrador da plataforma Economia com História Angola.',
    subscriptions: [],
    completedQuizzes: [],
    watchHistory: [],
    joinedAt: '2023-12-01',
    savedContent: [],
    province: 'Luanda',
    isActive: true,
  },
];

export const RANKING: RankingEntry[] = [
  { userId: 'u3', points: 2840, quizzesCompleted: 3, forumReplies: 12, badge: 'ouro' },
  { userId: 'u2', points: 2310, quizzesCompleted: 2, forumReplies: 9, badge: 'prata' },
  { userId: 'u1', points: 1650, quizzesCompleted: 1, forumReplies: 7, badge: 'bronze' },
  { userId: 'admin1', points: 890, quizzesCompleted: 0, forumReplies: 2, badge: 'participante' },
];

export function getAuthorById(id: string): Author | undefined {
  return AUTHORS.find(a => a.id === id);
}

export function getUserById(id: string): User | undefined {
  return MOCK_USERS.find(u => u.id === id);
}

export function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  if (days < 7) return `há ${days} dias`;
  if (days < 30) return `há ${Math.floor(days / 7)} semanas`;
  if (days < 365) return `há ${Math.floor(days / 30)} meses`;
  return `há ${Math.floor(days / 365)} anos`;
}
