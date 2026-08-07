import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
} from "react-native";


import {
  router,
} from "expo-router";


import {
  useUserStore,
} from "@/store/user-store";


import {
  friends,
} from "@/data/friends";

import {
  favorites,
} from "@/data/favorites";

export default function ProfileScreen(){


  const {

    user,

    updateStatus,

  } = useUserStore();






  return (

    <View style={styles.container}>


      <Image

        source={{

          uri:user.avatar,

        }}

        style={styles.avatar}

      />





      <Text style={styles.name}>

        {user.name}

      </Text>





      <Text style={styles.status}>

        {user.status === "online"

          ?

          "🟢 Online"

          :

          "⚫ Offline"

        }

      </Text>





      <Text style={styles.bio}>

        {user.bio}

      </Text>







      <Pressable

        style={styles.button}

        onPress={()=>


          updateStatus(

            user.status === "online"

            ?

            "offline"

            :

            "online"

          )


        }

      >


        <Text style={styles.buttonText}>

          Alterar status

        </Text>


      </Pressable>







      <Pressable

        style={styles.button}

        onPress={()=>


          router.push("/(main)/edit-profile")


        }

      >


        <Text style={styles.buttonText}>

          ✏️ Editar perfil

        </Text>


      </Pressable>







      <View style={styles.card}>


        <Text style={styles.info}>

          👥 Amigos: {friends.length}

        </Text>




        <Text style={styles.info}>

          🎉 Grupos: {user.groupsCount}

        </Text>




        <Text style={styles.info}>

        ❤️ Favoritos: {favorites.length}

        </Text>



      </View>



    </View>

  );

}





const styles = StyleSheet.create({



container:{


  flex:1,


  backgroundColor:"#090909",


  alignItems:"center",


  justifyContent:"center",


  padding:20,


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




bio:{


  color:"#FFFFFF",


  fontSize:16,


  marginTop:15,


  textAlign:"center",


},




button:{


  width:"100%",


  backgroundColor:"#FFC400",


  padding:16,


  borderRadius:14,


  marginTop:15,


},




buttonText:{


  color:"#000000",


  textAlign:"center",


  fontWeight:"700",


},




card:{


  backgroundColor:"#1B1B1B",


  width:"100%",


  padding:20,


  borderRadius:18,


  marginTop:30,


},




info:{


  color:"#FFFFFF",


  fontSize:16,


  marginBottom:10,


},



});