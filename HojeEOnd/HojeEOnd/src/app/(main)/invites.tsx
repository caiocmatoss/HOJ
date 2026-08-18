import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useInviteStore,
} from "@/store/invite-store";

import {
  useGroupStore,
} from "@/store/group-store";

import {
  useUserStore,
} from "@/store/user-store";

export default function InvitesScreen(){
  const {
    invites,
    acceptInvite,
    rejectInvite,
  } = useInviteStore();

  const {
    joinGroup,
  } = useGroupStore();

  const {
    user,
  } = useUserStore();

  function handleAccept(
    inviteId:string,
    groupId:string,
    userId:string
  ){
    acceptInvite(inviteId);
    joinGroup(groupId, userId);
  }

  function handleReject(inviteId:string){
    rejectInvite(inviteId);
  }

  if (invites.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          🔔 Convites
        </Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum convite pendente</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        🔔 Convites
      </Text>

      <FlatList
        data={invites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.text}>
              🎉 Convite para grupo
            </Text>

            <Text style={styles.info}>
              Grupo: {item.groupId}
            </Text>

            <Text style={styles.info}>
              De: {item.fromUserId}
            </Text>

            <Text style={styles.date}>
              {new Date().toLocaleDateString()}
            </Text>

            <View style={styles.buttonContainer}>
              <Pressable
                style={[styles.button, styles.acceptButton]}
                onPress={() => handleAccept(item.id, item.groupId, item.toUserId)}
              >
                <Text style={styles.buttonText}>Aceitar</Text>
              </Pressable>

              <Pressable
                style={[styles.button, styles.rejectButton]}
                onPress={() => handleReject(item.id)}
              >
                <Text style={styles.buttonText}>Recusar</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
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

  text: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  info: {
    color: "#AAAAAA",
    marginTop: 10,
  },

  date: {
    color: "#888",
    marginTop: 5,
    fontSize: 14,
  },

  buttonContainer: {
    flexDirection: "row",
    marginTop: 20,
    gap: 10,
  },

  button: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  acceptButton: {
    backgroundColor: "#FFC400",
  },

  rejectButton: {
    backgroundColor: "#FF5555",
  },

  buttonText: {
    color: "#000",
    fontWeight: "700",
  },
});