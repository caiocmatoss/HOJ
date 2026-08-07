import {
  useEffect,
} from "react";


import * as Location from "expo-location";


import {
  useLocationStore,
} from "@/store/location-store";


import {
  usePresenceStore,
} from "@/store/presence-store";




export default function LocationTracker(){



  const {
    updateLocation,
  } = useLocationStore();




  const {
    updatePosition,
  } = usePresenceStore();





  useEffect(()=>{


    let subscription:any;




    async function startTracking(){



      const permission =

      await Location.requestForegroundPermissionsAsync();





      if(permission.status !== "granted"){

        return;

      }






      subscription =

      await Location.watchPositionAsync(


        {


          accuracy:
          Location.Accuracy.High,



          timeInterval:5000,



          distanceInterval:10,


        },



        location=>{



          const latitude =
          location.coords.latitude;



          const longitude =
          location.coords.longitude;





          updateLocation(

            latitude,

            longitude

          );




          updatePosition(

            latitude,

            longitude

          );



        }


      );



    }





    startTracking();





    return ()=>{


      if(subscription){

        subscription.remove();

      }


    };



  },[]);





  return null;


}