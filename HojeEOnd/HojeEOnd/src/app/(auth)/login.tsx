import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { router } from "expo-router";
import { useState } from "react";


export default function LoginScreen() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Email inválido";
    }

    if (!password) {
      newErrors.password = "Senha é obrigatória";
    } else if (password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (loading || validateForm()) {
      setLoading(true);

      // Simular autenticação
      setTimeout(() => {
        setLoading(false);
  router.replace("/(main)/home");
      }, 1500);
    }
  };

  return (

    <View style={styles.container}>
      <Text style={styles.title}>
        HOJÉ OND
        </Text>


      <Text style={styles.subtitle}>
        Bem-vindo de volta
      </Text>


     <TextInput
      style={[styles.input, errors.email && styles.inputError]}
      placeholder="Email"
      placeholderTextColor="#777"
      value={email}
      onChangeText={setEmail}
      keyboardType="email-address"
    />


      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}


      <TextInput
        style={[styles.input, errors.password && styles.inputError]}
        placeholder="Senha"
        placeholderTextColor="#777"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >

        <Text style={styles.buttonText}>
          {loading ? "Entrando..." : "Entrar"}
        </Text>

      </Pressable>


      <Pressable
        onPress={() => router.push("/(auth)/register")}
      >

        <Text style={styles.register}>
          Criar uma conta
        </Text>

      </Pressable>


    </View>

  );
}


const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#0F0F0F",
    justifyContent:"center",
    alignItems:"center",
    padding:24,
  },


  title:{
    fontSize:40,
    fontWeight:"bold",
    color:"#FFD54F",
    marginBottom:10,
  },


  subtitle:{
    color:"#FFF",
    fontSize:18,
    marginBottom:40,
  },


  input:{
    width:"100%",
    backgroundColor:"#1B1B1B",
    color:"#FFF",
    padding:16,
    borderRadius:14,
    marginBottom:15,
  },

  inputError: {
    borderColor: "#D50000",
    borderWidth: 1,
  },


  button:{
    width:"100%",
    backgroundColor:"#FFC400",
    padding:18,
    borderRadius:14,
    marginTop:10,
  },

  buttonDisabled: {
    backgroundColor: "#777",
  },


  buttonText:{
    color:"#000",
    textAlign:"center",
    fontSize:18,
    fontWeight:"bold",
  },


  register:{
    color:"#FFC400",
    marginTop:25,
    fontSize:16,
  },

  errorText: {
    color: "#D50000",
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 8,
  },

});