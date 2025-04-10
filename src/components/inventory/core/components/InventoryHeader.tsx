
import React from 'react';
import { InventoryHeader } from '@/components/inventory/InventoryHeader';
import { useInventoryImportExport } from '@/components/inventory/inventoryUtils';
import { Equipment } from '@/components/equipment/types';

interface InventoryHeaderProps {
  filteredEquipment: Equipment[];
  showVendorIntegration: boolean;
  setShowVendorIntegration: (show: boolean) => void;
  setIsNewItemDialogOpen: (open: boolean) => void;
}

export const EnhancedInventoryHeader: React.FC<InventoryHeaderProps> = ({
  filteredEquipment,
  showVendorIntegration,
  setShowVendorIntegration,
  setIsNewItemDialogOpen
}) => {
  const { handleImport, handleFileUpload, handleExport, handleExportCSV } = useInventoryImportExport();
  
  // Create wrapper functions to pass filtered equipment data to export functions
  const handleExportWrapper = () => {
    handleExport(filteredEquipment);
  };

  const handleExportCSVWrapper = () => {
    handleExportCSV(filteredEquipment);
  };

  return (
    <InventoryHeader 
      onImport={handleImport}
      onExport={handleExportWrapper}
      onExportCSV={handleExportCSVWrapper}
      onAddItem={() => setIsNewItemDialogOpen(true)}
      onToggleVendorIntegration={() => setShowVendorIntegration(!showVendorIntegration)}
      showVendorIntegration={showVendorIntegration}
    />
  );
};
