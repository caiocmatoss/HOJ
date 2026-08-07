import { View, Text, StyleSheet } from "react-native";


export function HeaderHome(){

 return (

  <View style={styles.container}>

    <View>
      <Text style={styles.title}>
        HOJÉ OND
      </Text>

      <Text style={styles.location}>
        📍 Sua localização
      </Text>
    </View>


  </View>

 );

}


const styles = StyleSheet.create({

 container:{
   flexDirection:"row",
   justifyContent:"space-between",
   alignItems:"center",
 },


 title:{
   color:"#FFC400",
   fontSize:28,
   fontWeight:"700",
 },


 location:{
   color:"#FFFFFF",
   marginTop:5,
 }

});