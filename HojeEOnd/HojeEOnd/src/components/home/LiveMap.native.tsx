import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
} from "react-native";

import { useEffect, useState } from "react";

import { router } from "expo-router";

import MapView, { Marker } from "react-native-maps";

import { getUserLocation } from "@/services/location";

import { venues } from "@/data/venues";


export function LiveMap() {

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);


  const [selectedVenue, setSelectedVenue] = useState<any>(null);



  useEffect(() => {
    loadLocation();
  }, []);



  async function loadLocation() {

    try {

      const userLocation = await getUserLocation();

      setLocation(userLocation);

    } catch (error) {

      console.log(error);

    }

  }



  if (!location) {

    return (

      <View style={styles.loading}>

        <ActivityIndicator size="large" />

      </View>

    );

  }



  return (

    <View style={styles.container}>


      <MapView

        style={styles.map}

        region={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }}

      >


        <Marker

          coordinate={location}

          title="Você está aqui"

        />



        {
          venues.map((venue) => (

            <Marker

              key={venue.id}

              coordinate={{
                latitude: venue.latitude,
                longitude: venue.longitude,
              }}

              title={venue.name}

              description={`${venue.category} • ${venue.occupancy}`}

              onPress={() => setSelectedVenue(venue)}

            />

          ))
        }



      </MapView>



      {
        selectedVenue && (

          <View style={styles.card}>


            <Text style={styles.title}>
              {selectedVenue.name}
            </Text>


            <Text style={styles.info}>
              {selectedVenue.category}
            </Text>


            <Text style={styles.info}>
              {selectedVenue.status} {selectedVenue.occupancy}
            </Text>


            <Text style={styles.info}>
              🎵 {selectedVenue.music}
            </Text>


            <Text

              style={styles.detailsButton}

              onPress={() =>

                router.push({

                  pathname: "/venue/[id]",

                  params: {
                    id: selectedVenue.id,
                  },

                })

              }

            >

              Ver detalhes →

            </Text>


          </View>

        )
      }



    </View>

  );

}



const styles = StyleSheet.create({

  container: {

    height: 250,

    borderRadius: 24,

    overflow: "hidden",

    marginTop: 20,

  },


  map: {

    flex: 1,

  },


  loading: {

    height: 250,

    backgroundColor: "#1B1B1B",

    borderRadius: 24,

    justifyContent: "center",

    alignItems: "center",

  },


  card: {

    position: "absolute",

    bottom: 15,

    left: 15,

    right: 15,

    backgroundColor: "#1B1B1B",

    padding: 16,

    borderRadius: 20,

  },


  title: {

    color: "#FFFFFF",

    fontSize: 20,

    fontWeight: "700",

  },


  info: {

    color: "#AAAAAA",

    marginTop: 8,

  },


  detailsButton: {

    marginTop: 15,

    color: "#FFC400",

    fontWeight: "700",

    fontSize: 16,

  },


});