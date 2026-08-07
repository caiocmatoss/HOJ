import {
 View,
 Text,
 StyleSheet
} from "react-native";

import { OccupancyBadge } from "./OccupancyBadge";


export function VenueCard(){

 return (

  <View style={styles.card}>

    <View style={styles.image}/>


    <Text style={styles.title}>
      Sunset Club
    </Text>


    <Text style={styles.info}>
      🎧 Balada • 2,5 km
    </Text>


    <OccupancyBadge
      status="Moderado"
    />


  </View>

 );

}


const styles = StyleSheet.create({

 card:{
  backgroundColor:"#1B1B1B",
  borderRadius:20,
  padding:16,
  marginTop:20,
 },


 image:{
  height:120,
  backgroundColor:"#333",
  borderRadius:16,
 },


 title:{
  color:"#FFF",
  fontSize:20,
  fontWeight:"700",
  marginTop:12,
 },


 info:{
  color:"#AAA",
  marginTop:8,
 },


});