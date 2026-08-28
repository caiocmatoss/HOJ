function normalizeBackendUrl(value: string | undefined): string {
  const trimmed = value?.trim();

  if (!trimmed) {
    return "http://localhost:3000";
  }

  return trimmed.replace(/\/+$/, "") || "http://localhost:3000";
}

export const BACKEND_URL = normalizeBackendUrl(
  process.env.EXPO_PUBLIC_BACKEND_URL,
);