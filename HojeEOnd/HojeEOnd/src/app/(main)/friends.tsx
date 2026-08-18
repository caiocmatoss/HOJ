import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useState } from "react";

import {
  router,
} from "expo-router";

import {
  useUserStore,
} from "@/store/user-store";

import {
  friends,
} from "@/data/friends";

export default function FriendsScreen(){
  const {
    user,
  } = useUserStore();

  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        👥 Amigos
      </Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar amigos..."
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {filteredFriends.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum amigo encontrado</Text>
        </View>
      ) : (
        <FlatList
          data={filteredFriends}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/(main)/friend/[id]",
                  params: {
                    id: item.id,
                  },
                })
              }
            >
              <Image
                source={{
                  uri: item.avatar,
                }}
                style={styles.avatar}
              />

              <View style={styles.friendInfo}>
                <Text style={styles.name}>
                  {item.name}
                </Text>

                <Text style={styles.status}>
                  {item.status === "online"
                    ? "🟢 Online"
                    : "⚫ Offline"
                  }
                </Text>

                {/* Exemplo de distância - pode ser implementado com base em localização */}
                <Text style={styles.distance}>
                  1.2 km de você
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
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
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 20,
  },

  searchInput: {
    backgroundColor: "#1B1B1B",
    color: "#FFFFFF",
    borderRadius: 14,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },

  emptyText: {
    color: "#888",
    fontSize: 16,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B1B1B",
    padding: 15,
    borderRadius: 18,
    marginBottom: 15,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },

  friendInfo: {
    flex: 1,
  },

  name: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },

  status: {
    color: "#CCCCCC",
    marginTop: 5,
  },

  distance: {
    color: "#AAAAAA",
    marginTop: 5,
    fontSize: 14,
  },
});