
import React from 'react';
import { Equipment } from '@/components/equipment/types';
import { BatchSelectionSummary } from './components/BatchSelectionSummary';
import { BatchStatusOperations } from './components/BatchStatusOperations';
import { BatchLocationOperations } from './components/BatchLocationOperations';
import { BatchMaintenanceOperations } from './components/BatchMaintenanceOperations';
import { useBatchOperations } from './hooks/useBatchOperations';
import { COMMON_LOCATIONS } from './constants/locations';

interface BatchOperationsBarProps {
  selectedItems: Equipment[];
  onClearSelection: () => void;
  onUpdateItems: (updatedItems: Equipment[]) => void;
}

export const BatchOperationsBar: React.FC<BatchOperationsBarProps> = ({
  selectedItems,
  onClearSelection,
  onUpdateItems
}) => {
  const { 
    isProcessing,
    handleStatusChange,
    handleLocationChange,
    scheduleMaintenance
  } = useBatchOperations({
    selectedItems,
    onUpdateItems,
    onClearSelection
  });

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-background border shadow-lg rounded-lg p-4 flex items-center gap-4">
      <BatchSelectionSummary 
        selectedCount={selectedItems.length} 
        onClearSelection={onClearSelection} 
      />

      <div className="h-8 w-px bg-border mx-2" />

      <BatchStatusOperations 
        isProcessing={isProcessing}
        onStatusChange={handleStatusChange}
      />

      <BatchLocationOperations 
        isProcessing={isProcessing}
        onLocationChange={handleLocationChange}
        commonLocations={COMMON_LOCATIONS}
      />

      <BatchMaintenanceOperations 
        isProcessing={isProcessing}
        onScheduleMaintenance={scheduleMaintenance}
      />
    </div>
  );
};
