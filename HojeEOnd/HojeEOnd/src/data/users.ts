export type User = {
  id: string;

  name: string;

  avatar: string;

  status:
    | "online"
    | "offline";

  bio: string;
};

export const users: User[] = [
  {
    id: "1",

    name: "Caio",

    avatar:
      "https://i.pravatar.cc/150?img=12",

    status:
      "online",

    bio:
      "Procurando rolê hoje 🎧",
  },

  {
    id: "2",

    name: "Ana",

    avatar:
      "https://i.pravatar.cc/150?img=32",

    status:
      "online",

    bio:
      "Sempre pronta para um rolê ✨",
  },

  {
    id: "3",

    name: "João",

    avatar:
      "https://i.pravatar.cc/150?img=45",

    status:
      "offline",

    bio:
      "Curto música, eventos e diversão 🎵",
  },
];