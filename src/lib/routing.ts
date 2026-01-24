// OSRM routing service - uses free OpenStreetMap routing

export interface RoutePoint {
  latitude: number;
  longitude: number;
  name?: string;
}

export interface RouteData {
  coordinates: [number, number][]; // [lng, lat] pairs for the polyline
  distance: number; // in meters
  duration: number; // in seconds
  startPoint: RoutePoint;
  endPoint: RoutePoint;
}

/**
 * Fetch a driving route between two points using OSRM
 * Returns the route geometry as coordinate pairs
 */
export async function fetchRoute(
  start: RoutePoint,
  end: RoutePoint
): Promise<RouteData | null> {
  try {
    // OSRM expects coordinates as lng,lat
    const startCoord = `${start.longitude},${start.latitude}`;
    const endCoord = `${end.longitude},${end.latitude}`;
    
    const url = `https://router.project-osrm.org/route/v1/driving/${startCoord};${endCoord}?overview=full&geometries=geojson`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('OSRM routing failed:', response.statusText);
      return null;
    }
    
    const data = await response.json();
    
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      console.error('No route found:', data.code);
      return null;
    }
    
    const route = data.routes[0];
    
    return {
      coordinates: route.geometry.coordinates, // GeoJSON format: [lng, lat]
      distance: route.distance,
      duration: route.duration,
      startPoint: start,
      endPoint: end,
    };
  } catch (error) {
    console.error('Error fetching route:', error);
    return null;
  }
}

/**
 * Format distance in miles
 */
export function formatRouteMiles(meters: number): number {
  return Math.round(meters * 0.000621371);
}

/**
 * Format duration as hours and minutes
 */
export function formatRouteDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  
  if (hours === 0) {
    return `${minutes} min`;
  }
  return `${hours}h ${minutes}m`;
}
