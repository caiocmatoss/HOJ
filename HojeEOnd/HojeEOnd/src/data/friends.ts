export type Friend = {

  id: string;

  name: string;

  avatar: string;

  status: "online" | "offline";

};





export const friends: Friend[] = [


  {

    id:"2",

    name:"Ana",

    avatar:"https://i.pravatar.cc/150?img=32",

    status:"online",

  },



  {

    id:"3",

    name:"João",

    avatar:"https://i.pravatar.cc/150?img=45",

    status:"offline",

  },



  {

    id:"4",

    name:"Marina",

    avatar:"https://i.pravatar.cc/150?img=47",

    status:"online",

  },



];