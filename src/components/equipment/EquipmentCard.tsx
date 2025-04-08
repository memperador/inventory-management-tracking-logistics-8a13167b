import React from 'react';
import { MapPin, Calendar, AlertTriangle, FileText } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DocumentDialog } from '@/components/equipment/DocumentDialog';
import { EquipmentIdInfo } from './EquipmentIdInfo';
import { Equipment } from './types';
import { useTenant } from '@/hooks/useTenantContext';
import { COMPANY_TYPE_TO_CODE_MAP } from '@/types/tenant';

interface EquipmentCardProps {
  equipment: Equipment;
}

const getStatusColor = (status: Equipment['status']) => {
  switch (status) {
    case 'Operational':
      return 'bg-inventory-green-light text-inventory-green border-inventory-green';
    case 'Maintenance':
      return 'bg-inventory-yellow-light text-inventory-yellow border-inventory-yellow';
    case 'Out of Service':
      return 'bg-inventory-red-light text-inventory-red border-inventory-red';
    case 'Testing':
      return 'bg-inventory-blue-light text-inventory-blue border-inventory-blue';
    case 'Certification Pending':
      return 'bg-purple-100 text-purple-600 border-purple-600';
    default:
      return '';
  }
};

export const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment }) => {
  const { currentTenant } = useTenant();
  
  const getCodeDisplay = () => {
    if (!currentTenant || !currentTenant.company_type) {
      return equipment.csi_code ? (
        <div className="flex items-center">
          <FileText className="h-4 w-4 text-inventory-blue mr-2" />
          <span className="text-inventory-blue font-medium">CSI: {equipment.csi_code}</span>
        </div>
      ) : equipment.nec_code ? (
        <div className="flex items-center">
          <FileText className="h-4 w-4 text-inventory-blue mr-2" />
          <span className="text-inventory-blue font-medium">NEC: {equipment.nec_code}</span>
        </div>
      ) : null;
    }
    
    const codeType = COMPANY_TYPE_TO_CODE_MAP[currentTenant.company_type];
    
    if (codeType === 'CSI' && equipment.csi_code) {
      return (
        <div className="flex items-center">
          <FileText className="h-4 w-4 text-inventory-blue mr-2" />
          <span className="text-inventory-blue font-medium">CSI: {equipment.csi_code}</span>
        </div>
      );
    } else if (codeType === 'NEC' && equipment.nec_code) {
      return (
        <div className="flex items-center">
          <FileText className="h-4 w-4 text-inventory-blue mr-2" />
          <span className="text-inventory-blue font-medium">NEC: {equipment.nec_code}</span>
        </div>
      );
    } else if (equipment.csi_code) {
      return (
        <div className="flex items-center">
          <FileText className="h-4 w-4 text-inventory-blue mr-2" />
          <span className="text-inventory-blue font-medium">CSI: {equipment.csi_code}</span>
        </div>
      );
    } else if (equipment.nec_code) {
      return (
        <div className="flex items-center">
          <FileText className="h-4 w-4 text-inventory-blue mr-2" />
          <span className="text-inventory-blue font-medium">NEC: {equipment.nec_code}</span>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="h-2 w-full bg-gray-100">
          <div 
            className={`h-full ${
              equipment.status === 'Operational' ? 'bg-inventory-green' : 
              equipment.status === 'Maintenance' ? 'bg-inventory-yellow' : 
              equipment.status === 'Testing' ? 'bg-inventory-blue' :
              equipment.status === 'Certification Pending' ? 'bg-purple-600' :
              'bg-inventory-red'
            }`}
            style={{ width: equipment.status === 'Operational' ? '100%' : '60%' }}
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
              className={`${getStatusColor(equipment.status)}`}
            >
              {equipment.status}
            </Badge>
            
            <DocumentDialog 
              equipmentId={equipment.id} 
              equipmentName={equipment.name}
              tenantId={equipment.tenant_id} 
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
          {getCodeDisplay()}
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-6 py-3 border-t">
        <div className="flex justify-between items-center w-full text-sm">
          <EquipmentIdInfo id={equipment.id} />
          <span className="text-gray-500">GPS: {equipment.gpsTag}</span>
        </div>
      </CardFooter>
    </Card>
  );
};
