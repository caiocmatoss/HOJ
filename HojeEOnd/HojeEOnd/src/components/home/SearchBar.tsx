import {
 View,
 TextInput,
 StyleSheet
} from "react-native";


export function SearchBar(){

 return (

  <View style={styles.container}>

   <TextInput
    placeholder="Buscar eventos, bares..."
    placeholderTextColor="#777"
    style={styles.input}
   />

  </View>

 );

}


const styles=StyleSheet.create({

 container:{
  marginTop:20,
 },


 input:{
  backgroundColor:"#1B1B1B",
  color:"#FFF",
  padding:16,
  borderRadius:18,
  fontSize:16,
 }

});