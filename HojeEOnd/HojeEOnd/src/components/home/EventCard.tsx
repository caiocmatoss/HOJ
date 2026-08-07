import {
 View,
 Text,
 StyleSheet
} from "react-native";

import { OccupancyBadge } from "./OccupancyBadge";
<OccupancyBadge status="Cheio" />

export function EventCard(){

 return(

  <View style={styles.card}>

    <View style={styles.image}/>


    <Text style={styles.title}>
      Festival HOJÉ OND
    </Text>


    <Text style={styles.info}>
      🎤 Hoje • 22:00
    </Text>


    <OccupancyBadge status="Cheio"/>


  </View>

 );

}


const styles=StyleSheet.create({

 card:{
  backgroundColor:"#1B1B1B",
  borderRadius:20,
  padding:16,
  marginTop:20,
 },


 image:{
  height:150,
  backgroundColor:"#333",
  borderRadius:16,
 },


 title:{
  color:"#FFF",
  fontSize:20,
  fontWeight:"700",
  marginTop:15,
 },


 info:{
  color:"#AAA",
  marginTop:8,
 }

});