export type Event = {
  id: string;
  title: string;
  image: string;
  venueId: string;
  venueName: string;
  date: string;
  time: string;
  category: string;
  description: string;
  price?: number;
  distance: string;
  attendees: number;
  isLive: boolean;
};

export const events: Event[] = [
  {
    id: "1",
    title: "Festival HOJÉ OND",
    image: "https://picsum.photos/500/300?random=1",
    venueId: "2",
    venueName: "Casa de Shows",
    date: "2026-08-14",
    time: "20:00",
    category: "Festival",
    description:
      "Uma noite com DJs, atrações ao vivo e muita energia para começar o fim de semana.",
    price: 80,
    distance: "4.1 km",
    attendees: 1200,
    isLive: false,
  },
  {
    id: "2",
    title: "Show de Rock",
    image: "https://picsum.photos/500/300?random=2",
    venueId: "2",
    venueName: "Casa de Shows",
    date: "2026-08-14",
    time: "22:30",
    category: "Música",
    description:
      "Show ao vivo com banda convidada, repertório de clássicos e novidades.",
    price: 60,
    distance: "4.1 km",
    attendees: 850,
    isLive: false,
  },
  {
    id: "3",
    title: "Noite de Samba",
    image: "https://picsum.photos/500/300?random=3",
    venueId: "5",
    venueName: "Bar do Zé",
    date: "2026-08-14",
    time: "21:00",
    category: "Festa",
    description:
      "Samba ao vivo, pista aberta e uma noite pensada para curtir com os amigos.",
    price: 0,
    distance: "0.8 km",
    attendees: 320,
    isLive: false,
  },
  {
    id: "4",
    title: "Noite Eletrônica",
    image: "https://picsum.photos/500/300?random=4",
    venueId: "2",
    venueName: "Casa de Shows",
    date: "2026-08-15",
    time: "23:00",
    category: "Música",
    description:
      "DJs convidados, música eletrônica e uma experiência de pista durante toda a noite.",
    price: 75,
    distance: "4.1 km",
    attendees: 950,
    isLive: true,
  },
  {
    id: "5",
    title: "Experiência Gastronômica",
    image: "https://picsum.photos/500/300?random=5",
    venueId: "3",
    venueName: "Hamburgueria Central",
    date: "2026-08-15",
    time: "19:30",
    category: "Gastronomia",
    description:
      "Menu especial, drinks e uma experiência gastronômica para aproveitar a noite.",
    price: 45,
    distance: "1.8 km",
    attendees: 180,
    isLive: false,
  },
];