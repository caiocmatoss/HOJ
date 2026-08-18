import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";


import {
  router,
  useLocalSearchParams,
} from "expo-router";


import {
  venues,
} from "@/data/venues";
import { useCheckinStore } from "@/store/checkin-store";
import { useFavoriteStore } from "@/store/favorite-store";


export default function VenueDetailsScreen(){



  const {

    id,

  } = useLocalSearchParams();


  const { isFavorite, addFavorite, removeFavorite } = useFavoriteStore();
  const { currentVenue, checkin, checkout } = useCheckinStore();




  // Garantir que o id seja uma string
  const venueId = Array.isArray(id) ? id[0] : id;
  
  const venue = venues.find(

    item =>

    item.id === venueId

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




  const favorite = isFavorite(venueId);
  const isCurrentlyCheckedIn = currentVenue === venueId;


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



      {/* Componente de ações inline */}
      <View style={{flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: 20, marginBottom: 20}}>
        <Pressable 
          onPress={() => {
            if (favorite) {
              removeFavorite(venueId);
            } else {
              addFavorite(venueId);
            }
          }}
          style={{flexDirection: 'column', alignItems: 'center', padding: 10, borderRadius: 10, backgroundColor: '#2D2D2D', minWidth: 120}}
        >
          <Text style={{color: favorite ? "#FF4D4D" : "#FFF", fontSize: 24, fontWeight: 'bold'}}>❤️</Text>
          <Text style={{color: '#FFF', marginTop: 5, fontSize: 14, fontWeight: '600'}}>
            {favorite ? "Favorito" : "Favoritar"}
          </Text>
        </Pressable>

        <Pressable 
          onPress={() => {
            if (isCurrentlyCheckedIn) {
              checkout();
            } else {
              checkin(venueId);
            }
          }}
          style={[
            {flexDirection: 'column', alignItems: 'center', padding: 10, borderRadius: 10, backgroundColor: '#2D2D2D', minWidth: 120},
            isCurrentlyCheckedIn && {backgroundColor: '#4CAF50'}
          ]}
        >
          <Text style={{color: isCurrentlyCheckedIn ? "#4CAF50" : "#FFF", fontSize: 24, fontWeight: 'bold'}}>📍</Text>
          <Text style={[
            {color: '#FFF', marginTop: 5, fontSize: 14, fontWeight: '600'},
            isCurrentlyCheckedIn && {color: '#000'}
          ]}>
            {isCurrentlyCheckedIn ? "Você está aqui" : "Check-in"}
          </Text>
        </Pressable>
      </View>




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