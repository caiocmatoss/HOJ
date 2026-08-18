export type Venue = {
  id: string;

  name: string;

  category: string;

  address: string;

  latitude: number;

  longitude: number;

  occupancy: number;

  description: string;

  image: string;

  rating: number;

  distance: string;

  people: number;

  gallery: string[];

  dj: string;

  promotion: string;

  playlist: string;

  status: "open" | "closed";
};

export const venues: Venue[] = [
  {
    id: "1",

    name: "Cinemark XD",

    category: "Cinema",

    address: "Shopping Central",

    latitude: -23.55052,

    longitude: -46.633308,

    occupancy: 72,

    description:
      "Sala de cinema imersiva com tela gigante e experiência audiovisual premium.",

    image:
      "https://picsum.photos/500/300?random=101",

    rating: 4.8,

    distance: "2.5 km",

    people: 85,

    gallery: [
      "https://picsum.photos/500/301?random=111",
      "https://picsum.photos/500/302?random=112",
    ],

    dj: "Não",

    promotion:
      "Meia-entrada disponível hoje",

    playlist:
      "Trilhas de filmes",

    status: "open",
  },

  {
    id: "2",

    name: "Casa de Shows",

    category: "Música",

    address: "Centro",

    latitude: -23.561414,

    longitude: -46.655881,

    occupancy: 88,

    description:
      "Espaço para eventos, shows, DJs e música ao vivo durante toda a noite.",

    image:
      "https://picsum.photos/501/300?random=102",

    rating: 4.6,

    distance: "4.1 km",

    people: 220,

    gallery: [
      "https://picsum.photos/501/301?random=121",
      "https://picsum.photos/501/302?random=122",
    ],

    dj: "DJ Alex",

    promotion:
      "Entrada promocional até as 22h",

    playlist:
      "Eletrônica e Pop",

    status: "open",
  },

  {
    id: "3",

    name: "Hamburgueria Central",

    category: "Gastronomia",

    address: "Avenida Principal",

    latitude: -23.5489,

    longitude: -46.6388,

    occupancy: 56,

    description:
      "Hamburgueria com drinks, música ambiente e espaço para encontros e rolês.",

    image:
      "https://picsum.photos/502/300?random=103",

    rating: 4.7,

    distance: "1.8 km",

    people: 45,

    gallery: [
      "https://picsum.photos/502/301?random=131",
      "https://picsum.photos/502/302?random=132",
    ],

    dj: "Não",

    promotion:
      "Combo especial de hambúrguer e bebida",

    playlist:
      "Rock e acústico",

    status: "open",
  },

  {
    id: "4",

    name: "Club Downtown",

    category: "Festa",

    address: "Rua Augusta",

    latitude: -23.5557,

    longitude: -46.6583,

    occupancy: 93,

    description:
      "Balada com pista principal, DJs convidados, drinks e programação até de madrugada.",

    image:
      "https://picsum.photos/503/300?random=104",

    rating: 4.5,

    distance: "3.2 km",

    people: 310,

    gallery: [
      "https://picsum.photos/503/301?random=141",
      "https://picsum.photos/503/302?random=142",
    ],

    dj: "DJ Marina",

    promotion:
      "Entrada reduzida até meia-noite",

    playlist:
      "House, Funk e Pop",

    status: "open",
  },

  {
    id: "5",

    name: "Bar do Zé",

    category: "Bares",

    address: "Vila Madalena",

    latitude: -23.5561,

    longitude: -46.6907,

    occupancy: 81,

    description:
      "Bar descontraído com samba ao vivo, petiscos, cerveja gelada e ambiente para grupos.",

    image:
      "https://picsum.photos/504/300?random=105",

    rating: 4.7,

    distance: "0.8 km",

    people: 140,

    gallery: [
      "https://picsum.photos/504/301?random=151",
      "https://picsum.photos/504/302?random=152",
    ],

    dj: "Não",

    promotion:
      "Caipirinha em dobro até as 21h",

    playlist:
      "Samba e Pagode",

    status: "open",
  },
];