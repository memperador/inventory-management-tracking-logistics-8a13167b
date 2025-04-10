
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Equipment } from '@/components/equipment/types';
import { AlertTriangle, Check, Clock } from 'lucide-react';

interface BatchStatusOperationsProps {
  isProcessing: boolean;
  onStatusChange: (status: Equipment['status']) => void;
}

export const BatchStatusOperations: React.FC<BatchStatusOperationsProps> = ({
  isProcessing,
  onStatusChange
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isProcessing}>
          <AlertTriangle className="mr-2 h-4 w-4" />
          Change Status
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onStatusChange('Operational')}>
          <Check className="mr-2 h-4 w-4 text-green-500" />
          Operational
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange('Maintenance')}>
          <Clock className="mr-2 h-4 w-4 text-amber-500" />
          Maintenance
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange('Out of Service')}>
          <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
          Out of Service
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
