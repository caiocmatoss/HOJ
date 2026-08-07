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

    latitude: -23.550520,

    longitude: -46.633308,

    occupancy: 120,

    description: "Sala de cinema imersiva com tela gigante.",

    image: "https://picsum.photos/500/300",

    rating: 4.8,

    distance: "2.5 km",

    people: 85,

    gallery: [

      "https://picsum.photos/500/301",

      "https://picsum.photos/500/302"

    ],

    dj: "Não",

    promotion: "Meia entrada hoje",

    playlist: "Trilhas de filmes",

    status: "open",

  },



  {

    id: "2",

    name: "Casa de Shows",

    category: "Música",

    address: "Centro",

    latitude: -23.561414,

    longitude: -46.655881,

    occupancy: 350,

    description: "Espaço para eventos e música ao vivo.",

    image: "https://picsum.photos/501/300",

    rating: 4.6,

    distance: "4.1 km",

    people: 220,

    gallery: [

      "https://picsum.photos/501/301",

      "https://picsum.photos/501/302"

    ],

    dj: "DJ Alex",

    promotion: "Entrada promocional",

    playlist: "Eletrônica e Pop",

    status: "open",

  },



  {

    id: "3",

    name: "Hamburgueria Central",

    category: "Comida",

    address: "Avenida Principal",

    latitude: -23.548900,

    longitude: -46.638800,

    occupancy: 80,

    description: "Hamburgueria para encontros e rolês.",

    image: "https://picsum.photos/502/300",

    rating: 4.7,

    distance: "1.8 km",

    people: 45,

    gallery: [

      "https://picsum.photos/502/301",

      "https://picsum.photos/502/302"

    ],

    dj: "Não",

    promotion: "Combo especial",

    playlist: "Rock e acústico",

    status: "open",

  },


];