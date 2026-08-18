import type {
    ReactNode,
} from "react";

import {
    Platform,
    StyleSheet,
    View,
} from "react-native";

interface ScreenContainerProps {
  children: ReactNode;

  maxWidth?: number;

  paddingHorizontal?: number;
}

export function ScreenContainer({
  children,
  maxWidth = 1100,
  paddingHorizontal = 20,
}: ScreenContainerProps) {
  return (
    <View
      style={[
        styles.outer,

        Platform.OS === "web" &&
          styles.outerWeb,
      ]}
    >
      <View
        style={[
          styles.inner,

          {
            maxWidth,
            paddingHorizontal,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    outer: {
      width: "100%",
    },

    outerWeb: {
      alignItems: "center",
    },

    inner: {
      width: "100%",
      alignSelf: "center",
    },
  });