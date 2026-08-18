import {
  Tabs,
} from "expo-router";

import {
  Ionicons,
} from "@expo/vector-icons";

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: "#090909",
          borderTopColor: "#1B1B1B",
          borderTopWidth: 1,
          height: 72,
          paddingTop: 6,
          paddingBottom: 8,
        },

        tabBarActiveTintColor:
          "#FFC400",

        tabBarInactiveTintColor:
          "#777777",

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },

        tabBarItemStyle: {
          paddingVertical: 2,
        },

        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Início",

          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? "home"
                  : "home-outline"
              }
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Explorar",

          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? "search"
                  : "search-outline"
              }
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="groups"
        options={{
          title: "Grupos",

          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? "people"
                  : "people-outline"
              }
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="friends"
        options={{
          title: "Amigos",

          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? "person-add"
                  : "person-add-outline"
              }
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",

          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? "chatbubbles"
                  : "chatbubbles-outline"
              }
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",

          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? "person"
                  : "person-outline"
              }
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="edit-profile"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="invites"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="friend/[id]"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="chat/[id]"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="group/[id]"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="group/create"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="group/chat/[id]"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="group/invite"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}