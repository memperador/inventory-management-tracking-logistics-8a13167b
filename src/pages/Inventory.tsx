
import React, { useState } from 'react';
import { equipmentData as initialEquipmentData } from '@/components/equipment/EquipmentData';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { useInventoryFilters } from '@/components/inventory/hooks/useInventoryFilters';
import { useMediaQuery } from '@/hooks/use-mobile';
import { useInventoryTabs } from '@/components/inventory/hooks/useInventoryTabs';
import { useEquipmentSelection } from '@/components/inventory/hooks/useEquipmentSelection';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { useInventoryData } from '@/components/inventory/hooks/useInventoryData';
import { InventoryPageContent } from '@/components/inventory/core/InventoryPageContent';

const Inventory = () => {
  const { equipmentData, setEquipmentData } = useInventoryData(initialEquipmentData);
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false);
  const [showVendorIntegration, setShowVendorIntegration] = useState(false);
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
  } = useInventoryFilters();
  
  const filteredEquipment = filterEquipment(equipmentData);
  
  const { hasSubscriptionTier } = useFeatureAccess();
  const showUpgradeBanner = !hasSubscriptionTier('premium');
  
  return (
    <NotificationProvider>
      <InventoryPageContent
        equipmentData={equipmentData}
        setEquipmentData={setEquipmentData}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        activeStatus={activeStatus}
        setActiveStatus={setActiveStatus}
        advancedFilters={advancedFilters}
        setAdvancedFilters={setAdvancedFilters}
        filteredEquipment={filteredEquipment}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedEquipment={selectedEquipment}
        toggleItemSelection={toggleItemSelection}
        clearSelection={clearSelection}
        showVendorIntegration={showVendorIntegration}
        setShowVendorIntegration={setShowVendorIntegration}
        isNewItemDialogOpen={isNewItemDialogOpen}
        setIsNewItemDialogOpen={setIsNewItemDialogOpen}
        handleClearFilters={handleClearFilters}
        isMobile={isMobile}
        showUpgradeBanner={showUpgradeBanner}
      />
    </NotificationProvider>
  );
};

export default Inventory;
