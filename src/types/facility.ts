export type FacilityType = "tower" | "approach" | "center" | "ground" | "clearance" | "flight_service";

export interface ControllerFacility {
  id: string;
  name: string;
  type: FacilityType;
  primaryAirport?: string;
  position: { latitude: number; longitude: number };
  artcc?: string;
}
