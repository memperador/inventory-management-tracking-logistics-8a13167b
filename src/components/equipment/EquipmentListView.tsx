
import React from 'react';
import { Calendar, MapPin, AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Equipment } from './types';

interface EquipmentListViewProps {
  equipmentData: Equipment[];
  onSelect?: (equipment: Equipment) => void;
}

const getStatusBadge = (status: Equipment['status']) => {
  switch (status) {
    case 'Operational':
      return <Badge className="bg-inventory-green-light text-inventory-green border-inventory-green">Operational</Badge>;
    case 'Maintenance':
      return <Badge className="bg-inventory-yellow-light text-inventory-yellow border-inventory-yellow">Maintenance</Badge>;
    case 'Out of Service':
      return <Badge className="bg-inventory-red-light text-inventory-red border-inventory-red">Out of Service</Badge>;
    case 'Testing':
      return <Badge className="bg-inventory-blue-light text-inventory-blue border-inventory-blue">Testing</Badge>;
    case 'Certification Pending':
      return <Badge className="bg-purple-100 text-purple-600 border-purple-600">Certification Pending</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const EquipmentListView: React.FC<EquipmentListViewProps> = ({ equipmentData, onSelect }) => {
  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Equipment</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Codes</TableHead>
            <TableHead>Maintenance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {equipmentData.length > 0 ? (
            equipmentData.map((equipment) => (
              <TableRow 
                key={equipment.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSelect && onSelect(equipment)}
              >
                <TableCell>
                  <div className="font-medium">{equipment.name}</div>
                  <div className="text-sm text-gray-500">{equipment.id}</div>
                </TableCell>
                <TableCell>
                  {equipment.type}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{equipment.location}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(equipment.status)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {equipment.csi_code && (
                      <div className="flex items-center text-sm">
                        <FileText className="h-3 w-3 text-gray-400 mr-1" />
                        <span>CSI: {equipment.csi_code}</span>
                      </div>
                    )}
                    {equipment.nec_code && (
                      <div className="flex items-center text-sm text-inventory-blue font-medium">
                        <FileText className="h-3 w-3 text-inventory-blue mr-1" />
                        <span>NEC: {equipment.nec_code}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-3 w-3 text-gray-400 mr-1" />
                      <span>Last: {equipment.lastMaintenance ? new Date(equipment.lastMaintenance).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-3 w-3 text-gray-400 mr-1" />
                      <span>Next: {equipment.nextMaintenance ? new Date(equipment.nextMaintenance).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                No equipment found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
