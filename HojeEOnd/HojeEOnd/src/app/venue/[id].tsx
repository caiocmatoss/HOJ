import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
} from "react-native";


import {
  useLocalSearchParams,
  router,
} from "expo-router";


import {
  venues,
} from "@/data/venues";



export default function VenueDetailsScreen(){



  const {

    id,

  } = useLocalSearchParams();





  const venue = venues.find(

    item =>

    item.id === String(id)

  );





  if(!venue){


    return (

      <View style={styles.container}>

        <Text style={styles.text}>

          Local não encontrado

        </Text>

      </View>

    );


  }







  return (

    <ScrollView style={styles.container}>


      <Image

        source={{

          uri:venue.image

        }}

        style={styles.image}

      />





      <Text style={styles.title}>

        {venue.name}

      </Text>





      <Text style={styles.info}>

        ⭐ Nota: {venue.rating}

      </Text>





      <Text style={styles.info}>

        📂 Categoria: {venue.category}

      </Text>





      <Text style={styles.info}>

        📍 Endereço: {venue.address}

      </Text>





      <Text style={styles.info}>

        👥 Pessoas agora: {venue.people}

      </Text>





      <Text style={styles.info}>

        🚪 Status: {venue.status}

      </Text>





      <Text style={styles.info}>

        🎧 DJ: {venue.dj}

      </Text>





      <Text style={styles.info}>

        🎵 Playlist: {venue.playlist}

      </Text>





      <Text style={styles.info}>

        🎁 Promoção: {venue.promotion}

      </Text>





      <Text style={styles.description}>

        {venue.description}

      </Text>







      <Text style={styles.galleryTitle}>

        📸 Galeria

      </Text>





      {

        venue.gallery.map((photo,index)=>(


          <Image

            key={index}

            source={{uri:photo}}

            style={styles.gallery}

          />


        ))

      }







      <Pressable

        style={styles.button}

        onPress={()=>


          router.push({

            pathname:"/(main)/groups",

          })


        }

      >


        <Text style={styles.buttonText}>

          🎉 Criar grupo neste local

        </Text>


      </Pressable>



    </ScrollView>

  );

}





const styles = StyleSheet.create({



container:{


  flex:1,


  backgroundColor:"#090909",


  padding:20,


},




image:{


  width:"100%",


  height:220,


  borderRadius:20,


},




gallery:{


  width:"100%",


  height:160,


  borderRadius:15,


  marginTop:10,


},




title:{


  color:"#FFC400",


  fontSize:30,


  fontWeight:"800",


  marginTop:20,


},




info:{


  color:"#FFFFFF",


  fontSize:17,


  marginTop:10,


},




description:{


  color:"#CCCCCC",


  fontSize:16,


  marginTop:20,


},




galleryTitle:{


  color:"#FFFFFF",


  fontSize:22,


  fontWeight:"700",


  marginTop:25,


},




button:{


  backgroundColor:"#FFC400",


  padding:16,


  borderRadius:15,


  marginTop:25,


  marginBottom:30,


},




buttonText:{


  color:"#000000",


  textAlign:"center",


  fontWeight:"700",


},




text:{


  color:"#FFFFFF",


},



});