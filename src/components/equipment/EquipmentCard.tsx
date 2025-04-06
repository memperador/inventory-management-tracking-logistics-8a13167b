
import React from 'react';
import { MapPin, Calendar, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DocumentDialog } from '@/components/equipment/DocumentDialog';
import { Equipment } from './types';

interface EquipmentCardProps {
  equipment: Equipment;
}

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

export const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment }) => {
  return (
    <Card className="overflow-hidden">
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
          <div className="flex gap-2">
            <Badge 
              variant="outline" 
              className={`${getStatusColor(equipment.status)} capitalize`}
            >
              {equipment.status.replace('-', ' ')}
            </Badge>
            
            <DocumentDialog 
              equipmentId={equipment.id} 
              equipmentName={equipment.name}
              tenantId={equipment.tenantId} 
            />
          </div>
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
  );
};
