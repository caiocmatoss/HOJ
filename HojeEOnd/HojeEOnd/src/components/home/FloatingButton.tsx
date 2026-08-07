import {
  Pressable,
  Text,
  StyleSheet
} from "react-native";


export function FloatingButton(){

  return (

    <Pressable style={styles.button}>

      <Text style={styles.text}>
        +
      </Text>

    </Pressable>

  );

}


const styles = StyleSheet.create({

 button:{
   position:"absolute",
   right:25,
   bottom:30,

   width:65,
   height:65,

   borderRadius:40,

   backgroundColor:"#FFC400",

   justifyContent:"center",
   alignItems:"center",

   elevation:10,
 },


 text:{
   color:"#000",
   fontSize:40,
   fontWeight:"300",
 },

});