
import React from 'react';
import { Search, Filter, Plus, MapPin, Calendar, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

type Equipment = {
  id: string;
  name: string;
  type: string;
  status: 'operational' | 'maintenance' | 'out-of-service';
  location: string;
  lastMaintenance: string;
  nextMaintenance: string;
  gpsTag: string;
};

const equipmentData: Equipment[] = [
  {
    id: 'EQ-1234',
    name: 'Cat Excavator',
    type: 'Heavy Equipment',
    status: 'operational',
    location: 'Downtown High-rise',
    lastMaintenance: '2024-03-15',
    nextMaintenance: '2024-05-15',
    gpsTag: 'GT-7851'
  },
  {
    id: 'EQ-5678',
    name: 'JCB Backhoe',
    type: 'Heavy Equipment',
    status: 'maintenance',
    location: 'Highway Extension',
    lastMaintenance: '2024-02-20',
    nextMaintenance: '2024-04-20',
    gpsTag: 'GT-9245'
  },
  {
    id: 'EQ-9012',
    name: 'Manitowoc Crane',
    type: 'Heavy Equipment',
    status: 'operational',
    location: 'Commercial Complex',
    lastMaintenance: '2024-03-01',
    nextMaintenance: '2024-05-01',
    gpsTag: 'GT-3487'
  },
  {
    id: 'EQ-3456',
    name: 'Bobcat Skid Steer',
    type: 'Medium Equipment',
    status: 'out-of-service',
    location: 'Warehouse Project',
    lastMaintenance: '2023-12-10',
    nextMaintenance: '2024-04-10',
    gpsTag: 'GT-6120'
  },
  {
    id: 'EQ-7890',
    name: 'Toyota Forklift',
    type: 'Medium Equipment',
    status: 'operational',
    location: 'Warehouse Project',
    lastMaintenance: '2024-03-25',
    nextMaintenance: '2024-05-25',
    gpsTag: 'GT-1742'
  },
  {
    id: 'EQ-1122',
    name: 'Komatsu Bulldozer',
    type: 'Heavy Equipment',
    status: 'maintenance',
    location: 'Highway Extension',
    lastMaintenance: '2024-01-05',
    nextMaintenance: '2024-04-05',
    gpsTag: 'GT-5390'
  }
];

const getStatusColor = (status: Equipment['status']) => {
  switch (status) {
    case 'operational':
      return 'bg-inventory-green-light text-inventory-green border-inventory-green';
    case 'maintenance':
      return 'bg-inventory-yellow-light text-inventory-yellow border-inventory-yellow';
    case 'out-of-service':
      return 'bg-inventory-red-light text-inventory-red border-inventory-red';
    default:
      return '';
  }
};

const Equipment = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipment</h1>
          <p className="text-gray-500 mt-1">Manage your equipment inventory</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Equipment
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search equipment..." 
            className="pl-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>Filter by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Status</DropdownMenuItem>
            <DropdownMenuItem>Equipment Type</DropdownMenuItem>
            <DropdownMenuItem>Location</DropdownMenuItem>
            <DropdownMenuItem>Maintenance Date</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {equipmentData.map((equipment) => (
          <Card key={equipment.id} className="overflow-hidden">
            <CardHeader className="p-0">
              <div className="h-2 w-full bg-gray-100">
                <div 
                  className={`h-full ${
                    equipment.status === 'operational' ? 'bg-inventory-green' : 
                    equipment.status === 'maintenance' ? 'bg-inventory-yellow' : 
                    'bg-inventory-red'
                  }`}
                  style={{ width: equipment.status === 'operational' ? '100%' : '60%' }}
                />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{equipment.name}</h3>
                  <p className="text-sm text-gray-500">{equipment.type}</p>
                </div>
                <Badge 
                  variant="outline" 
                  className={`${getStatusColor(equipment.status)} capitalize`}
                >
                  {equipment.status.replace('-', ' ')}
                </Badge>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  <span>{equipment.location}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span>Last maintenance: {new Date(equipment.lastMaintenance).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  {new Date(equipment.nextMaintenance) <= new Date() ? (
                    <AlertTriangle className="h-4 w-4 text-inventory-red mr-2" />
                  ) : (
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  )}
                  <span>Next maintenance: {new Date(equipment.nextMaintenance).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 px-6 py-3 border-t">
              <div className="flex justify-between items-center w-full text-sm">
                <span className="font-medium">{equipment.id}</span>
                <span className="text-gray-500">GPS: {equipment.gpsTag}</span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Equipment;
