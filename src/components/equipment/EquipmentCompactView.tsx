
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Equipment } from './types';

interface EquipmentCompactViewProps {
  equipmentData: Equipment[];
  onSelect?: (equipment: Equipment) => void;
}

const getStatusColor = (status: Equipment['status']) => {
  switch (status) {
    case 'Operational':
      return 'bg-inventory-green';
    case 'Maintenance':
      return 'bg-inventory-yellow';
    case 'Out of Service':
      return 'bg-inventory-red';
    case 'Testing':
      return 'bg-inventory-blue';
    case 'Certification Pending':
      return 'bg-purple-500';
    default:
      return 'bg-gray-400';
  }
};

export const EquipmentCompactView: React.FC<EquipmentCompactViewProps> = ({ 
  equipmentData, 
  onSelect 
}) => {
  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {equipmentData.map((equipment) => (
        <Card 
          key={equipment.id} 
          className="overflow-hidden hover:ring-1 hover:ring-primary/20 transition-shadow cursor-pointer"
          onClick={() => onSelect && onSelect(equipment)}
        >
          <div className={`h-1 w-full ${getStatusColor(equipment.status)}`} />
          <CardContent className="p-3 space-y-2">
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-sm line-clamp-1" title={equipment.name}>
                {equipment.name}
              </h4>
              <div className="w-2 h-2 rounded-full mt-1 ml-1 flex-shrink-0" 
                style={{ backgroundColor: getStatusColor(equipment.status).replace('bg-', '') }}>
              </div>
            </div>
            <div className="text-xs text-muted-foreground line-clamp-1">
              {equipment.type}
            </div>
            <div className="text-xs line-clamp-1">
              {equipment.location}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
