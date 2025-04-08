
import React, { useState, useEffect } from 'react';
import { InventoryHeader } from '@/components/inventory/InventoryHeader';
import { InventoryTabContent } from '@/components/inventory/InventoryTabContent';
import { ComplianceSection } from '@/components/inventory/ComplianceSection';
import { useInventoryImportExport } from '@/components/inventory/inventoryUtils';
import { equipmentData } from '@/components/equipment/EquipmentData';
import { VendorIntegration } from '@/components/inventory/VendorIntegration';
import { NewInventoryItemDialog } from '@/components/inventory/NewInventoryItemDialog';
import { useToast } from '@/hooks/use-toast';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { useInventoryFilters } from '@/components/inventory/hooks/useInventoryFilters';

const Inventory = () => {
  // State management
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false);
  const [showVendorIntegration, setShowVendorIntegration] = useState(false);
  const { toast } = useToast();
  
  const {
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    activeStatus,
    setActiveStatus,
    advancedFilters,
    setAdvancedFilters,
    filterEquipment,
    handleClearFilters
  } = useInventoryFilters(() => {
    toast({
      title: "Filters Reset",
      description: "All inventory filters have been cleared."
    });
  });
  
  // Get filtered equipment based on all filters
  const filteredEquipment = filterEquipment(equipmentData);
  
  const { handleImport, handleFileUpload, handleExport, handleExportCSV } = useInventoryImportExport();
  
  // Check for compliance issues on initial load
  useEffect(() => {
    const expiredItems = equipmentData.filter(item => {
      if (item.certificationRequired && item.certificationExpiry) {
        const expiryDate = new Date(item.certificationExpiry);
        if (expiryDate < new Date()) {
          return true;
        }
      }
      return false;
    });
    
    if (expiredItems.length > 0) {
      // Show toast only after component has mounted
      const timer = setTimeout(() => {
        toast({
          title: "Compliance Alert",
          description: `${expiredItems.length} items have expired certifications`,
          variant: "destructive",
        });
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <NotificationProvider>
      <div className="space-y-6">
        <InventoryHeader 
          onImport={handleImport}
          onExport={handleExport}
          onExportCSV={handleExportCSV}
          onAddItem={() => setIsNewItemDialogOpen(true)}
          onToggleVendorIntegration={() => setShowVendorIntegration(!showVendorIntegration)}
          showVendorIntegration={showVendorIntegration}
        />
        
        {showVendorIntegration && <VendorIntegration />}
        
        <InventoryTabContent
          filteredEquipment={filteredEquipment}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          activeStatus={activeStatus}
          onStatusChange={setActiveStatus}
          advancedFilters={advancedFilters}
          onAdvancedFilterChange={setAdvancedFilters}
          onClearFilters={handleClearFilters}
        />
        
        <ComplianceSection />
        
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
      </div>
    </NotificationProvider>
  );
};

export default Inventory;
