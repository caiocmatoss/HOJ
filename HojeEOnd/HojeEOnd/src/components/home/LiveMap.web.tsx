import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";


import {
  venues,
} from "@/data/venues";



export function LiveMap() {


  return (

    <View style={styles.container}>


      <Text style={styles.title}>

        📍 Locais disponíveis

      </Text>



      <ScrollView>


        {
          venues.map((venue) => (


            <Pressable

              key={venue.id}

              style={styles.card}

            >


              <Text style={styles.name}>

                {venue.name}

              </Text>



              <Text style={styles.info}>

                📂 Categoria: {venue.category}

              </Text>



              <Text style={styles.info}>

                👥 Pessoas: {venue.people}

              </Text>



              <Text style={styles.info}>

                🎧 DJ: {venue.dj}

              </Text>



              <Text style={styles.info}>

                🎵 Playlist: {venue.playlist}

              </Text>



              <Text style={styles.info}>

                🎉 Promoção: {venue.promotion}

              </Text>



              <Text style={styles.info}>

                📌 Status: {venue.status}

              </Text>



            </Pressable>


          ))

        }


      </ScrollView>


    </View>

  );

}





const styles = StyleSheet.create({


  container: {

    flex: 1,

    backgroundColor: "#090909",

    padding: 20,

  },



  title: {

    color: "#FFC400",

    fontSize: 26,

    fontWeight: "800",

    marginBottom: 20,

  },



  card: {

    backgroundColor: "#1A1A1A",

    padding: 18,

    borderRadius: 15,

    marginBottom: 15,

  },



  name: {

    color: "#FFFFFF",

    fontSize: 20,

    fontWeight: "700",

    marginBottom: 10,

  },



  info: {

    color: "#CCCCCC",

    fontSize: 15,

    marginTop: 6,

  },


});
