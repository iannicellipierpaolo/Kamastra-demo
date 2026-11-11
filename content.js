/**
 * Contenuti centralizzati della prima versione.
 * Prezzi, allergeni e disponibilità non sono inventati.
 * Un CMS potrà restituire la stessa struttura attraverso un adapter.
 */
export const settings = {
  restaurant: "Kamastra",
  phone: "+39 0981 73387",
  phoneLink: "+39098173387",
  email: "info@kamastra.net",
  address: "Piazza Municipio, 3/6 · 87010 Civita (CS)",
  booking: {
    mode: "demo",
    url: "",
    parameterNames: {
      date: "date",
      time: "time",
      guests: "guests",
    },
  },
  video: {
    desktop: "",
    mobile: "",
    poster: "assets/nonna-demo.webp",
  },
};

export const dishes = [
  {
    title: "Maccheroni\nal ferretto",
    image: "assets/IMG-0818_.webp",
    category: "primi",
    alt: "Maccheroni al sugo fotografati al ristorante Kamastra",
  },
  {
    title: "Il tagliere\ndi Kamastra",
    image: "assets/IMG-0859_.webp",
    category: "antipasti",
    alt: "Salumi, formaggi e vino sulla tavola di Kamastra",
  },
  {
    title: "La colazione\ndel pastore",
    image: "assets/IMG-0828_-1.webp",
    category: "secondi",
    alt: "Preparazione rustica servita nel pane al ristorante Kamastra",
  },
  {
    title: "Tagliatelle\ndella tradizione",
    image: "assets/IMG-0820_.webp",
    category: "primi",
    alt: "Tagliatelle al pomodoro sulla tavola del ristorante",
  },
];

export const categories = [
  {
    id: "antipasti",
    title: "Antipasti",
    illustration: "antipasti",
    introduction: "Il piacere di cominciare insieme.",
    items: [
      {
        name: "Il tagliere del territorio",
        description:
          "Una selezione di salumi e formaggi: composizione da confermare con il ristorante.",
        price: null,
        allergens: null,
      },
    ],
  },
  {
    id: "primi",
    title: "Primi piatti",
    illustration: "primi",
    introduction: "La pasta, le mani, la memoria.",
    items: [
      {
        name: "Maccheroni al ferretto",
        localName: "Rrashkatjel me mish derku",
        description:
          "Pasta al ferretto con carne di maiale, tra le specialità descritte sul sito Kamastra.",
        price: null,
        allergens: null,
      },
      {
        name: "Cavatelli alla nenesa",
        localName: "Strangùle me nenezë",
        description: "Cavatelli con la nenesa, erbetta orticacea del Pollino.",
        price: null,
        allergens: null,
      },
      {
        name: "Il piatto dei mietitori",
        localName: "Hullonjëra me bakalla e mulikat",
        description: "Tagliatelle al baccalà con mollicata e pepe rosso.",
        price: null,
        allergens: null,
      },
    ],
  },
  {
    id: "secondi",
    title: "Secondi piatti",
    illustration: "secondi",
    introduction: "Il tempo lento delle cose buone.",
    items: [
      {
        name: "Capretto al tegame",
        localName: "Kaciq te graza me dafin",
        description:
          "Capretto al tegame all’alloro, dalla tradizione gastronomica raccontata da Kamastra.",
        price: null,
        allergens: null,
      },
      {
        name: "La colazione del pastore",
        localName: "Kangariqra kothra e ve",
        description: "Uova strapazzate con peperoni e cotiche.",
        price: null,
        allergens: null,
      },
    ],
  },
  {
    id: "dolci",
    title: "Dolci",
    illustration: "dolci",
    introduction: "Un ultimo ricordo, prima di salutarci.",
    items: [
      {
        name: "I dolci di casa",
        description:
          "La selezione aggiornata sarà inserita dopo la conferma del menù da parte del ristorante.",
        price: null,
        allergens: null,
      },
    ],
  },
];

export const spreads = [
  {
    title: "Un paese, tante storie",
    note: "Tra le pietre di Civita, ogni incontro diventa un ricordo.",
    annotation: "Civita,\ncon calma.",
    images: [
      ["assets/civita-1.webp", "Il paesaggio di Civita"],
      ["assets/civita-2.webp", "Uno sguardo al territorio"],
      ["assets/civita-3.webp", "Tra le pietre e il paesaggio"],
      ["assets/civita-4.webp", "Il territorio di Civita"],
    ],
  },
  {
    title: "Nel cuore del Pollino",
    note: "Uno sguardo fuori. La natura, le rocce, la luce.",
    annotation: "Il nostro\norizzonte.",
    images: [
      ["assets/civita-5.webp", "Il paesaggio del territorio"],
      ["assets/civita-3.webp", "Civita e i suoi dintorni"],
      ["assets/civita-2.webp", "Una veduta del territorio"],
      ["assets/civita-1.webp", "Il paesaggio di Civita"],
    ],
  },
  {
    title: "La porta di casa",
    note: "Un’insegna, una porta aperta. Benvenuti da Kamastra.",
    annotation: "Accomodatevi.",
    images: [
      ["assets/Insegna_.webp", "L’insegna del ristorante Kamastra"],
      ["assets/IMG-0824_.webp", "Gli ambienti del ristorante"],
      ["assets/IMG-0834_.webp", "Un dettaglio di Kamastra"],
      ["assets/locale5g_.webp", "Il ristorante Kamastra"],
    ],
  },
  {
    title: "A tavola, insieme",
    note: "La cucina del territorio, nelle fotografie del ristorante.",
    annotation: "I sapori\ndi casa.",
    images: [
      ["assets/IMG-0859_.webp", "Il tagliere di Kamastra"],
      ["assets/IMG-0818_.webp", "La pasta al ferretto"],
      ["assets/IMG-0820_.webp", "Un piatto della tradizione"],
      ["assets/IMG-0828_-1.webp", "La colazione del pastore"],
    ],
  },
  {
    title: "Piccole cose da ricordare",
    note: "Gli oggetti e i dettagli custodiscono il carattere di un luogo.",
    annotation: "Un dettaglio\nalla volta.",
    images: [
      ["assets/Album2g_.webp", "Un oggetto nella sala di Kamastra"],
      ["assets/locale5g_.webp", "L’ambiente di Kamastra"],
      ["assets/Insegna_.webp", "L’insegna Kamastra"],
      ["assets/civita-4.webp", "Un paesaggio del territorio"],
    ],
  },
  {
    title: "Ci vediamo a Civita",
    note: "Chiudiamo l’album. La prossima pagina la scriviamo insieme.",
    annotation: "A presto,\na Civita.",
    images: [
      ["assets/civita-2.webp", "Il territorio di Civita"],
      ["assets/civita-5.webp", "Una veduta del paesaggio"],
      ["assets/IMG-0834_.webp", "Un dettaglio del ristorante"],
      ["assets/civita-1.webp", "Civita, Calabria"],
    ],
  },
];
