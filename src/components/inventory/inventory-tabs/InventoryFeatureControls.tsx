
import React from 'react';
import { Equipment, Document } from '@/components/equipment/types';
import { FilterBadges } from '@/components/inventory/filters/FilterBadges';
import { SavedFiltersDialog } from '@/components/inventory/filters/SavedFiltersDialog';
import { CheckoutDialog } from '@/components/inventory/checkout/CheckoutDialog';
import { AdvancedFiltersType } from '@/components/inventory/filters/types';

interface InventoryFeatureControlsProps {
  filteredEquipment: Equipment[];
  searchQuery: string;
  activeCategory: any;
  activeStatus: string;
  advancedFilters: AdvancedFiltersType;
  onApplyFilter: (filter: any) => void;
  onCheckout: (equipment: Equipment, name: string, returnDate: Date) => void;
  onCheckin: (equipment: Equipment) => void;
  onAddDocument: (equipment: Equipment, document: Document) => void;
  isMobile: boolean;
}

export const InventoryFeatureControls: React.FC<InventoryFeatureControlsProps> = ({
  filteredEquipment,
  searchQuery,
  activeCategory,
  activeStatus,
  advancedFilters,
  onApplyFilter,
  onCheckout,
  onCheckin,
  onAddDocument,
  isMobile
}) => {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <FilterBadges
          searchQuery={searchQuery}
          activeCategory={activeCategory}
          activeStatus={activeStatus}
          advancedFilters={advancedFilters}
        />
        
        <div className="flex gap-2">
          <SavedFiltersDialog 
            currentFilters={{
              searchQuery,
              activeCategory,
              activeStatus,
              advancedFilters
            }}
            onApplyFilter={onApplyFilter}
          />
          <CheckoutDialog
            equipmentList={filteredEquipment.filter(e => !e.isCheckedOut)}
            onCheckout={onCheckout}
            onCheckin={onCheckin}
            onAddDocument={onAddDocument}
          />
        </div>
      </div>
    </div>
  );
};
