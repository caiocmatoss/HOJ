import { View, ViewProps, StyleSheet } from "react-native";

export function Card(props: ViewProps){

  return (
    <View
      {...props}
      style={[
        styles.card,
        props.style
      ]}
    />
  );
}


const styles = StyleSheet.create({

  card:{
    backgroundColor:"#1B1B1B",
    borderRadius:20,
    padding:16,
  }

});