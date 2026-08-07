import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";


import {
  useState,
  useRef,
} from "react";


import {
  useLocalSearchParams,
} from "expo-router";


import {
  useChatStore,
} from "@/store/chat-store";


import {
  formatTime,
} from "@/utils/time";



export default function GroupChatScreen(){



  const {
    id,
  } = useLocalSearchParams();





  const {

    messages,

    sendMessage,

  } = useChatStore();





  const [text,setText] =

    useState("");





  const flatListRef =

    useRef<FlatList>(null);





  const groupMessages =

    messages.filter(

      message =>

      message.groupId === String(id)

    );






  function handleSend(){


    if(text.trim()===""){

      return;

    }





    sendMessage({



      id:

      Date.now().toString(),




      groupId:

      String(id),




      userId:

      "1",




      userName:

      "Caio",




      text:

      text.trim(),




      createdAt:

      new Date().toISOString(),



    });





    setText("");



  }







  return (


    <KeyboardAvoidingView


      style={styles.container}


      behavior={

        Platform.OS === "ios"

        ?

        "padding"

        :

        undefined

      }


    >





      <FlatList


        ref={flatListRef}



        data={groupMessages}



        keyExtractor={(item)=>

          item.id

        }



        onContentSizeChange={()=>


          flatListRef.current?.scrollToEnd({

            animated:true

          })


        }



        renderItem={({item})=>{



          const mine =

          item.userId === "1";





          return (


            <View

              style={

                mine

                ?

                styles.myMessage

                :

                styles.message

              }


            >



              <Text style={styles.user}>


                {item.userName}


              </Text>





              <Text style={styles.text}>


                {item.text}


              </Text>





              <Text style={styles.time}>


                {formatTime(item.createdAt)}


              </Text>



            </View>



          );


        }}



      />







      <View style={styles.inputArea}>


        <TextInput


          style={styles.input}


          value={text}


          onChangeText={setText}


          placeholder="Digite uma mensagem..."

          placeholderTextColor="#888"


        />





        <Pressable


          style={styles.button}


          onPress={handleSend}


        >


          <Text style={styles.buttonText}>


            Enviar


          </Text>


        </Pressable>



      </View>





    </KeyboardAvoidingView>


  );

}





const styles = StyleSheet.create({



container:{


  flex:1,


  backgroundColor:"#090909",


  padding:20,


},




message:{


  backgroundColor:"#1B1B1B",


  padding:15,


  borderRadius:15,


  marginBottom:12,


},




myMessage:{


  backgroundColor:"#FFC400",


  padding:15,


  borderRadius:15,


  marginBottom:12,


  alignSelf:"flex-end",


},




user:{


  color:"#FFC400",


  fontWeight:"700",


},




text:{


  color:"#FFFFFF",


  marginTop:5,


},




time:{


  color:"#AAAAAA",


  fontSize:12,


  marginTop:8,


},




inputArea:{


  flexDirection:"row",


  alignItems:"center",


},




input:{


  flex:1,


  backgroundColor:"#FFFFFF",


  borderRadius:14,


  padding:14,


  color:"#000000",


},




button:{


  backgroundColor:"#FFC400",


  padding:14,


  borderRadius:14,


  marginLeft:10,


},




buttonText:{


  color:"#000000",


  fontWeight:"700",


},



});