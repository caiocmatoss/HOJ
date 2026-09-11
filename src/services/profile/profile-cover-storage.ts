import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const keyFor = (userId: string) => `hoje-e-onde:profile-cover:${userId}`;

export type ProfileCoverAsset = {
  uri: string;
  file?: Blob | null;
};

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Não foi possível preparar a imagem da capa."));
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Não foi possível preparar a imagem da capa."));
        return;
      }

      resolve(reader.result);
    };

    reader.readAsDataURL(blob);
  });
}

async function getPersistentCoverUri(asset: ProfileCoverAsset): Promise<string> {
  if (Platform.OS !== "web") return asset.uri;
  if (asset.uri.startsWith("data:")) return asset.uri;

  let blob: Blob;

  if (asset.file) {
    blob = asset.file;
  } else {
    const response = await fetch(asset.uri);

    if (!response.ok) {
      throw new Error("Não foi possível preparar a imagem da capa.");
    }

    blob = await response.blob();
  }

  return blobToDataUrl(blob);
}

export async function getProfileCover(userId: string): Promise<string | null> {
  return AsyncStorage.getItem(keyFor(userId));
}

export async function setProfileCover(
  userId: string,
  value: string | ProfileCoverAsset,
): Promise<string> {
  const uri =
    typeof value === "string"
      ? value
      : await getPersistentCoverUri(value);

  await AsyncStorage.setItem(keyFor(userId), uri);
  return uri;
}

export async function removeProfileCover(userId: string): Promise<void> {
  await AsyncStorage.removeItem(keyFor(userId));
}
