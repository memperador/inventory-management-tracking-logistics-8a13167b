
import { useState } from 'react';
import { Equipment } from '@/components/equipment/types';

export const useEquipmentSelection = () => {
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>([]);
  
  const toggleItemSelection = (item: Equipment) => {
    const isSelected = selectedEquipment.some(selected => selected.id === item.id);
    
    if (isSelected) {
      setSelectedEquipment(selectedEquipment.filter(selected => selected.id !== item.id));
    } else {
      setSelectedEquipment([...selectedEquipment, item]);
    }
  };
  
  const clearSelection = () => {
    setSelectedEquipment([]);
  };

  return {
    selectedEquipment,
    toggleItemSelection,
    clearSelection
  };
};
