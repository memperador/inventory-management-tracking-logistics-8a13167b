
import React, { useState } from 'react';
import { InventoryHeader } from '@/components/inventory/InventoryHeader';
import { InventoryFilters } from '@/components/inventory/InventoryFilters';
import { InventoryViewSelector, ViewMode } from '@/components/inventory/InventoryViewSelector';
import { InventoryCategoryTabs } from '@/components/inventory/InventoryCategoryTabs';
import { EmptyInventoryState } from '@/components/inventory/EmptyInventoryState';
import { ComplianceSection } from '@/components/inventory/ComplianceSection';
import { useInventoryImportExport } from '@/components/inventory/inventoryUtils';
import { EquipmentList } from '@/components/equipment/EquipmentList';
import { EquipmentListView } from '@/components/equipment/EquipmentListView';
import { equipmentData } from '@/components/equipment/EquipmentData';
import { InventoryCategory } from '@/components/equipment/types';
import { VendorIntegration } from '@/components/inventory/VendorIntegration';
import { NewInventoryItemDialog } from '@/components/inventory/NewInventoryItemDialog';

const Inventory = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [activeCategory, setActiveCategory] = useState<InventoryCategory | 'All'>('All');
  const [activeStatus, setActiveStatus] = useState<string>('All');
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false);
  const [showVendorIntegration, setShowVendorIntegration] = useState(false);
  
  const { handleImport, handleFileUpload, handleExport } = useInventoryImportExport();
  
  // Filter equipment based on search query and active filters
  const filteredEquipment = equipmentData.filter(equipment => {
    const matchesSearch = 
      equipment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      activeCategory === 'All' || 
      equipment.category === activeCategory;
      
    const matchesStatus = 
      activeStatus === 'All' || 
      equipment.status === activeStatus;
      
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handler functions
  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveCategory('All');
    setActiveStatus('All');
  };

  const handleExportData = () => {
    handleExport(filteredEquipment);
  };

  return (
    <div className="space-y-6">
      <InventoryHeader 
        onImport={handleImport}
        onExport={handleExportData}
        onAddItem={() => setIsNewItemDialogOpen(true)}
        onToggleVendorIntegration={() => setShowVendorIntegration(!showVendorIntegration)}
        showVendorIntegration={showVendorIntegration}
      />
      
      {showVendorIntegration && <VendorIntegration />}
      
      <InventoryFilters 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
      />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <InventoryCategoryTabs 
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
        
        <InventoryViewSelector 
          viewMode={viewMode} 
          onViewModeChange={setViewMode}
        />
      </div>

      {filteredEquipment.length > 0 ? (
        viewMode === 'grid' ? (
          <EquipmentList equipmentData={filteredEquipment} />
        ) : (
          <EquipmentListView equipmentData={filteredEquipment} />
        )
      ) : (
        <EmptyInventoryState onClearFilters={handleClearFilters} />
      )}
      
      <ComplianceSection />
      
      <NewInventoryItemDialog 
        open={isNewItemDialogOpen} 
        onOpenChange={setIsNewItemDialogOpen} 
      />
      
      <input 
        type="file" 
        id="file-upload" 
        accept=".json" 
        onChange={handleFileUpload} 
        className="hidden"
      />
    </div>
  );
};

export default Inventory;
