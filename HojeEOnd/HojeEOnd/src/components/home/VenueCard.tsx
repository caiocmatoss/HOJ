import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

import { router } from "expo-router";
import { OccupancyBadge } from "./OccupancyBadge";

interface VenueProps {
  id: string;
  name: string;
  category: string;
  distance: string;
  occupancy: number;
  status: "open" | "closed";
  image?: string;
}

export function VenueCard({
  id,
  name,
  category,
  distance,
  occupancy,
  status,
  image
}: VenueProps){

 return (

  <Pressable
    style={styles.card}
    onPress={() => router.push(`/venue/${id}`)}
  >

    <View style={styles.imageContainer}>
      {image ? (
        <Image 
          source={{ uri: image }} 
          style={styles.image} 
          resizeMode="cover" 
        />
      ) : (
        <View style={styles.image}/>
      )}
    </View>

    <Text style={styles.title}>
      {name}
    </Text>

    <Text style={styles.info}>
      {category} • {distance}
    </Text>

    <View style={styles.bottomRow}>
      <OccupancyBadge
        status={occupancy > 80 ? "Cheio" : occupancy > 50 ? "Moderado" : "Livre"}
      />

      <Text style={[styles.status, status === "closed" && styles.closed]}>
        {status === "open" ? "Aberto agora" : "Fechado"}
      </Text>
    </View>

  </Pressable>

 );

}

const styles = StyleSheet.create({

 card:{
  backgroundColor:"#1B1B1B",
  borderRadius:20,
  padding:16,
  marginTop:20,
 },

 imageContainer:{
  height:120,
  backgroundColor:"#333",
  borderRadius:16,
  overflow:"hidden",
 },

 image:{
  width:"100%",
  height:"100%",
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

 bottomRow:{
  flexDirection:"row",
  justifyContent:"space-between",
  alignItems:"center",
  marginTop:10,
 },

 status:{
  color:"#4CAF50",
  fontSize:14,
  fontWeight:"700",
 },

 closed:{
  color:"#F44336",
 },

});