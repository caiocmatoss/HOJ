import React from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

import { friends } from "@/data/friends";

export function FriendsMap() {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: -23.5505,
          longitude: -46.6333,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >

        {friends.map((friend, index) => (
          <Marker
            key={friend.id}
            coordinate={{
              latitude: -23.5505 + index * 0.001,
              longitude: -46.6333 + index * 0.001,
            }}
            title={friend.name}
          />
        ))}

      </MapView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  map: {
    flex: 1,
  },
});