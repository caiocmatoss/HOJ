import { View, Text, StyleSheet } from "react-native";


export function FakeMap(){

  return (

    <View style={styles.map}>

      <Text style={styles.pin1}>
        📍
      </Text>

      <Text style={styles.pin2}>
        📍
      </Text>

      <Text style={styles.pin3}>
        🟠
      </Text>


    </View>

  );

}


const styles = StyleSheet.create({

 map:{
   height:220,
   backgroundColor:"#1B1B1B",
   borderRadius:24,
   marginTop:20,
   position:"relative",
 },


 pin1:{
   position:"absolute",
   top:50,
   left:70,
   fontSize:30,
 },


 pin2:{
   position:"absolute",
   top:120,
   right:80,
   fontSize:30,
 },


 pin3:{
   position:"absolute",
   top:80,
   right:120,
   fontSize:30,
 },


});