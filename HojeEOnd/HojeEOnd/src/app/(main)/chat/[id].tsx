import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
} from "react-native";


import {
  useLocalSearchParams,
} from "expo-router";


import {
  useState,
} from "react";


import {
  messages,
  Message,
} from "@/data/messages";



export default function ChatScreen(){



  const {

    id,

  } = useLocalSearchParams();





  const [messageList,setMessageList] =

    useState<Message[]>(

      messages.filter(

        item =>

        item.groupId === String(id)

      )

    );





  const [text,setText] =

    useState("");







  function sendMessage(){


    if(!text.trim()) return;





    const newMessage:Message = {


      id:

      Date.now().toString(),



      groupId:

      String(id),



      userId:

      "1",



      userName:

      "Caio",



      text,



      createdAt:

      new Date().toISOString(),


    };





    setMessageList([

      ...messageList,

      newMessage,

    ]);





    setText("");



  }







  return (

    <View style={styles.container}>


      <FlatList


        data={messageList}



        keyExtractor={(item)=>

          item.id

        }



        renderItem={({item})=>(



          <View style={styles.message}>


            <Text style={styles.user}>

              {item.userName}

            </Text>




            <Text style={styles.text}>

              {item.text}

            </Text>



          </View>



        )}



      />







      <View style={styles.inputArea}>


        <TextInput


          value={text}


          onChangeText={setText}


          placeholder="Digite uma mensagem"


          placeholderTextColor="#888"


          style={styles.input}


        />





        <Pressable


          style={styles.send}


          onPress={sendMessage}


        >


          <Text style={styles.sendText}>

            Enviar

          </Text>


        </Pressable>



      </View>



    </View>

  );

}





const styles = StyleSheet.create({



container:{


  flex:1,


  backgroundColor:"#090909",


  padding:15,


},




message:{


  backgroundColor:"#1B1B1B",


  padding:15,


  borderRadius:15,


  marginBottom:10,


},




user:{


  color:"#FFC400",


  fontWeight:"700",


},




text:{


  color:"#FFFFFF",


  marginTop:5,


},




inputArea:{


  flexDirection:"row",


  alignItems:"center",


},




input:{


  flex:1,


  backgroundColor:"#FFFFFF",


  borderRadius:12,


  padding:12,


  color:"#000000",


},




send:{


  backgroundColor:"#FFC400",


  padding:12,


  borderRadius:12,


  marginLeft:10,


},




sendText:{


  color:"#000000",


  fontWeight:"700",


},



});