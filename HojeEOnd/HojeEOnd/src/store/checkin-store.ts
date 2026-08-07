import { create } from "zustand";


type CheckinStore = {

  currentVenue: string | null;


  checkin: (
    venueId: string
  ) => void;


  checkout: () => void;

};



export const useCheckinStore = create<CheckinStore>(

  (set) => ({

    currentVenue: null,


    checkin: (venueId: string) =>

      set({

        currentVenue: venueId,

      }),



    checkout: () =>

      set({

        currentVenue: null,

      }),


  })

);