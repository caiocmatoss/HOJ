import {
  StyleSheet,
  TextInput,
  View,
} from "react-native";

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
}

export function SearchBar({
  value = "",
  onChangeText = () => {},
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Buscar eventos, bares, shows..."
        placeholderTextColor="#777777"
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 20,
    marginBottom: 4,
  },

  input: {
    width: "100%",
    height: 52,
    backgroundColor: "#1B1B1B",
    color: "#FFFFFF",
    paddingHorizontal: 16,
    borderRadius: 18,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#262626",
  },
});