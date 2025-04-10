
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Clock } from 'lucide-react';

interface BatchMaintenanceOperationsProps {
  isProcessing: boolean;
  onScheduleMaintenance: (daysFromNow: number) => void;
}

export const BatchMaintenanceOperations: React.FC<BatchMaintenanceOperationsProps> = ({
  isProcessing,
  onScheduleMaintenance
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isProcessing}>
          <Clock className="mr-2 h-4 w-4" />
          Schedule Maintenance
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onScheduleMaintenance(7)}>
          In 1 week
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onScheduleMaintenance(14)}>
          In 2 weeks
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onScheduleMaintenance(30)}>
          In 1 month
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
