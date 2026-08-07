import { create } from "zustand";


import {
  Invite,
} from "@/data/invites";



type InviteStore = {


  invites:Invite[];



  sendInvite:

  (invite:Invite)=>void;



  acceptInvite:

  (inviteId:string)=>void;



  rejectInvite:

  (inviteId:string)=>void;



};





export const useInviteStore =

create<InviteStore>((set)=>(


{


  invites:[],





  sendInvite:(invite)=>

    set(state=>(


      {


        invites:[

          ...state.invites,

          invite

        ]


      }


    )),







  acceptInvite:(inviteId)=>

    set(state=>(


      {


        invites:

        state.invites.map(invite=>


          invite.id === inviteId

          ?

          {

            ...invite,

            status:"accepted",

          }


          :

          invite


        )


      }


    )),







  rejectInvite:(inviteId)=>

    set(state=>(


      {


        invites:

        state.invites.map(invite=>


          invite.id === inviteId

          ?

          {

            ...invite,

            status:"rejected",

          }


          :

          invite


        )


      }


    )),



}

));