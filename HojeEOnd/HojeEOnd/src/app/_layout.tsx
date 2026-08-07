import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "expo-router";


import {
  Stack,
} from "expo-router";


import {
  useColorScheme,
} from "react-native";


import * as SplashScreen from "expo-splash-screen";


import {
  useEffect,
} from "react";


import LocationTracker from "@/components/LocationTracker";


SplashScreen.preventAutoHideAsync();




export default function RootLayout() {


  const colorScheme =
    useColorScheme();





  useEffect(() => {


    async function hideSplash() {


      await SplashScreen.hideAsync();


    }


    hideSplash();


  }, []);






  return (


    <ThemeProvider

      value={
        colorScheme === "dark"
        ?
        DarkTheme
        :
        DefaultTheme
      }

    >



      <LocationTracker />



      <Stack

        screenOptions={{

          headerShown:false,

        }}

      />



    </ThemeProvider>


  );


}