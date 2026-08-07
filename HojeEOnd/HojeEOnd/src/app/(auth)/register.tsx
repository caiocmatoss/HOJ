import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native";

import { router } from "expo-router";


export default function RegisterScreen() {

  return (

    <View style={styles.container}>

      <Text style={styles.logo}>
        HOJÉ OND
      </Text>


      <Text style={styles.title}>
        Crie sua conta
      </Text>


      <TextInput
        style={styles.input}
        placeholder="Nome"
        placeholderTextColor="#777"
      />


      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#777"
        keyboardType="email-address"
      />


      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#777"
        secureTextEntry
      />


      <Pressable style={styles.button}>

        <Text style={styles.buttonText}>
          Criar Conta
        </Text>

      </Pressable>


      <Pressable
        onPress={() => router.push("/(auth)/login")}
      >

        <Text style={styles.login}>
          Já tenho uma conta
        </Text>

      </Pressable>


    </View>

  );
}



const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#090909",
    justifyContent:"center",
    padding:24,
  },


  logo:{
    color:"#FFC400",
    fontSize:40,
    fontWeight:"bold",
    textAlign:"center",
    marginBottom:40,
  },


  title:{
    color:"#FFFFFF",
    fontSize:22,
    textAlign:"center",
    marginBottom:30,
  },


  input:{
    backgroundColor:"#1B1B1B",
    color:"#FFFFFF",
    padding:18,
    borderRadius:14,
    marginBottom:16,
    fontSize:16,
  },


  button:{
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


  login:{
    color:"#FFC400",
    textAlign:"center",
    marginTop:25,
    fontSize:16,
  }

});