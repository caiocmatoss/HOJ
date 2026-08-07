import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
} from "react-native";


import {
  useInviteStore,
} from "@/store/invite-store";


import {
  useGroupStore,
} from "@/store/group-store";



export default function InvitesScreen(){



  const {

    invites,

    acceptInvite,

    rejectInvite,

  } = useInviteStore();





  const {

    joinGroup,

  } = useGroupStore();







  function handleAccept(

    inviteId:string,

    groupId:string,

    userId:string

  ){


    acceptInvite(inviteId);



    joinGroup(

      groupId,

      userId

    );


  }







  return (


    <View style={styles.container}>


      <Text style={styles.title}>

        🔔 Convites

      </Text>





      <FlatList


        data={invites}



        keyExtractor={(item)=>

          item.id

        }



        renderItem={({item})=>(


          <View style={styles.card}>


            <Text style={styles.text}>


              🎉 Convite para grupo


            </Text>





            <Text style={styles.info}>


              Grupo: {item.groupId}


            </Text>





            <Pressable


              style={styles.accept}


              onPress={()=>


                handleAccept(

                  item.id,

                  item.groupId,

                  item.toUserId

                )


              }


            >


              <Text style={styles.acceptText}>

                Aceitar

              </Text>


            </Pressable>






            <Pressable


              style={styles.reject}


              onPress={()=>


                rejectInvite(item.id)

              }


            >


              <Text style={styles.rejectText}>

                Recusar

              </Text>


            </Pressable>



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


  fontSize:28,


  fontWeight:"800",


  marginBottom:25,


},




card:{


  backgroundColor:"#1B1B1B",


  padding:20,


  borderRadius:18,


  marginBottom:15,


},




text:{


  color:"#FFFFFF",


  fontSize:18,


  fontWeight:"700",


},




info:{


  color:"#AAAAAA",


  marginTop:10,


},




accept:{


  backgroundColor:"#FFC400",


  padding:14,


  borderRadius:14,


  marginTop:20,


},




acceptText:{


  color:"#000",


  textAlign:"center",


  fontWeight:"700",


},




reject:{


  borderWidth:1,


  borderColor:"#FF5555",


  padding:14,


  borderRadius:14,


  marginTop:10,


},




rejectText:{


  color:"#FF5555",


  textAlign:"center",


},



});