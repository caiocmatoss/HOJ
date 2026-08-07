import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";

import {
  useState,
} from "react";

import {
  useChatStore,
} from "@/store/chat-store";



export default function ChatScreen() {


  const [text,setText] = useState("");



  const {

    messages,

    sendMessage

  } = useChatStore();




  function handleSend(){


    if(!text.trim()){

      return;

    }



sendMessage({

  id:
  Date.now().toString(),

  groupId:
  "1",

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

    <View style={styles.container}>


      <ScrollView

        style={styles.messages}

      >


        {

          messages.map(message=>(


            <View

              key={message.id}

              style={styles.message}

            >


              <Text style={styles.user}>
                Você
              </Text>


              <Text style={styles.text}>
                {message.text}
              </Text>


            </View>


          ))

        }


      </ScrollView>





      <View style={styles.inputArea}>


        <TextInput

          value={text}

          onChangeText={setText}

          placeholder="Digite uma mensagem..."

          placeholderTextColor="#777"

          style={styles.input}

        />



        <Pressable

          style={styles.send}

          onPress={handleSend}

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

  padding:20,

},



messages:{

  flex:1,

},



message:{

  backgroundColor:"#1B1B1B",

  padding:15,

  borderRadius:16,

  marginBottom:12,

},



user:{

  color:"#FFC400",

  fontWeight:"700",

},



text:{

  color:"#FFFFFF",

  marginTop:5,

  fontSize:16,

},



inputArea:{

  flexDirection:"row",

  alignItems:"center",

  marginTop:15,

},



input:{

  flex:1,

  backgroundColor:"#1B1B1B",

  color:"#FFFFFF",

  padding:15,

  borderRadius:15,

},



send:{

  backgroundColor:"#FFC400",

  padding:15,

  borderRadius:15,

  marginLeft:10,

},



sendText:{

  color:"#000",

  fontWeight:"700",

},


});