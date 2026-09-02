import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import { FeedbackMessage } from "@/components/ui/FeedbackMessage";

import {
  useLocationStore,
} from "@/store/location-store";

export function LocationStatusCard() {
  const latitude = useLocationStore(
    (state) => state.latitude,
  );

  const longitude = useLocationStore(
    (state) => state.longitude,
  );

  const status = useLocationStore(
    (state) => state.status,
  );

  const error = useLocationStore(
    (state) => state.error,
  );

  const isTracking = useLocationStore(
    (state) => state.isTracking,
  );

  const hasLocation =
    latitude !== null &&
    longitude !== null;

  const statusText =
    getStatusText(
      status,
      isTracking,
    );

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View
          style={
            styles.iconContainer
          }
        >
          <Text style={styles.icon}>
            📍
          </Text>
        </View>

        <View
          style={
            styles.headerInfo
          }
        >
          <Text style={styles.title}>
            Sua localização
          </Text>

          <Text
            style={[
              styles.status,

              status ===
                "granted" &&
                styles.statusGranted,

              status ===
                "denied" &&
                styles.statusDenied,

              status ===
                "error" &&
                styles.statusError,
            ]}
          >
            {statusText}
          </Text>
        </View>

        {isTracking && (
          <View
            style={
              styles.liveBadge
            }
          >
            <View
              style={
                styles.liveDot
              }
            />

            <Text
              style={
                styles.liveText
              }
            >
              ATIVO
            </Text>
          </View>
        )}
      </View>

      {hasLocation ? (
        <View
          style={
            styles.coordinatesCard
          }
        >
          <View
            style={
              styles.coordinateItem
            }
          >
            <Text
              style={
                styles.coordinateLabel
              }
            >
              Latitude
            </Text>

            <Text
              style={
                styles.coordinateValue
              }
            >
              {latitude.toFixed(5)}
            </Text>
          </View>

          <View
            style={
              styles.divider
            }
          />

          <View
            style={
              styles.coordinateItem
            }
          >
            <Text
              style={
                styles.coordinateLabel
              }
            >
              Longitude
            </Text>

            <Text
              style={
                styles.coordinateValue
              }
            >
              {longitude.toFixed(5)}
            </Text>
          </View>
        </View>
      ) : (
        <Text
          style={
            styles.helperText
          }
        >
          {getHelperText(status)}
        </Text>
      )}

      {status === "denied" && (
        <View
          style={
            styles.feedbackWrapper
          }
        >
          <FeedbackMessage
            type="warning"
            title="Permissão necessária"
            message="Ative a permissão de localização nas configurações do dispositivo ou navegador para ver locais próximos."
          />
        </View>
      )}

      {status === "error" && (
        <View
          style={
            styles.feedbackWrapper
          }
        >
          <FeedbackMessage
            type="error"
            title="Erro de localização"
            message={
              error ??
              "Não foi possível obter sua localização."
            }
          />
        </View>
      )}
    </View>
  );
}

function getStatusText(
  status:
    | "idle"
    | "requesting"
    | "granted"
    | "denied"
    | "error",
  isTracking: boolean,
) {
  switch (status) {
    case "requesting":
      return "Solicitando permissão...";

    case "granted":
      return isTracking
        ? "Localização sendo atualizada"
        : "Permissão concedida";

    case "denied":
      return "Permissão negada";

    case "error":
      return "Erro ao obter localização";

    default:
      return "Aguardando localização";
  }
}

function getHelperText(
  status:
    | "idle"
    | "requesting"
    | "granted"
    | "denied"
    | "error",
) {
  switch (status) {
    case "requesting":
      return "Obtendo sua posição...";

    case "denied":
      return "A localização está desativada.";

    case "error":
      return "Não foi possível carregar sua localização.";

    case "granted":
      return "Aguardando a primeira posição do dispositivo.";

    default:
      return "Aguardando localização.";
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1B1B1B",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#292929",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#2A2300",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  icon: {
    fontSize: 22,
  },

  headerInfo: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  status: {
    color: "#888888",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },

  statusGranted: {
    color: "#4CAF50",
  },

  statusDenied: {
    color: "#FF9800",
  },

  statusError: {
    color: "#FF6B6B",
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#17351D",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginLeft: 10,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
  },

  liveText: {
    color: "#4CAF50",
    fontSize: 9,
    fontWeight: "800",
  },

  coordinatesCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#151515",
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
  },

  coordinateItem: {
    flex: 1,
    alignItems: "center",
  },

  coordinateLabel: {
    color: "#777777",
    fontSize: 11,
  },

  coordinateValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },

  divider: {
    width: 1,
    height: 32,
    backgroundColor: "#333333",
  },

  helperText: {
    color: "#888888",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 14,
  },

  feedbackWrapper: {
    marginTop: 12,
  },
});