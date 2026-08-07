import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native";

import { useState } from "react";
import { router } from "expo-router";


export default function LoginScreen() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        HOJÉ OND
      </Text>


      <Text style={styles.subtitle}>
        Bem-vindo de volta
      </Text>


     <TextInput
 style={styles.input}
 placeholder="Email"
 placeholderTextColor="#777"
 value={email}
 onChangeText={setEmail}
/>


      <TextInput
 style={styles.input}
 placeholder="Senha"
 placeholderTextColor="#777"
 secureTextEntry
 value={password}
 onChangeText={setPassword}
/>


      <Pressable
        style={styles.button}
        onPress={() => {

  if(!email || !password){

    alert("Digite email e senha");

    return;
  }


  router.replace("/(main)/home");

}}
      >

        <Text style={styles.buttonText}>
          Entrar
        </Text>

      </Pressable>


      <Pressable
        onPress={() => router.push("/(auth)/register")}
      >

        <Text style={styles.register}>
          Criar uma conta
        </Text>

      </Pressable>


    </View>

  );
}


const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#0F0F0F",
    justifyContent:"center",
    alignItems:"center",
    padding:24,
  },


  title:{
    fontSize:40,
    fontWeight:"bold",
    color:"#FFD54F",
    marginBottom:10,
  },


  subtitle:{
    color:"#FFF",
    fontSize:18,
    marginBottom:40,
  },


  input:{
    width:"100%",
    backgroundColor:"#1B1B1B",
    color:"#FFF",
    padding:16,
    borderRadius:14,
    marginBottom:15,
  },


  button:{
    width:"100%",
    backgroundColor:"#FFC400",
    padding:18,
    borderRadius:14,
    marginTop:10,
  },


  buttonText:{
    color:"#000",
    textAlign:"center",
    fontSize:18,
    fontWeight:"bold",
  },


  register:{
    color:"#FFC400",
    marginTop:25,
    fontSize:16,
  },

});