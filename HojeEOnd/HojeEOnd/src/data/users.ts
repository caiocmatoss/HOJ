export type User = {

  id: string;

  name: string;

  avatar: string;

  status: "online" | "offline";

  bio: string;

  friendsCount: number;

  groupsCount: number;

  favoritesCount: number;

};




export const users: User[] = [


  {

    id: "1",

    name: "Caio",

    avatar: "https://i.pravatar.cc/150?img=12",

    status: "online",

    bio: "Procurando rolê hoje 🎧",

    friendsCount: 12,

    groupsCount: 4,

    favoritesCount: 8,

  },



  {

    id: "2",

    name: "Ana",

    avatar: "https://i.pravatar.cc/150?img=32",

    status: "online",

    bio: "Sempre pronta para um rolê ✨",

    friendsCount: 20,

    groupsCount: 6,

    favoritesCount: 15,

  },



  {

    id: "3",

    name: "João",

    avatar: "https://i.pravatar.cc/150?img=45",

    status: "offline",

    bio: "Curto música, eventos e diversão 🎵",

    friendsCount: 8,

    groupsCount: 3,

    favoritesCount: 5,

  },


];