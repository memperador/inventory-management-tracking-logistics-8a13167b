
import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Locate, RefreshCw, Map as MapIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { fetchGPSData, formatCoordinates } from './GPSUtils';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// Mock GPS data for equipment
const MOCK_GPS_DATA = [
  { id: '1', name: 'Excavator #103', lat: 37.7749, lng: -122.4194, lastUpdate: '2025-04-08T10:30:00Z', status: 'active' as const },
  { id: '2', name: 'Bulldozer #87', lat: 37.7665, lng: -122.4274, lastUpdate: '2025-04-08T09:15:00Z', status: 'active' as const },
  { id: '3', name: 'Crane #54', lat: 37.7822, lng: -122.4167, lastUpdate: '2025-04-07T16:45:00Z', status: 'idle' as const },
  { id: '4', name: 'Forklift #29', lat: 37.7759, lng: -122.4245, lastUpdate: '2025-04-08T08:20:00Z', status: 'inactive' as const },
  { id: '5', name: 'Generator #62', lat: 37.7716, lng: -122.4105, lastUpdate: '2025-04-08T11:05:00Z', status: 'active' as const },
];

interface EquipmentLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  lastUpdate: string;
  status: 'active' | 'idle' | 'inactive';
}

interface Geofence {
  id: string;
  name: string;
  coordinates: [number, number][];
  color: string;
}

const DEFAULT_MAP_CENTER: [number, number] = [-122.4194, 37.7749];
const DEFAULT_ZOOM = 13;

// Sample geofence data
const SAMPLE_GEOFENCES: Geofence[] = [
  {
    id: 'geofence-1',
    name: 'Construction Site Alpha',
    coordinates: [
      [-122.4224, 37.7759],
      [-122.4224, 37.7739],
      [-122.4164, 37.7739],
      [-122.4164, 37.7759],
      [-122.4224, 37.7759]
    ],
    color: '#4338CA'
  },
  {
    id: 'geofence-2',
    name: 'Storage Yard',
    coordinates: [
      [-122.4134, 37.7719],
      [-122.4134, 37.7699],
      [-122.4094, 37.7699],
      [-122.4094, 37.7719],
      [-122.4134, 37.7719]
    ],
    color: '#15803D'
  }
];

