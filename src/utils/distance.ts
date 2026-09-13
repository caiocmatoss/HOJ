export const NEARBY_RADIUS_KM = 5;

export function isWithinNearbyRadius(distanceInMeters: number) {
  return Number.isFinite(distanceInMeters) && distanceInMeters <= NEARBY_RADIUS_KM * 1000;
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const earthRadius = 6371000;

  const lat1Rad =
    (lat1 * Math.PI) / 180;

  const lat2Rad =
    (lat2 * Math.PI) / 180;

  const deltaLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const deltaLon =
    ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) *
      Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a),
    );

  return earthRadius * c;
}

export function formatDistance(
  distanceInMeters: number,
) {
  if (!Number.isFinite(distanceInMeters)) {
    return "Distância indisponível";
  }

  if (distanceInMeters < 1000) {
    return `${Math.round(
      distanceInMeters,
    )} m`;
  }

  const kilometers =
    distanceInMeters / 1000;

  return `${kilometers.toFixed(1)} km`;
}
