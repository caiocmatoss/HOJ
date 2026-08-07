import { create } from "zustand";



type PresenceStore = {


  visible:boolean;


  latitude:number | null;


  longitude:number | null;



  setVisible:(value:boolean)=>void;



  updatePosition:

  (

    latitude:number,

    longitude:number

  )=>void;



};




export const usePresenceStore =

create<PresenceStore>((set)=>(


{


  visible:true,


  latitude:null,


  longitude:null,



  setVisible:(value:boolean)=>

    set({

      visible:value,

    }),





  updatePosition:(latitude,longitude)=>

    set({

      latitude,

      longitude,

    }),



}

));