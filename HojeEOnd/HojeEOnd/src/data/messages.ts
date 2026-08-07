export type Message = {

  id:string;

  groupId:string;

  userId:string;

  userName:string;

  text:string;

  createdAt:string;

};





export const messages:Message[] = [


  {

    id:"1",

    groupId:"1",

    userId:"1",

    userName:"Caio",

    text:"Bora sair hoje? 🎧",

    createdAt:"2026-01-01",

  },



  {

    id:"2",

    groupId:"1",

    userId:"2",

    userName:"Ana",

    text:"Estou dentro! ✨",

    createdAt:"2026-01-01",

  },


];