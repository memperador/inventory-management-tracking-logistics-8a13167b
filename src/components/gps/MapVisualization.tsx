
import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Locate, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

const MapVisualization: React.FC = () => {
  const [mapKey, setMapKey] = useState<string>('');
  const [isMapKeySet, setIsMapKeySet] = useState<boolean>(false);
  const [equipmentLocations, setEquipmentLocations] = useState<EquipmentLocation[]>(MOCK_GPS_DATA);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

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
      // In a real app, you would store this securely, not in state
    } else {
      toast({
        title: "Invalid Map Key",
        description: "Please enter a valid map key.",
        variant: "destructive",
      });
    }
  };

  const initializeMap = () => {
    // This is a mockup for the UI - in a real implementation,
    // you would use a mapping library like Mapbox, Leaflet, or Google Maps
    if (!mapContainerRef.current) return;

    // Mock map initialization for the UI demonstration
    const mockMap = document.createElement('div');
    mockMap.className = 'flex flex-col items-center justify-center h-full bg-gray-100 text-gray-700 rounded-lg';
    mockMap.innerHTML = `
      <div class="flex items-center justify-center">
        <MapPin className="h-10 w-10 text-primary mb-2" />
      </div>
      <p class="text-center">Map would render here with equipment locations.</p>
      <p class="text-center text-sm text-muted-foreground mt-2">Using mock data for demonstration.</p>
    `;
    
    // Clear previous content and append the mock map
    if (mapContainerRef.current.firstChild) {
      mapContainerRef.current.removeChild(mapContainerRef.current.firstChild);
    }
    mapContainerRef.current.appendChild(mockMap);

    // In a real implementation, this is where you would:
    // 1. Initialize the map with the appropriate library
    // 2. Add markers for each equipment location
    // 3. Set up event listeners for map interactions
  };

  const refreshLocations = () => {
    // In a real app, this would fetch the latest GPS data from your backend
    toast({
      title: "Locations Refreshed",
      description: "The latest equipment positions have been loaded.",
    });
  };

  const centerMapOnEquipment = (equipmentId: string) => {
    const equipment = equipmentLocations.find(eq => eq.id === equipmentId);
    if (equipment) {
      setSelectedEquipment(equipmentId);
      // In a real implementation, this would pan/zoom the map to the equipment location
      toast({
        title: "Map Centered",
        description: `Map centered on ${equipment.name}`,
      });
    }
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
            <MapPin className="mr-2 h-5 w-5 text-primary" />
            Equipment Location Tracker
          </div>
          <Button size="sm" variant="outline" onClick={refreshLocations}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isMapKeySet ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please enter your map provider API key to initialize the map visualization.
            </p>
            <form onSubmit={handleMapKeySubmit} className="flex gap-2">
              <Input
                type="password"
                placeholder="Enter Map API Key"
                value={mapKey}
                onChange={(e) => setMapKey(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">Set Key</Button>
            </form>
            <div className="text-xs text-muted-foreground">
              In a production environment, this key would be stored securely in your Supabase environment.
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
                >
                  <div className="flex flex-col items-center justify-center h-full bg-gray-100 text-gray-700 rounded-lg">
                    <MapPin className="h-10 w-10 text-primary mb-2" />
                    <p className="text-center">Map would render here with equipment locations.</p>
                    <p className="text-center text-sm text-muted-foreground mt-2">Using mock data for demonstration.</p>
                  </div>
                </div>
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
