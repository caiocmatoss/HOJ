import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";


export default function MainLayout() {

  return (

    <Tabs
      screenOptions={{
        headerShown:false,

        tabBarStyle:{
          backgroundColor:"#090909",
          borderTopColor:"#1B1B1B",
          height:70,
        },

        tabBarActiveTintColor:"#FFC400",
        tabBarInactiveTintColor:"#777",
      }}
    >

      <Tabs.Screen
        name="home"
        options={{
          title:"Início",
          tabBarIcon:({color,size})=>(
            <Ionicons
              name="home"
              color={color}
              size={size}
            />
          )
        }}
      />


      <Tabs.Screen
        name="explore"
        options={{
          title:"Explorar",
          tabBarIcon:({color,size})=>(
            <Ionicons
              name="search"
              color={color}
              size={size}
            />
          )
        }}
      />


      <Tabs.Screen
        name="groups"
        options={{
          title:"Grupos",
          tabBarIcon:({color,size})=>(
            <Ionicons
              name="people"
              color={color}
              size={size}
            />
          )
        }}
      />


      <Tabs.Screen
        name="chat"
        options={{
          title:"Chat",
          tabBarIcon:({color,size})=>(
            <Ionicons
              name="chatbubble"
              color={color}
              size={size}
            />
          )
        }}
      />


      <Tabs.Screen
        name="profile"
        options={{
          title:"Perfil",
          tabBarIcon:({color,size})=>(
            <Ionicons
              name="person"
              color={color}
              size={size}
            />
          )
        }}
      />


    </Tabs>

  );
}