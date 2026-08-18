import {
  Pressable,
  StyleSheet,
  Text
} from "react-native";

interface Props {
  title: string;
  active?: boolean;
  onPress?: () => void;
}

export function CategoryChip({
  title,
  active = false,
  onPress = () => {}
}: Props){

 return (

  <Pressable
    style={[
      styles.container,
      active && styles.active
    ]}
    onPress={onPress}
  >

    <Text
      style={[
        styles.text,
        active && styles.activeText
      ]}
    >
      {title}
    </Text>

  </Pressable>

 );

}

const styles = StyleSheet.create({

 container:{
  backgroundColor:"#1B1B1B",
  paddingHorizontal:18,
  paddingVertical:10,
  borderRadius:30,
  marginRight:10,
 },

 active:{
  backgroundColor:"#FFC400",
 },

 text:{
  color:"#FFF",
  fontSize:14,
 },

 activeText:{
  color:"#000",
  fontWeight:"700",
 }

});
















































