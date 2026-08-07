import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
} from "react-native";


import {
  useLocalSearchParams,
  router,
} from "expo-router";


import {
  friends,
} from "@/data/friends";


import {
  useInviteStore,
} from "@/store/invite-store";



export default function GroupInviteScreen(){



  const {
    groupId,
  } = useLocalSearchParams();





  const {
    sendInvite,
  } = useInviteStore();







  function handleInvite(userId:string){



    sendInvite({


      id:

      Date.now().toString(),



      groupId:

      String(groupId),



      fromUserId:

      "1",



      toUserId:

      userId,



      status:

      "pending",



    });



  }






  return (


    <View style={styles.container}>


      <Text style={styles.title}>

        👥 Convidar amigos

      </Text>





      <FlatList


        data={friends}


        keyExtractor={(item)=>

          item.id

        }



        renderItem={({item})=>(



          <View style={styles.card}>


            <Text style={styles.name}>

              🟢 {item.name}

            </Text>





            <Pressable

              style={styles.button}


              onPress={()=>

                handleInvite(item.id)

              }


            >


              <Text style={styles.buttonText}>

                Enviar convite

              </Text>


            </Pressable>



          </View>



        )}



      />





      <Pressable

        style={styles.back}


        onPress={()=>router.back()}


      >

        <Text style={styles.backText}>

          Voltar

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


},





title:{


  color:"#FFC400",


  fontSize:26,


  fontWeight:"800",


  marginBottom:25,


},





card:{


  backgroundColor:"#1B1B1B",


  padding:18,


  borderRadius:16,


  marginBottom:15,


},





name:{


  color:"#FFFFFF",


  fontSize:18,


  fontWeight:"700",


},





button:{


  backgroundColor:"#FFC400",


  padding:12,


  borderRadius:12,


  marginTop:12,


},





buttonText:{


  color:"#000",


  textAlign:"center",


  fontWeight:"700",


},





back:{


  marginTop:15,


},





backText:{


  color:"#FFC400",


  textAlign:"center",


},



});