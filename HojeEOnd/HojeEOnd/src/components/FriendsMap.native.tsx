import {
  useEffect,
  useState,
} from "react";

import {
  View,
  StyleSheet,
  Text,
} from "react-native";


import MapView, {
  Marker,
  Region,
} from "react-native-maps";


import {
  friends,
} from "@/data/friends";


import {
  useLocationStore,
} from "@/store/location-store";


import {
  usePresenceStore,
} from "@/store/presence-store";


import {
  calculateDistance,
} from "@/utils/distance";



export default function FriendsMap() {


  const {
    latitude,
    longitude,
  } = useLocationStore();



  const {
    visible,
  } = usePresenceStore();



  const [region, setRegion] =
    useState<Region | null>(null);





  useEffect(() => {


    if(

      latitude !== null &&

      longitude !== null

    ){


      setRegion({

        latitude,

        longitude,

        latitudeDelta:0.01,

        longitudeDelta:0.01,

      });


    }


  },[

    latitude,

    longitude

  ]);






  if(

    region === null ||

    latitude === null ||

    longitude === null

  ){


    return (

      <View style={styles.loading}>


        <Text style={styles.loadingText}>

          Aguardando localização...

        </Text>


      </View>

    );

  }







  return (


    <MapView


      style={styles.map}


      region={region}


      showsUserLocation


      showsMyLocationButton


    >




      {
        visible && (


          <Marker


            coordinate={{


              latitude,

              longitude,


            }}



            title="Você"


            description="Sua localização atual"



          />


        )

      }








      {

        friends.map(friend => {


          const friendLatitude =

            latitude +

            Number(friend.id) *

            0.001;





          const friendLongitude =

            longitude +

            Number(friend.id) *

            0.001;






          const distance =

            calculateDistance(


              latitude,


              longitude,


              friendLatitude,


              friendLongitude


            );







          return (



            <Marker


              key={friend.id}



              coordinate={{


                latitude:
                friendLatitude,


                longitude:
                friendLongitude,


              }}



              title={friend.name}



              description={

                `${distance} metros de você`

              }



            />


          );



        })

      }




    </MapView>


  );

}





const styles = StyleSheet.create({



  map:{


    flex:1,


  },





  loading:{


    flex:1,


    backgroundColor:"#090909",


    justifyContent:"center",


    alignItems:"center",


  },





  loadingText:{


    color:"#FFFFFF",


    fontSize:18,


  },



});