import {
    StyleSheet,
    TextInput,
    View
} from "react-native";

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
}

export function SearchBar({ 
  value = "", 
  onChangeText = () => {} 
}: SearchBarProps){

 return (

  <View style={styles.container}>

   <TextInput
    placeholder="Buscar eventos, bares..."
    placeholderTextColor="#777"
    style={styles.input}
    value={value}
    onChangeText={onChangeText}
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
  height: 50
 }

});