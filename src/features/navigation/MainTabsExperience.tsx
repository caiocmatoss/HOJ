import { Tabs } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";

import { colors, fonts } from "@/theme/tokens";
import { MobileWebPreview } from "@/components/dev/MobileWebPreview";
import { FigmaTabIcon } from "./FigmaTabIcon";

function tabIcon(name: string) { return ({ focused }: { focused: boolean }) => <FigmaTabIcon name={name} focused={focused} />; }

export default function MainTabsExperience() {
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    document.body.style.backgroundColor = colors.background;
    document.documentElement.style.backgroundColor = colors.background;
  }, []);

  return (
    <MobileWebPreview>
      <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarHideOnKeyboard: true,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarItemStyle: { paddingVertical: 2 },
        tabBarLabelStyle: {
          fontFamily: fonts.semibold,
          fontSize: 9,
        },
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "rgba(21, 25, 29, 0.98)",
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 68,
          paddingBottom: 8,
          paddingTop: 7,
          ...(Platform.OS === "web"
            ? {
                marginLeft: "auto" as const,
                marginRight: "auto" as const,
                maxWidth: 720,
                width: "100%" as const,
              }
            : {}),
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: "Mapa", tabBarIcon: tabIcon("map") }}
      />
      <Tabs.Screen
        name="explore"
        options={{ title: "Explorar", tabBarIcon: tabIcon("explore") }}
      />
      <Tabs.Screen name="events" options={{ title: "Eventos", tabBarIcon: tabIcon("events") }} />
      <Tabs.Screen
        name="friends"
        options={{ title: "Amigos", tabBarIcon: tabIcon("friends") }}
      />
      <Tabs.Screen
        name="chat"
        options={{ title: "Chat", tabBarIcon: tabIcon("chat") }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Perfil", tabBarIcon: tabIcon("profile") }}
      />

      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="privacy" options={{ href: null }} />
      <Tabs.Screen name="appearance" options={{ href: null }} />
      <Tabs.Screen name="help" options={{ href: null }} />
      <Tabs.Screen name="location" options={{ href: null }} />
      <Tabs.Screen name="groups" options={{ href: null }} />
      <Tabs.Screen name="edit-profile" options={{ href: null }} />
      <Tabs.Screen name="invites" options={{ href: null }} />
      <Tabs.Screen name="friend/[id]" options={{ href: null }} />
      <Tabs.Screen name="chat/[id]" options={{ href: null }} />
      <Tabs.Screen name="group/[id]" options={{ href: null }} />
      <Tabs.Screen name="group/create" options={{ href: null }} />
      <Tabs.Screen name="group/chat/[id]" options={{ href: null }} />
      <Tabs.Screen name="group/invite" options={{ href: null }} />
      </Tabs>
    </MobileWebPreview>
  );
}
