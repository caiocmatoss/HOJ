import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from "react-native";


import {
  friends,
} from "@/data/friends";


import {
  useLocationStore,
} from "@/store/location-store";


import {
  calculateDistance,
} from "@/utils/distance";




export default function NearbyFriends(){



  const {

    latitude,

    longitude,

  } = useLocationStore();






  if(

    latitude === null ||

    longitude === null

  ){


    return (

      <View style={styles.container}>


        <Text style={styles.loading}>

          Aguardando localização...

        </Text>


      </View>

    );


  }





  const nearbyFriends = friends.map(friend=>{


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





    return {

      ...friend,

      distance,

    };


  })



  .sort(

    (a,b)=>

      a.distance -

      b.distance

  );







  return (


    <View style={styles.container}>


      <Text style={styles.title}>

        👥 Amigos perto de você

      </Text>






      <FlatList


        data={nearbyFriends}



        keyExtractor={item=>

          item.id.toString()

        }



        renderItem={({item})=>(



          <View style={styles.card}>


            <Text style={styles.name}>


              🟢 {item.name}


            </Text>




            <Text style={styles.distance}>


              {item.distance} metros de você


            </Text>



          </View>



        )}


      />


    </View>


  );



}





const styles = StyleSheet.create({



container:{


  flex:1,


  backgroundColor:"#090909",


  padding:20,


},





title:{


  color:"#FFC400",


  fontSize:22,


  fontWeight:"800",


  marginBottom:20,


},





card:{


  backgroundColor:"#1B1B1B",


  padding:18,


  borderRadius:16,


  marginBottom:12,


},





name:{


  color:"#FFFFFF",


  fontSize:18,


  fontWeight:"700",


},





distance:{


  color:"#AAAAAA",


  marginTop:8,


},





loading:{


  color:"#FFFFFF",


  fontSize:18,


},



});