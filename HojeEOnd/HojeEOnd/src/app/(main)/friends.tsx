import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Pressable,
} from "react-native";


import {
  router,
} from "expo-router";


import {
  friends,
} from "@/data/friends";



export default function FriendsScreen(){



  return (

    <View style={styles.container}>


      <Text style={styles.title}>

        👥 Amigos

      </Text>





      <FlatList


        data={friends}



        keyExtractor={(item)=>

          item.id

        }



        renderItem={({item})=>(



          <Pressable

  style={styles.card}

  onPress={()=>


    router.push({

      pathname:"/(main)/friend/[id]",

      params:{
        id:item.id,
      },

    })


  }

>



            <Image

              source={{

                uri:item.avatar

              }}

              style={styles.avatar}

            />





            <View>


              <Text style={styles.name}>

                {item.name}

              </Text>




              <Text style={styles.status}>

                {item.status === "online"

                  ?

                  "🟢 Online"

                  :

                  "⚫ Offline"

                }

              </Text>


            </View>



          </Pressable>



        )}



      />


    </View>

  );

}





const styles = StyleSheet.create({



container:{


  flex:1,


  backgroundColor:"#090909",


  padding:20,


},




title:{


  color:"#FFC400",


  fontSize:28,


  fontWeight:"800",


  marginBottom:20,


},




card:{


  flexDirection:"row",


  alignItems:"center",


  backgroundColor:"#1B1B1B",


  padding:15,


  borderRadius:18,


  marginBottom:15,


},




avatar:{


  width:60,


  height:60,


  borderRadius:30,


  marginRight:15,


},




name:{


  color:"#FFFFFF",


  fontSize:20,


  fontWeight:"700",


},




status:{


  color:"#CCCCCC",


  marginTop:5,


},



});