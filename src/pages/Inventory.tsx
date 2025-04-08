
import React, { useState, useEffect } from 'react';
import { InventoryHeader } from '@/components/inventory/InventoryHeader';
import { ComplianceSection } from '@/components/inventory/ComplianceSection';
import { useInventoryImportExport } from '@/components/inventory/inventoryUtils';
import { equipmentData as initialEquipmentData } from '@/components/equipment/EquipmentData';
import { VendorIntegration } from '@/components/inventory/VendorIntegration';
import { NewInventoryItemDialog } from '@/components/inventory/NewInventoryItemDialog';
import { useToast } from '@/hooks/use-toast';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { useInventoryFilters } from '@/components/inventory/hooks/useInventoryFilters';
import { BatchOperationsBar } from '@/components/inventory/batch/BatchOperationsBar';
import { ProcurementIntegration } from '@/components/inventory/procurement/ProcurementIntegration';
import { EnhancedDashboard } from '@/components/inventory/analytics/EnhancedDashboard';
import { InventoryAlerts } from '@/components/inventory/alerts/InventoryAlerts';
import { InventoryAuditLogs } from '@/components/inventory/audit/InventoryAuditLogs';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Equipment, Document as EquipmentDocument } from '@/components/equipment/types';
import { useMediaQuery } from '@/hooks/use-mobile';
import { useInventoryTabs, InventoryTabType } from '@/components/inventory/hooks/useInventoryTabs';
import { InventoryTabList } from '@/components/inventory/inventory-tabs/InventoryTabList';
import { InventoryTabView } from '@/components/inventory/inventory-tabs/InventoryTabView';
import { InventoryFeatureControls } from '@/components/inventory/inventory-tabs/InventoryFeatureControls';
import { useEquipmentSelection } from '@/components/inventory/hooks/useEquipmentSelection';

const Inventory = () => {
  // State management
  const [equipmentData, setEquipmentData] = useState<Equipment[]>(initialEquipmentData);
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false);
  const [showVendorIntegration, setShowVendorIntegration] = useState(false);
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const { activeTab, setActiveTab } = useInventoryTabs();
  const { selectedEquipment, toggleItemSelection, clearSelection } = useEquipmentSelection();
  
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
  
  const { handleImport, handleFileUpload, handleExport: exportFunc, handleExportCSV: exportCSVFunc } = useInventoryImportExport();
  
  // Create wrapper functions that don't expect parameters
  const handleExport = () => exportFunc(filteredEquipment);
  const handleExportCSV = () => exportCSVFunc(filteredEquipment);
  
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

  // Handle batch operations
  const handleBatchUpdate = (updatedItems: Equipment[]) => {
    const updatedEquipmentData = [...equipmentData];
    
    updatedItems.forEach(updatedItem => {
      const index = updatedEquipmentData.findIndex(item => item.id === updatedItem.id);
      if (index !== -1) {
        updatedEquipmentData[index] = { ...updatedEquipmentData[index], ...updatedItem };
      }
    });
    
    setEquipmentData(updatedEquipmentData);
    clearSelection();
  };

  // Handle equipment check-in/check-out
  const handleCheckout = (equipment: Equipment, name: string, returnDate: Date) => {
    const updatedEquipment = equipmentData.map(item => 
      item.id === equipment.id 
        ? { ...item, isCheckedOut: true, checkedOutTo: name }
        : item
    );
    
    setEquipmentData(updatedEquipment);
  };

  const handleCheckin = (equipment: Equipment) => {
    const updatedEquipment = equipmentData.map(item => 
      item.id === equipment.id 
        ? { ...item, isCheckedOut: false, checkedOutTo: undefined }
        : item
    );
    
    setEquipmentData(updatedEquipment);
  };

  // Handle document attachment
  const handleAddDocument = (equipment: Equipment, document: EquipmentDocument) => {
    const updatedEquipment = equipmentData.map(item => {
      if (item.id === equipment.id) {
        const currentDocuments = item.documents || [];
        return {
          ...item,
          documents: [...currentDocuments, document],
          documentCount: (item.documentCount || 0) + 1
        };
      }
      return item;
    });
    
    setEquipmentData(updatedEquipment);
  };

  // Handle applying saved filter
  const handleApplySavedFilter = (filter: any) => {
    setSearchQuery(filter.searchQuery);
    setActiveCategory(filter.activeCategory);
    setActiveStatus(filter.activeStatus);
    setAdvancedFilters(filter.advancedFilters);
  };

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
        
        <InventoryFeatureControls 
          filteredEquipment={filteredEquipment}
          searchQuery={searchQuery}
          activeCategory={activeCategory}
          activeStatus={activeStatus}
          advancedFilters={advancedFilters}
          onApplyFilter={handleApplySavedFilter}
          onCheckout={handleCheckout}
          onCheckin={handleCheckin}
          onAddDocument={handleAddDocument}
          isMobile={isMobile}
        />
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as InventoryTabType)}>
          <InventoryTabList 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
          
          <TabsContent value="inventory">
            <InventoryTabView
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
              onAddItem={() => setIsNewItemDialogOpen(true)}
              isMobile={isMobile}
            />
          </TabsContent>
          
          <TabsContent value="procurement">
            <ProcurementIntegration equipmentData={equipmentData} />
          </TabsContent>
          
          <TabsContent value="analytics">
            <EnhancedDashboard equipmentData={equipmentData} />
          </TabsContent>
          
          <TabsContent value="alerts">
            <InventoryAlerts equipmentData={equipmentData} />
          </TabsContent>
          
          <TabsContent value="audit">
            <InventoryAuditLogs equipmentData={equipmentData} />
          </TabsContent>
        </Tabs>
        
        <ComplianceSection />
        
        <BatchOperationsBar
          selectedItems={selectedEquipment}
          onClearSelection={clearSelection}
          onUpdateItems={handleBatchUpdate}
        />
        
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
