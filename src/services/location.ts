import * as Location from "expo-location";

export type UserCoordinates = {
  latitude: number;
  longitude: number;
};

export async function requestLocationPermission(): Promise<boolean> {
  const currentPermission =
    await Location.getForegroundPermissionsAsync();

  if (
    currentPermission.status ===
    "granted"
  ) {
    return true;
  }

  const requestedPermission =
    await Location.requestForegroundPermissionsAsync();

  return (
    requestedPermission.status ===
    "granted"
  );
}

export async function getUserLocation(): Promise<UserCoordinates> {
  const granted =
    await requestLocationPermission();

  if (!granted) {
    throw new Error(
      "Permissão de localização negada.",
    );
  }

  const location =
    await Location.getCurrentPositionAsync({
      accuracy:
        Location.Accuracy.High,
    });

  return {
    latitude:
      location.coords.latitude,

    longitude:
      location.coords.longitude,
  };
}

export async function getLastKnownUserLocation(): Promise<
  UserCoordinates | null
> {
  const permission =
    await Location.getForegroundPermissionsAsync();

  if (
    permission.status !==
    "granted"
  ) {
    return null;
  }

  const location =
    await Location.getLastKnownPositionAsync();

  if (!location) {
    return null;
  }

  return {
    latitude:
      location.coords.latitude,

    longitude:
      location.coords.longitude,
  };
}