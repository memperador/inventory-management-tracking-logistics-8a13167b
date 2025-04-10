
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MapPin } from 'lucide-react';

interface BatchLocationOperationsProps {
  isProcessing: boolean;
  onLocationChange: (location: string) => void;
  commonLocations: string[];
}

export const BatchLocationOperations: React.FC<BatchLocationOperationsProps> = ({
  isProcessing,
  onLocationChange,
  commonLocations
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isProcessing}>
          <MapPin className="mr-2 h-4 w-4" />
          Change Location
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {commonLocations.map(location => (
          <DropdownMenuItem key={location} onClick={() => onLocationChange(location)}>
            {location}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
