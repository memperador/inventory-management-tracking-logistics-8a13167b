
import { useState } from 'react';
import { Equipment } from '@/components/equipment/types';
import { useToast } from '@/hooks/use-toast';

export interface UseBatchOperationsProps {
  selectedItems: Equipment[];
  onUpdateItems: (updatedItems: Equipment[]) => void;
  onClearSelection: () => void;
}

export const useBatchOperations = ({
  selectedItems,
  onUpdateItems,
  onClearSelection
}: UseBatchOperationsProps) => {
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

  return {
    isProcessing,
    handleStatusChange,
    handleLocationChange,
    scheduleMaintenance
  };
};
