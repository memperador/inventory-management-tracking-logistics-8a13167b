
import { toast } from '@/hooks/use-toast';

export interface GPSCoordinates {
  latitude: number;
  longitude: number;
}

export interface GPSEquipmentData {
  id: string;
  name: string;
  position: GPSCoordinates;
  lastUpdated: string;
  status: 'active' | 'idle' | 'inactive' | 'offline';
  batteryLevel?: number;
  accuracy?: number;
}

// Calculate distance between two GPS coordinates in kilometers
export function calculateDistance(coord1: GPSCoordinates, coord2: GPSCoordinates): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(coord1.latitude)) * Math.cos(toRadians(coord2.latitude)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
}

function toRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}

// Format coordinates to a more readable format
export function formatCoordinates(coords: GPSCoordinates): string {
  const lat = coords.latitude.toFixed(5);
  const lng = coords.longitude.toFixed(5);
  
  return `${lat}° ${coords.latitude >= 0 ? 'N' : 'S'}, ${lng}° ${coords.longitude >= 0 ? 'E' : 'W'}`;
}

// Mock function to simulate fetching GPS data
export async function fetchGPSData(): Promise<GPSEquipmentData[]> {
  // In a real implementation, this would make an API call to your backend
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock data
    return [
      {
        id: "equip-001",
        name: "Excavator #103",
        position: { latitude: 37.7749, longitude: -122.4194 },
        lastUpdated: new Date().toISOString(),
        status: "active",
        batteryLevel: 78,
        accuracy: 5
      },
      // Add more mock equipment as needed
    ];
  } catch (error) {
    toast({
      title: "Error Fetching GPS Data",
      description: "Failed to retrieve equipment location data.",
      variant: "destructive"
    });
    return [];
  }
}
