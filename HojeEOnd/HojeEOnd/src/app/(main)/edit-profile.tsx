import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
} from "react-native";


import {
  useState,
} from "react";


import {
  router,
} from "expo-router";


import {
  useUserStore,
} from "@/store/user-store";



export default function EditProfileScreen(){



  const {

    user,

    updateName,

    updateBio,

  } = useUserStore();





  const [name,setName] =

    useState(user.name);





  const [bio,setBio] =

    useState(user.bio);








  function handleSave(){


    updateName(name);


    updateBio(bio);


    router.back();


  }







  return (


    <View style={styles.container}>


      <Text style={styles.title}>

        ✏️ Editar perfil

      </Text>





      <Text style={styles.label}>

        Nome

      </Text>





      <TextInput


        style={styles.input}


        value={name}


        onChangeText={setName}


        placeholder="Digite seu nome"


        placeholderTextColor="#888"


      />







      <Text style={styles.label}>

        Bio

      </Text>





      <TextInput


        style={styles.bioInput}


        value={bio}


        onChangeText={setBio}


        placeholder="Digite sua bio"


        placeholderTextColor="#888"


        multiline


      />







      <Pressable


        style={styles.button}


        onPress={handleSave}


      >


        <Text style={styles.buttonText}>

          Salvar

        </Text>


      </Pressable>



    </View>


  );

}





const styles = StyleSheet.create({



container:{


  flex:1,


  backgroundColor:"#090909",


  padding:25,


},




title:{


  color:"#FFC400",


  fontSize:28,


  fontWeight:"800",


  marginBottom:30,


},




label:{


  color:"#FFFFFF",


  fontSize:16,


  marginBottom:10,


  marginTop:15,


},




input:{


  backgroundColor:"#FFFFFF",


  borderRadius:14,


  padding:15,


  color:"#000000",


},




bioInput:{


  backgroundColor:"#FFFFFF",


  borderRadius:14,


  padding:15,


  color:"#000000",


  height:120,


  textAlignVertical:"top",


},




button:{


  backgroundColor:"#FFC400",


  padding:16,


  borderRadius:14,


  marginTop:25,


},




buttonText:{


  color:"#000000",


  textAlign:"center",


  fontWeight:"700",


},



});