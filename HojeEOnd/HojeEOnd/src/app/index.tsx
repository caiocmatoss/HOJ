import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";


export default function HomeScreen() {

  const router = useRouter();

  return (

    <View style={styles.container}>

      <Text style={styles.logo}>
        HOJ OND
      </Text>


      <Text style={styles.subtitle}>
        Descubra a melhor noite da sua cidade
      </Text>


      <Pressable
  style={styles.button}
  onPress={() => {
  window.location.href = "/login";
}}
>
  <Text style={styles.buttonText}>
    Entrar
  </Text>
</Pressable>

      <Pressable
        style={styles.buttonOutline}
        onPress={() => router.replace("/(auth)/login")}
      >

        <Text style={styles.buttonOutlineText}>
          Criar Conta
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


  logo:{
    fontSize:42,
    fontWeight:"bold",
    color:"#FFD54F",
    marginBottom:20,
  },


  subtitle:{
    color:"#FFFFFF",
    fontSize:18,
    textAlign:"center",
    marginBottom:60,
    maxWidth:300,
  },


  button:{
    width:"100%",
    backgroundColor:"#FFD54F",
    padding:18,
    borderRadius:14,
    marginBottom:16,
  },


  buttonText:{
    textAlign:"center",
    fontWeight:"700",
    fontSize:18,
    color:"#000",
  },


  buttonOutline:{
    width:"100%",
    borderWidth:2,
    borderColor:"#FFD54F",
    padding:18,
    borderRadius:14,
  },


  buttonOutlineText:{
    textAlign:"center",
    fontWeight:"700",
    fontSize:18,
    color:"#FFD54F",
  },

});