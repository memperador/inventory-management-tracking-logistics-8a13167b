
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
          filters={advancedFilters}
          onFilterChange={(key, value) => {
            // Create a new filter object with the updated value
            const newAdvancedFilters = {
              ...advancedFilters,
              [key]: value
            };
            // Apply the updated filter
            onApplyFilter({
              searchQuery,
              activeCategory,
              activeStatus,
              advancedFilters: newAdvancedFilters
            });
          }}
        />
        
        <div className="flex gap-2">
          <SavedFiltersDialog 
            currentSearchQuery={searchQuery}
            currentCategory={activeCategory}
            currentStatus={activeStatus}
            currentAdvancedFilters={advancedFilters}
            onApplyFilter={onApplyFilter}
          />
          
          {/* If there's at least one non-checked out equipment item, show the checkout dialog */}
          {filteredEquipment.length > 0 && filteredEquipment.some(e => !e.isCheckedOut) && (
            <CheckoutDialog
              equipment={filteredEquipment.find(e => !e.isCheckedOut)!}
              onCheckout={onCheckout}
              onCheckin={onCheckin}
              onAddDocument={onAddDocument}
            />
          )}
        </div>
      </div>
    </div>
  );
};
