export interface PlanetData {
  name: string;
  symbol: string;
  alt: number; // Altitude in degrees (-90 to 90)
  az: number;  // Azimuth in degrees (0 to 360)
  direction: string;
  ra: string;  // Right Ascension (HH:MM:SS)
  dec: string; // Declination (±DD:MM)
  magnitude: number;
  distanceAU: number;
  isVisible: boolean;
  color: string;
  riseTime?: string;
  setTime?: string;
}

export interface AsteroidNEO {
  id: string;
  name: string;
  estimatedDiameterMinM: number;
  estimatedDiameterMaxM: number;
  avgDiameterM: number;
  isPotentiallyHazardous: boolean;
  closeApproachDate: string;
  missDistanceKm: number;
  missDistanceLD: number;
  velocityKmh: number;
  velocityKms: number;
  orbitingBody: string;
}

export interface StationConfig {
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  elevationM: number;
}
