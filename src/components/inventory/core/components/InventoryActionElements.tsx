
import React from 'react';
import { VendorIntegration } from '@/components/inventory/vendor/VendorIntegration';
import { NewInventoryItemDialog } from '@/components/inventory/NewInventoryItemDialog';

interface InventoryActionElementsProps {
  showVendorIntegration: boolean;
  isNewItemDialogOpen: boolean;
  setIsNewItemDialogOpen: (open: boolean) => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const InventoryActionElements: React.FC<InventoryActionElementsProps> = ({
  showVendorIntegration,
  isNewItemDialogOpen,
  setIsNewItemDialogOpen,
  handleFileUpload
}) => {
  return (
    <>
      {showVendorIntegration && <VendorIntegration />}
      
      <NewInventoryItemDialog 
        open={isNewItemDialogOpen} 
        onOpenChange={setIsNewItemDialogOpen} 
      />
      
      <button 
        id="add-inventory-item" 
        onClick={() => setIsNewItemDialogOpen(true)}
        className="hidden"
      />
      
      <input 
        type="file" 
        id="file-upload" 
        accept=".json,.csv" 
        onChange={handleFileUpload} 
        className="hidden"
      />
    </>
  );
};
