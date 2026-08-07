import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";


import { HeaderHome } from "@/components/home/HeaderHome";
import { SearchBar } from "@/components/home/SearchBar";
import { CategoryChip } from "@/components/home/CategoryChip";
import { EventCard } from "@/components/home/EventCard";
import { VenueCard } from "@/components/home/VenueCard";
import { LiveMap } from "@/components/home/LiveMap.native";
import { FloatingButton } from "@/components/home/FloatingButton";

export default function HomeScreen() {

  return (

    <View style={styles.page}>

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >


      <HeaderHome />


      <Text style={styles.greeting}>
        Qual vai ser sua noite?
      </Text>


      <SearchBar />


      <Text style={styles.section}>
        Categorias
      </Text>


      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
      >

        <CategoryChip
          title="🍺 Bares"
          active
        />

        <CategoryChip
          title="🎧 Baladas"
        />

        <CategoryChip
          title="🎤 Shows"
        />

        <CategoryChip
          title="🎪 Festivais"
        />

        <CategoryChip
          title="🍔 Restaurantes"
        />

      </ScrollView>



      <Text style={styles.section}>
        Eventos próximos
      </Text>


      <EventCard />



      <Text style={styles.section}>
        Locais populares
      </Text>


      <VenueCard />



      <Text style={styles.section}>
        Mapa ao vivo
      </Text>


      <LiveMap />


    </ScrollView>

    <FloatingButton />


</View>
  );

}



const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#090909",
    padding:24,
  },


  greeting:{
    color:"#FFF",
    fontSize:26,
    fontWeight:"700",
    marginTop:25,
  },


  section:{
    color:"#FFF",
    fontSize:22,
    fontWeight:"700",
    marginTop:30,
    marginBottom:15,
  },

  page:{
  flex:1,
  backgroundColor:"#090909",
},

});