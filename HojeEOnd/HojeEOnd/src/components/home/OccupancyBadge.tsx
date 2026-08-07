import { Text, StyleSheet } from "react-native";


interface Props {
  status: string;
}


export function OccupancyBadge({ status }: Props) {

  return (

    <Text style={styles.badge}>
      {status}
    </Text>

  );

}


const styles = StyleSheet.create({

  badge:{
    backgroundColor:"#FF8F00",
    color:"#000",
    paddingHorizontal:10,
    paddingVertical:5,
    borderRadius:20,
    fontWeight:"700",
    marginTop:10,
  },

});