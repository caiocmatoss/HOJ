import * as Location from "expo-location";


export async function getUserLocation(){

  const { status } =
    await Location.requestForegroundPermissionsAsync();


  if(status !== "granted"){

    throw new Error(
      "Permissão de localização negada"
    );

  }


  const location =
    await Location.getCurrentPositionAsync({});


  return {

    latitude:
      location.coords.latitude,


    longitude:
      location.coords.longitude,

  };

}