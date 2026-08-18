import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { router } from "expo-router";
import { useState } from "react";


export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

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

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirmação de senha é obrigatória";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Senhas não coincidem";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = () => {
    if (loading || validateForm()) {
      setLoading(true);

      // Simular criação de conta
      setTimeout(() => {
        setLoading(false);
        router.replace("/(main)/home");
      }, 1500);
    }
  };

  return (

    <View style={styles.container}>

      <Text style={styles.logo}>
        HOJÉ OND
      </Text>


      <Text style={styles.title}>
        Crie sua conta
      </Text>


      <TextInput
        style={[styles.input, errors.name && styles.inputError]}
        placeholder="Nome"
        placeholderTextColor="#777"
        value={name}
        onChangeText={setName}
      />

      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}


      <TextInput
        style={[styles.input, errors.email && styles.inputError]}
        placeholder="Email"
        placeholderTextColor="#777"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
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


      <TextInput
        style={[styles.input, errors.confirmPassword && styles.inputError]}
        placeholder="Confirmar Senha"
        placeholderTextColor="#777"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}


      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >

        <Text style={styles.buttonText}>
          {loading ? "Criando conta..." : "Criar Conta"}
        </Text>

      </Pressable>


      <Pressable
        onPress={() => router.push("/(auth)/login")}
      >

        <Text style={styles.login}>
          Já tenho uma conta
        </Text>

      </Pressable>


    </View>

  );
}



const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#090909",
    justifyContent:"center",
    padding:24,
  },


  logo:{
    color:"#FFC400",
    fontSize:40,
    fontWeight:"bold",
    textAlign:"center",
    marginBottom:40,
  },


  title:{
    color:"#FFFFFF",
    fontSize:22,
    textAlign:"center",
    marginBottom:30,
  },


  input:{
    backgroundColor:"#1B1B1B",
    color:"#FFFFFF",
    padding:18,
    borderRadius:14,
    marginBottom:16,
    fontSize:16,
  },

  inputError: {
    borderColor: "#D50000",
    borderWidth: 1,
  },


  button:{
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


  login:{
    color:"#FFC400",
    textAlign:"center",
    marginTop:25,
    fontSize:16,
  },

  errorText: {
    color: "#D50000",
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 8,
  }

});