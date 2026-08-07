import { create } from "zustand";


type LocationStore = {


  latitude:number | null;


  longitude:number | null;



  updateLocation:

  (

    latitude:number,

    longitude:number

  )=>void;



};



export const useLocationStore =

create<LocationStore>((set)=>(


{

  latitude:null,


  longitude:null,



  updateLocation:(latitude,longitude)=>

    set({

      latitude,

      longitude,

    }),


}

));