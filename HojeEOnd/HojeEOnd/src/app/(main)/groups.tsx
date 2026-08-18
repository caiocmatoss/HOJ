import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  groups,
} from "@/data/groups";
import {
  useGroupStore,
} from "@/store/group-store";

export default function GroupsScreen(){
  const {
    groups: groupList,
  } = useGroupStore();

  const allGroups = groupList.length > 0 ? groupList : groups;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        🎉 Grupos
      </Text>

      {allGroups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum grupo encontrado</Text>
        </View>
      ) : (
        <FlatList
          data={allGroups}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/(main)/group/[id]",
                  params: {
                    id: item.id,
                  },
                })
              }
            >
              <Text style={styles.name}>
                {item.name}
              </Text>

              <Text style={styles.members}>
                {item.members.length} membros
              </Text>

              <Text style={styles.venue}>
                Local: {item.venueId}
              </Text>
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
    marginBottom: 25,
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
    backgroundColor: "#1B1B1B",
    padding: 20,
    borderRadius: 18,
    marginBottom: 15,
  },

  name: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },

  members: {
    color: "#AAAAAA",
    marginTop: 10,
  },

  venue: {
    color: "#888",
    marginTop: 5,
  },
});