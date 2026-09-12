import { Image } from "expo-image";
import { useEffect, useMemo, useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";

type Props = { imageUrl: string | null; onClose: () => void };

export function MessageImageViewer({ imageUrl, onClose }: Props) {
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
  const [intrinsicSize, setIntrinsicSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    setIntrinsicSize(null);
  }, [imageUrl]);

  useEffect(() => {
    if (!imageUrl || Platform.OS !== "web" || typeof document === "undefined") return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [imageUrl, onClose]);

  const imageFrameStyle = useMemo(() => {
    const maxWidth = Math.min(Math.max(viewportWidth - 32, 1), 760);
    const maxHeight = Math.min(Math.max(viewportHeight - 32, 1), 760);
    if (!intrinsicSize || intrinsicSize.width <= 0 || intrinsicSize.height <= 0) {
      return { height: 1, width: 1 };
    }
    const scale = Math.min(maxWidth / intrinsicSize.width, maxHeight / intrinsicSize.height);
    return { height: intrinsicSize.height * scale, width: intrinsicSize.width * scale };
  }, [intrinsicSize, viewportHeight, viewportWidth]);

  return (
    <Modal transparent visible={Boolean(imageUrl)} animationType="fade" onRequestClose={onClose}>
      <View accessibilityViewIsModal style={styles.overlay}>
        <Pressable
          accessibilityLabel="Fechar visualizador de imagem"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
          testID="image-viewer-backdrop"
        />
        <View pointerEvents="box-none" style={styles.contentLayer}>
          <View pointerEvents="auto" style={[styles.imageFrame, imageFrameStyle]} testID="image-viewer-image-frame">
            {imageUrl ? (
              <Image
                accessibilityLabel="Imagem ampliada"
                contentFit="contain"
                onLoad={({ source }) => setIntrinsicSize({ height: source.height, width: source.width })}
                source={{ uri: imageUrl }}
                style={styles.image}
                testID="image-viewer-image"
              />
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { alignItems: "center", backgroundColor: "rgba(0,0,0,0.88)", flex: 1, justifyContent: "center", padding: 16 },
  contentLayer: { alignItems: "center", justifyContent: "center" },
  imageFrame: { alignItems: "center", justifyContent: "center" },
  image: { height: "100%", width: "100%" },
});
