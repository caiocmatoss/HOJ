import {
  View,
  Text,
  StyleSheet,
  Image,
} from "react-native";


import {
  useLocalSearchParams,
} from "expo-router";


import {
  friends,
} from "@/data/friends";



export default function FriendProfileScreen(){



  const {

    id,

  } = useLocalSearchParams();





  const friend = friends.find(

    item =>

    item.id === String(id)

  );





  if(!friend){


    return (

      <View style={styles.container}>


        <Text style={styles.text}>

          Amigo não encontrado

        </Text>


      </View>

    );


  }






  return (

    <View style={styles.container}>


      <Image

        source={{

          uri:friend.avatar

        }}

        style={styles.avatar}

      />





      <Text style={styles.name}>

        {friend.name}

      </Text>





      <Text style={styles.status}>

        {friend.status === "online"

          ?

          "🟢 Online"

          :

          "⚫ Offline"

        }

      </Text>





    </View>

  );

}





const styles = StyleSheet.create({



container:{


  flex:1,


  backgroundColor:"#090909",


  alignItems:"center",


  justifyContent:"center",


},




avatar:{


  width:120,


  height:120,


  borderRadius:60,


},




name:{


  color:"#FFFFFF",


  fontSize:30,


  fontWeight:"800",


  marginTop:20,


},




status:{


  color:"#FFC400",


  fontSize:18,


  marginTop:10,


},




text:{


  color:"#FFFFFF",


  fontSize:18,


},



});