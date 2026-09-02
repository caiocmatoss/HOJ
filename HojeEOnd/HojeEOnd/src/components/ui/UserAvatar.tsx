import { Image, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/theme/tokens";

interface UserAvatarProps {
  name: string;
  online?: boolean;
  showStatus?: boolean;
  size?: number;
  uri?: string | null;
}

export function UserAvatar({
  name,
  online = false,
  showStatus = false,
  size = 52,
  uri,
}: UserAvatarProps) {
  const radius = size / 2;
  const statusSize = Math.max(12, Math.round(size * 0.26));
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase() || "?";

  return (
    <View style={{ height: size, width: size }}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{
            backgroundColor: colors.elevated,
            borderRadius: radius,
            height: size,
            width: size,
          }}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              borderRadius: radius,
              height: size,
              width: size,
            },
          ]}
        >
          <Text style={[styles.initials, { fontSize: Math.max(15, size * 0.34) }]}>
            {initials}
          </Text>
        </View>
      )}

      {showStatus ? (
        <View
          style={[
            styles.status,
            {
              backgroundColor: online ? colors.success : colors.textMuted,
              borderRadius: statusSize / 2,
              height: statusSize,
              width: statusSize,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: "center",
    backgroundColor: colors.brandSoft,
    borderColor: colors.brandBorder,
    borderWidth: 1,
    justifyContent: "center",
  },
  initials: {
    color: colors.brand,
    fontFamily: fonts.bold,
  },
  status: {
    borderColor: colors.surface,
    borderWidth: 2,
    bottom: 0,
    position: "absolute",
    right: 0,
  },
});
