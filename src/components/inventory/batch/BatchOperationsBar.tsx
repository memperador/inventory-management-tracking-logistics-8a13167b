
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Equipment, InventoryCategory } from '@/components/equipment/types';
import { AlertTriangle, Check, Clock, MapPin } from 'lucide-react';

interface BatchOperationsBarProps {
  selectedItems: Equipment[];
  onClearSelection: () => void;
  onUpdateItems: (updatedItems: Equipment[]) => void;
}

export const BatchOperationsBar: React.FC<BatchOperationsBarProps> = ({
  selectedItems,
  onClearSelection,
  onUpdateItems
}) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStatusChange = (status: Equipment['status']) => {
    setIsProcessing(true);
    
    try {
      // Create copies of the selected items with updated status
      const updatedItems = selectedItems.map(item => ({
        ...item,
        status
      }));

      // Update the items (in a real app this would call an API)
      onUpdateItems(updatedItems);
      
      toast({
        title: "Status Updated",
        description: `Updated ${selectedItems.length} items to ${status}`,
      });
      
      // Clear selection after successful operation
      onClearSelection();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update items",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLocationChange = (location: string) => {
    setIsProcessing(true);
    
    try {
      // Create copies of the selected items with updated location
      const updatedItems = selectedItems.map(item => ({
        ...item,
        location
      }));

      // Update the items
      onUpdateItems(updatedItems);
      
      toast({
        title: "Location Updated",
        description: `Updated ${selectedItems.length} items to ${location}`,
      });
      
      // Clear selection after successful operation
      onClearSelection();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update items",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const scheduleMaintenance = (daysFromNow: number) => {
    setIsProcessing(true);
    
    try {
      const maintenanceDate = new Date();
      maintenanceDate.setDate(maintenanceDate.getDate() + daysFromNow);
      
      // Create copies of the selected items with updated maintenance date
      const updatedItems = selectedItems.map(item => ({
        ...item,
        nextMaintenance: maintenanceDate.toISOString().split('T')[0]
      }));

      // Update the items
      onUpdateItems(updatedItems);
      
      toast({
        title: "Maintenance Scheduled",
        description: `Scheduled maintenance for ${selectedItems.length} items`,
      });
      
      // Clear selection after successful operation
      onClearSelection();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule maintenance",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const commonLocations = [
    "Downtown High-rise",
    "Highway Extension",
    "Commercial Complex",
    "Warehouse Project",
  ];

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-background border shadow-lg rounded-lg p-4 flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="font-medium">{selectedItems.length} items selected</span>
        <Button variant="outline" size="sm" onClick={onClearSelection}>
          Clear
        </Button>
      </div>

      <div className="h-8 w-px bg-border mx-2" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isProcessing}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            Change Status
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleStatusChange('Operational')}>
            <Check className="mr-2 h-4 w-4 text-green-500" />
            Operational
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusChange('Maintenance')}>
            <Clock className="mr-2 h-4 w-4 text-amber-500" />
            Maintenance
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusChange('Out of Service')}>
            <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
            Out of Service
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isProcessing}>
            <MapPin className="mr-2 h-4 w-4" />
            Change Location
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {commonLocations.map(location => (
            <DropdownMenuItem key={location} onClick={() => handleLocationChange(location)}>
              {location}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isProcessing}>
            <Clock className="mr-2 h-4 w-4" />
            Schedule Maintenance
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => scheduleMaintenance(7)}>
            In 1 week
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => scheduleMaintenance(14)}>
            In 2 weeks
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => scheduleMaintenance(30)}>
            In 1 month
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
