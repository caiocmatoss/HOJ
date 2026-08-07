import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";


import {
  useLocalSearchParams,
  router,
} from "expo-router";


import {
  useState,
} from "react";


import {
  groups,
} from "@/data/groups";



export default function GroupDetailsScreen(){



  const {

    id,

  } = useLocalSearchParams();





  const group = groups.find(

    item =>

    item.id === String(id)

  );





  const [joined,setJoined] =

    useState(false);





  if(!group){


    return (

      <View style={styles.container}>


        <Text style={styles.text}>

          Grupo não encontrado

        </Text>


      </View>

    );


  }







  return (

    <View style={styles.container}>


      <Text style={styles.title}>

        {group.name}

      </Text>





      <Text style={styles.text}>

        📍 Local: {group.venueId}

      </Text>





      <Text style={styles.text}>

        👥 Participantes: {group.members.length}

      </Text>







      <Pressable

        style={styles.button}

        onPress={()=>


          setJoined(!joined)


        }

      >


        <Text style={styles.buttonText}>

          {joined

          ?

          "Sair do grupo"

          :

          "Entrar no grupo"

          }

        </Text>


      </Pressable>







      <Pressable

        style={styles.chatButton}

        onPress={()=>


          router.push({

            pathname:"/(main)/chat/[id]",

            params:{

              id:String(id),

            },

          })


        }

      >


        <Text style={styles.buttonText}>

          💬 Abrir chat

        </Text>


      </Pressable>



    </View>

  );

}





const styles = StyleSheet.create({



container:{


  flex:1,


  backgroundColor:"#090909",


  padding:20,


  justifyContent:"center",


},




title:{


  color:"#FFC400",


  fontSize:30,


  fontWeight:"800",


},




text:{


  color:"#FFFFFF",


  fontSize:18,


  marginTop:15,


},




button:{


  backgroundColor:"#FFC400",


  padding:16,


  borderRadius:14,


  marginTop:30,


},




chatButton:{


  backgroundColor:"#FFFFFF",


  padding:16,


  borderRadius:14,


  marginTop:15,


},




buttonText:{


  color:"#000000",


  textAlign:"center",


  fontWeight:"700",


},



});