import {
  Stack,
} from "expo-router";

import LocationTracker from "@/components/LocationTracker";
import NotificationManager from "@/components/NotificationManager";

export default function RootLayout() {
  return (
    <>
      <LocationTracker />

      <NotificationManager />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: "#090909",
          },
        }}
      >
        <Stack.Screen
          name="index"
        />

        <Stack.Screen
          name="(auth)"
        />

        <Stack.Screen
          name="(main)"
        />

        <Stack.Screen
          name="venue/[id]"
        />

        <Stack.Screen
          name="event/[id]"
        />
      </Stack>
    </>
  );
}