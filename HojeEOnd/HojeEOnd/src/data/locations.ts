export type UserLocation = {

  userId:string;

  latitude:number;

  longitude:number;

  updatedAt:string;

};



export const locations:UserLocation[] = [

  {

    userId:"1",

    latitude:-23.5505,

    longitude:-46.6333,

    updatedAt:
    new Date().toISOString(),

  }

];