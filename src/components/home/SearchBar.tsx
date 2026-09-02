import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { colors, fonts, radii } from "@/theme/tokens";

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value = "",
  onChangeText = () => {},
  placeholder = "Onde você quer ir?",
}: SearchBarProps) {
  return (
    <View nativeID="home-search" testID="home-search" style={styles.container}>
      <Ionicons color={colors.textMuted} name="search" size={20} />
      <TextInput
        accessibilityLabel={placeholder}
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        returnKeyType="search"
        style={styles.input}
        value={value}
      />
      {value ? (
        <Pressable
          accessibilityLabel="Limpar busca"
          hitSlop={9}
          onPress={() => onChangeText("")}
          style={styles.clearButton}
        >
          <Ionicons color={colors.textMuted} name="close-circle" size={19} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "rgba(21, 25, 29, 0.93)",
    borderColor: "rgba(248, 250, 252, 0.06)",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    height: 50,
    marginTop: 0,
    paddingHorizontal: 16,
    width: "100%",
  },
  input: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    height: 48,
    marginLeft: 10,
    paddingHorizontal: 0,
  },
  clearButton: { alignItems: "center", height: 34, justifyContent: "center", width: 34 },
});
