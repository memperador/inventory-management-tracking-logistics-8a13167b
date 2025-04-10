
import React, { useState, useEffect } from 'react';
import { InventoryHeader } from '@/components/inventory/InventoryHeader';
import { ComplianceSection } from '@/components/inventory/ComplianceSection';
import { useInventoryImportExport } from '@/components/inventory/inventoryUtils';
import { VendorIntegration } from '@/components/inventory/vendor/VendorIntegration';
import { NewInventoryItemDialog } from '@/components/inventory/NewInventoryItemDialog';
import { useToast } from '@/hooks/use-toast';
import { InventoryFeatureControls } from '@/components/inventory/inventory-tabs/InventoryFeatureControls';
import { Equipment, Document as EquipmentDocument } from '@/components/equipment/types';
import { InventoryTabsContainer } from '@/components/inventory/tabs/InventoryTabsContainer';
import { UpgradeBanner } from '@/components/subscription/UpgradeBanner';
import { BatchOperationsBar } from '@/components/inventory/batch/BatchOperationsBar';

interface InventoryPageContentProps {
  equipmentData: Equipment[];
  setEquipmentData: React.Dispatch<React.SetStateAction<Equipment[]>>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: any;
  setActiveCategory: (category: any) => void;
  activeStatus: string;
  setActiveStatus: (status: string) => void;
  advancedFilters: any;
  setAdvancedFilters: (filters: any) => void;
  filteredEquipment: Equipment[];
  activeTab: any;
  setActiveTab: (tab: any) => void;
  selectedEquipment: Equipment[];
  toggleItemSelection: (item: Equipment) => void;
  clearSelection: () => void;
  showVendorIntegration: boolean;
  setShowVendorIntegration: (show: boolean) => void;
  isNewItemDialogOpen: boolean;
  setIsNewItemDialogOpen: (open: boolean) => void;
  handleClearFilters: () => void;
  isMobile: boolean;
  showUpgradeBanner: boolean;
}

export const InventoryPageContent: React.FC<InventoryPageContentProps> = ({
  equipmentData,
  setEquipmentData,
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  activeStatus,
  setActiveStatus,
  advancedFilters,
  setAdvancedFilters,
  filteredEquipment,
  activeTab,
  setActiveTab,
  selectedEquipment,
  toggleItemSelection,
  clearSelection,
  showVendorIntegration,
  setShowVendorIntegration,
  isNewItemDialogOpen,
  setIsNewItemDialogOpen,
  handleClearFilters,
  isMobile,
  showUpgradeBanner
}) => {
  const { toast } = useToast();
  
  const { handleImport, handleFileUpload, handleExport, handleExportCSV } = useInventoryImportExport();
  
  const handleApplySavedFilter = (filter: any) => {
    setSearchQuery(filter.searchQuery);
    setActiveCategory(filter.activeCategory);
    setActiveStatus(filter.activeStatus);
    setAdvancedFilters(filter.advancedFilters);
  };

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

  // Create wrapper functions to pass filtered equipment data to export functions
  const handleExportWrapper = () => {
    handleExport(filteredEquipment);
  };

  const handleExportCSVWrapper = () => {
    handleExportCSV(filteredEquipment);
  };

  return (
    <div className="space-y-6">
      {showUpgradeBanner && <UpgradeBanner />}
      
      <InventoryHeader 
        onImport={handleImport}
        onExport={handleExportWrapper}
        onExportCSV={handleExportCSVWrapper}
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
      
      <InventoryTabsContainer
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        filteredEquipment={filteredEquipment}
        equipmentData={equipmentData}
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
  );
};
