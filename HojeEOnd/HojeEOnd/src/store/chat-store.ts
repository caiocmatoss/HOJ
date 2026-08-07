import { create } from "zustand";


import {
  Message,
} from "@/data/messages";



type ChatStore = {


  messages:Message[];



  sendMessage:

  (message:Message)=>void;



  getGroupMessages:

  (groupId:string)=>Message[];



};





export const useChatStore =

create<ChatStore>((set,get)=>(


{


  messages:[],





  sendMessage:(message)=>



    set(state=>(


      {


        messages:[

          ...state.messages,

          message

        ]


      }


    )),








  getGroupMessages:(groupId)=>


    get()

    .messages

    .filter(

      message =>

      message.groupId === groupId

    ),



}

));