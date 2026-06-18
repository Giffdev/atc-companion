import { findAirportReference } from "@/data/airports";
import type { GeoPoint } from "@/types/aviation";

export interface NavigationResult {
  from: { icao: string; name: string; position: GeoPoint };
  to: { icao: string; name: string; position: GeoPoint };
  magneticHeading: number;
  trueHeading: number;
  distanceNm: number;
  distanceSm: number;
  estimatedTimeMinutes?: number;
}

const EARTH_RADIUS_NM = 3440.065;
const NM_TO_SM = 1.15078;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;
const toDegrees = (radians: number): number => (radians * 180) / Math.PI;
const normalizeHeading = (degrees: number): number => ((Math.round(degrees) % 360) + 360) % 360 || 360;

export const calculateNavigation = (from: GeoPoint, to: GeoPoint): { distanceNm: number; trueBearing: number } => {
  const latitudeOne = toRadians(from.latitude);
  const latitudeTwo = toRadians(to.latitude);
  const deltaLatitude = toRadians(to.latitude - from.latitude);
  const deltaLongitude = toRadians(to.longitude - from.longitude);

  const haversine =
    Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
    Math.cos(latitudeOne) * Math.cos(latitudeTwo) * Math.sin(deltaLongitude / 2) * Math.sin(deltaLongitude / 2);
  const centralAngle = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  const y = Math.sin(deltaLongitude) * Math.cos(latitudeTwo);
  const x = Math.cos(latitudeOne) * Math.sin(latitudeTwo) - Math.sin(latitudeOne) * Math.cos(latitudeTwo) * Math.cos(deltaLongitude);
  const trueBearing = (toDegrees(Math.atan2(y, x)) + 360) % 360;

  return {
    distanceNm: Number((EARTH_RADIUS_NM * centralAngle).toFixed(1)),
    trueBearing
  };
};

export const estimateMagneticDeclination = (lat: number, lon: number): number => {
  const continentalEstimate = 2 - 0.55 * (lon + 97) + 0.05 * (lat - 37);
  return Math.max(-15, Math.min(18, Number(continentalEstimate.toFixed(1))));
};

export const getNavigationBetween = (fromAirport: string, toAirport: string, speedKnots?: number): NavigationResult | null => {
  const from = findAirportReference(fromAirport);
  const to = findAirportReference(toAirport);

  if (!from || !to) {
    return null;
  }

  const fromPosition = { latitude: from.latitude, longitude: from.longitude };
  const toPosition = { latitude: to.latitude, longitude: to.longitude };
  const { distanceNm, trueBearing } = calculateNavigation(fromPosition, toPosition);
  const declination = estimateMagneticDeclination((from.latitude + to.latitude) / 2, (from.longitude + to.longitude) / 2);
  const estimatedTimeMinutes =
    speedKnots && Number.isFinite(speedKnots) && speedKnots > 0 ? Number(((distanceNm / speedKnots) * 60).toFixed(1)) : undefined;

  return {
    from: {
      icao: from.icao,
      name: from.name,
      position: fromPosition
    },
    to: {
      icao: to.icao,
      name: to.name,
      position: toPosition
    },
    trueHeading: normalizeHeading(trueBearing),
    magneticHeading: normalizeHeading(trueBearing - declination),
    distanceNm,
    distanceSm: Number((distanceNm * NM_TO_SM).toFixed(1)),
    estimatedTimeMinutes
  };
};