const MapVisualization: React.FC = () => {
  const [mapKey, setMapKey] = useLocalStorage<string>('mapbox_key', '');
  const [isMapKeySet, setIsMapKeySet] = useState<boolean>(false);
  const [equipmentLocations, setEquipmentLocations] = useState<EquipmentLocation[]>(MOCK_GPS_DATA);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showGeofences, setShowGeofences] = useState<boolean>(true);
  const [offlineMode, setOfflineMode] = useState<boolean>(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const geofencesRef = useRef<{ [key: string]: mapboxgl.GeoJSONSource }>({});

  useEffect(() => {
    // Check if mapKey is already set in localStorage
    if (mapKey && mapKey.trim().length > 0) {
      setIsMapKeySet(true);
    }
  }, [mapKey]);

  const filteredEquipment = equipmentLocations.filter(equipment => 
    equipment.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMapKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapKey.trim().length > 0) {
      setIsMapKeySet(true);
      toast({
        title: "Map Key Set",
        description: "The map will now be initialized with your key.",
      });
    } else {
      toast({
        title: "Invalid Map Key",
        description: "Please enter a valid map key.",
        variant: "destructive",
      });
    }
  };

  const initializeMap = () => {
    if (!mapContainerRef.current || !mapKey) return;

    // Set Mapbox access token
    mapboxgl.accessToken = mapKey;

    if (mapRef.current) return; // Map is already initialized

    // Initialize map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: DEFAULT_MAP_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: false
    });

    // Add navigation control
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add attribution control
    map.addControl(new mapboxgl.AttributionControl({
      compact: true
    }));

    // Add scale control
    map.addControl(new mapboxgl.ScaleControl({
      maxWidth: 100,
      unit: 'metric'
    }), 'bottom-left');

    // Store map reference
    mapRef.current = map;

    // Initialize popup
    popupRef.current = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });

    // Add markers when map is loaded
    map.on('load', () => {
      // Add equipment markers
      addEquipmentMarkers();
      
      // Add geofences if enabled
      if (showGeofences) {
        addGeofences();
      }
    });
  };

  const addEquipmentMarkers = () => {
    if (!mapRef.current) return;
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    // Add markers for each equipment
    equipmentLocations.forEach(equipment => {
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'flex items-center justify-center';
      el.style.width = '30px';
      el.style.height = '30px';
      
      // Add appropriate color based on status
      const color = equipment.status === 'active' ? '#22C55E' : 
                   equipment.status === 'idle' ? '#EAB308' : '#6B7280';
      
      el.innerHTML = `
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path 
            fill="${color}" 
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
          />
        </svg>
      `;
      
      // Create marker with popup
      const marker = new mapboxgl.Marker(el)
        .setLngLat([equipment.lng, equipment.lat])
        .addTo(mapRef.current);
      
      // Add hover effect
      el.addEventListener('mouseenter', () => {
        if (popupRef.current) {
          popupRef.current
            .setLngLat([equipment.lng, equipment.lat])
            .setHTML(`
              <div class="p-1">
                <div class="font-bold">${equipment.name}</div>
                <div class="text-xs">Status: ${equipment.status}</div>
                <div class="text-xs">Last update: ${new Date(equipment.lastUpdate).toLocaleString()}</div>
                <div class="text-xs">${formatCoordinates({latitude: equipment.lat, longitude: equipment.lng})}</div>
              </div>
            `)
            .addTo(mapRef.current!);
        }
      });
      
      el.addEventListener('mouseleave', () => {
        if (popupRef.current) {
          popupRef.current.remove();
        }
      });
      
      // Add click event to center and select
      marker.getElement().addEventListener('click', () => {
        centerMapOnEquipment(equipment.id);
      });
      
      // Store marker reference
      markersRef.current.push(marker);
    });
  };

  const addGeofences = () => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    
    // Add geofence sources and layers
    SAMPLE_GEOFENCES.forEach(geofence => {
      const sourceId = `geofence-source-${geofence.id}`;
      const layerId = `geofence-layer-${geofence.id}`;
      
      // Add source if it doesn't exist
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {
              name: geofence.name,
              color: geofence.color
            },
            geometry: {
              type: 'Polygon',
              coordinates: [geofence.coordinates]
            }
          }
        });
        
        // Store reference to source
        geofencesRef.current[sourceId] = map.getSource(sourceId) as mapboxgl.GeoJSONSource;
        
        // Add fill layer
        map.addLayer({
          id: layerId,
          type: 'fill',
          source: sourceId,
          layout: {},
          paint: {
            'fill-color': geofence.color,
            'fill-opacity': 0.2
          }
        });
        
        // Add outline layer
        map.addLayer({
          id: `${layerId}-outline`,
          type: 'line',
          source: sourceId,
          layout: {},
          paint: {
            'line-color': geofence.color,
            'line-width': 2
          }
        });
      }
    });
  };

  const removeGeofences = () => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    
    SAMPLE_GEOFENCES.forEach(geofence => {
      const sourceId = `geofence-source-${geofence.id}`;
      const layerId = `geofence-layer-${geofence.id}`;
      
      // Remove layers if they exist
      if (map.getLayer(`${layerId}-outline`)) {
        map.removeLayer(`${layerId}-outline`);
      }
      
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      
      // Remove source if it exists
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
        delete geofencesRef.current[sourceId];
      }
    });
  };

  const refreshLocations = async () => {
    try {
      // Simulate network issue if in offline mode
      if (offlineMode) {
        throw new Error('Network unavailable');
      }
      
      // In a real app, this would fetch the latest GPS data from your backend
      const data = await fetchGPSData();
      
      // For demo purposes, we'll just add some random movement to our mock data
      const updatedLocations = equipmentLocations.map(equipment => {
        return {
          ...equipment,
          lat: equipment.lat + (Math.random() - 0.5) * 0.005,
          lng: equipment.lng + (Math.random() - 0.5) * 0.005,
          lastUpdate: new Date().toISOString()
        };
      });
      
      setEquipmentLocations(updatedLocations);
      
      // Update markers on the map
      if (mapRef.current) {
        addEquipmentMarkers();
      }
      
      toast({
        title: "Locations Refreshed",
        description: "The latest equipment positions have been loaded.",
      });
    } catch (error) {
      console.error('Error refreshing locations:', error);
      
      // Load from cache in offline mode
      if (offlineMode) {
        toast({
          title: "Using Cached Data",
          description: "Network unavailable. Using stored locations.",
          variant: "secondary"
        });
      } else {
        toast({
          title: "Error Refreshing",
          description: "Failed to refresh equipment locations.",
          variant: "destructive"
        });
      }
    }
  };

  const centerMapOnEquipment = (equipmentId: string) => {
    const equipment = equipmentLocations.find(eq => eq.id === equipmentId);
    if (equipment && mapRef.current) {
      setSelectedEquipment(equipmentId);
      
      mapRef.current.flyTo({
        center: [equipment.lng, equipment.lat],
        zoom: 15,
        essential: true
      });
      
      toast({
        title: "Map Centered",
        description: `Map centered on ${equipment.name}`,
      });
    }
  };

  const toggleGeofences = () => {
    setShowGeofences(!showGeofences);
    
    if (!showGeofences) {
      // Enable geofences
      addGeofences();
    } else {
      // Disable geofences
      removeGeofences();
    }
    
    toast({
      title: showGeofences ? "Geofences Hidden" : "Geofences Shown",
      description: showGeofences ? "Geofences are now hidden from the map." : "Geofences are now visible on the map.",
    });
  };

  const toggleOfflineMode = () => {
    setOfflineMode(!offlineMode);
    
    toast({
      title: !offlineMode ? "Offline Mode Enabled" : "Online Mode Enabled",
      description: !offlineMode ? "Now using cached location data." : "Connected to live location updates.",
      variant: !offlineMode ? "secondary" : "default"
    });
  };

  useEffect(() => {
    if (isMapKeySet) {
      initializeMap();
    }
  }, [isMapKeySet]);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center">
            <MapIcon className="mr-2 h-5 w-5 text-primary" />
            Equipment Location Tracker
          </div>
          <div className="space-x-2 flex">
            <Button size="sm" variant={offlineMode ? "default" : "outline"} onClick={toggleOfflineMode}>
              {offlineMode ? "Offline" : "Online"}
            </Button>
            <Button size="sm" variant="outline" onClick={toggleGeofences}>
              {showGeofences ? "Hide Geofences" : "Show Geofences"}
            </Button>
            <Button size="sm" variant="outline" onClick={refreshLocations}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isMapKeySet ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please enter your Mapbox API key to initialize the map visualization.
            </p>
            <form onSubmit={handleMapKeySubmit} className="flex gap-2">
              <Input
                type="password"
                placeholder="Enter Mapbox API Key"
                value={mapKey}
                onChange={(e) => setMapKey(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">Set Key</Button>
            </form>
            <div className="text-xs text-muted-foreground">
              In a production environment, this key would be stored securely in your Supabase environment.
              Get a free Mapbox key at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">mapbox.com</a>.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search equipment..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div 
                  ref={mapContainerRef} 
                  className="h-[400px] border rounded-md overflow-hidden"
                />
              </div>

              <div>
                <div className="border rounded-md overflow-hidden h-[400px]">
                  <div className="p-3 bg-muted font-medium">Equipment List</div>
                  <div className="overflow-auto h-[calc(400px-40px)]">
                    {filteredEquipment.length > 0 ? (
                      <ul className="divide-y">
                        {filteredEquipment.map((equipment) => (
                          <li 
                            key={equipment.id}
                            className={`p-3 cursor-pointer hover:bg-slate-50 ${selectedEquipment === equipment.id ? 'bg-slate-50' : ''}`}
                            onClick={() => centerMapOnEquipment(equipment.id)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{equipment.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  Last updated: {new Date(equipment.lastUpdate).toLocaleString()}
                                </div>
                              </div>
                              <Badge 
                                variant={equipment.status === 'active' ? 'default' : 
                                       (equipment.status === 'idle' ? 'secondary' : 'outline')}
                              >
                                {equipment.status}
                              </Badge>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        No equipment found matching your search.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MapVisualization;
