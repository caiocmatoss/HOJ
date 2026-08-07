import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
} from "react-native";


import {
  router,
} from "expo-router";


import {
  useState,
} from "react";


import {
  groups,
  Group,
} from "@/data/groups";



export default function GroupsScreen(){



  const [groupList,setGroupList] =

    useState<Group[]>(groups);






  function createGroup(){


    const newGroup:Group = {


      id:

      Date.now().toString(),



      name:

      "Minha Noite",



      venueId:

      "1",



      members:[

        "1"

      ],


    };





    setGroupList([

      ...groupList,

      newGroup,

    ]);


  }







  return (


    <View style={styles.container}>


      <Text style={styles.title}>

        🎉 Meus Grupos

      </Text>





      <Pressable

        style={styles.button}

        onPress={createGroup}

      >


        <Text style={styles.buttonText}>

          + Criar grupo

        </Text>


      </Pressable>







      <FlatList


        data={groupList}



        keyExtractor={(item)=>

          item.id

        }



        renderItem={({item})=>(



          <Pressable


            style={styles.card}


            onPress={()=>


              router.push({

                pathname:"/(main)/group/[id]",

                params:{

                  id:item.id,

                },

              })


            }


          >



            <Text style={styles.name}>

              {item.name}

            </Text>





            <Text style={styles.info}>

              📍 Local: {item.venueId}

            </Text>





            <Text style={styles.info}>

              👥 Membros: {item.members.length}

            </Text>



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




button:{


  backgroundColor:"#FFC400",


  padding:15,


  borderRadius:14,


  marginBottom:20,


},




buttonText:{


  color:"#000000",


  textAlign:"center",


  fontWeight:"700",


},




card:{


  backgroundColor:"#1B1B1B",


  padding:20,


  borderRadius:18,


  marginBottom:15,


},




name:{


  color:"#FFFFFF",


  fontSize:20,


  fontWeight:"700",


},




info:{


  color:"#CCCCCC",


  marginTop:8,


},



});