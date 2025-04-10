
import { useState } from 'react';
import { Equipment, Document as EquipmentDocument } from '@/components/equipment/types';

export const useInventoryOperations = (
  equipmentData: Equipment[], 
  setEquipmentData: React.Dispatch<React.SetStateAction<Equipment[]>>
) => {
  // Handler for applying saved filters
  const handleApplySavedFilter = (
    filter: any, 
    setSearchQuery: (query: string) => void,
    setActiveCategory: (category: any) => void,
    setActiveStatus: (status: string) => void,
    setAdvancedFilters: (filters: any) => void
  ) => {
    setSearchQuery(filter.searchQuery);
    setActiveCategory(filter.activeCategory);
    setActiveStatus(filter.activeStatus);
    setAdvancedFilters(filter.advancedFilters);
  };

  // Handler for batch updates
  const handleBatchUpdate = (
    updatedItems: Equipment[],
    clearSelection: () => void
  ) => {
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

  // Handler for checking out equipment
  const handleCheckout = (equipment: Equipment, name: string, returnDate: Date) => {
    const updatedEquipment = equipmentData.map(item => 
      item.id === equipment.id 
        ? { ...item, isCheckedOut: true, checkedOutTo: name }
        : item
    );
    
    setEquipmentData(updatedEquipment);
  };

  // Handler for checking in equipment
  const handleCheckin = (equipment: Equipment) => {
    const updatedEquipment = equipmentData.map(item => 
      item.id === equipment.id 
        ? { ...item, isCheckedOut: false, checkedOutTo: undefined }
        : item
    );
    
    setEquipmentData(updatedEquipment);
  };

  // Handler for adding a document to equipment
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

  return {
    handleApplySavedFilter,
    handleBatchUpdate,
    handleCheckout,
    handleCheckin,
    handleAddDocument
  };
};
