
import React from 'react';
import { Equipment, Document as EquipmentDocument } from '@/components/equipment/types';
import { SavedFiltersDialog } from '../filters/SavedFiltersDialog';
import { CheckoutDialog } from '../checkout/CheckoutDialog';
import { QRCodeGenerator } from '../qrcode/QRCodeGenerator';
import { DocumentAttachment } from '../compliance/DocumentAttachment';

interface InventoryFeatureControlsProps {
  filteredEquipment: Equipment[];
  searchQuery: string;
  activeCategory: any;
  activeStatus: string;
  advancedFilters: any;
  onApplyFilter: (filter: any) => void;
  onCheckout: (equipment: Equipment, name: string, returnDate: Date) => void;
  onCheckin: (equipment: Equipment) => void;
  onAddDocument: (equipment: Equipment, document: EquipmentDocument) => void;
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
  if (isMobile) {
    return (
      <div className="flex justify-end gap-2 flex-wrap">
        <SavedFiltersDialog
          currentSearchQuery={searchQuery}
          currentCategory={activeCategory}
          currentStatus={activeStatus}
          currentAdvancedFilters={advancedFilters}
          onApplyFilter={onApplyFilter}
        />
      </div>
    );
  }

  return (
    <div className="flex justify-end gap-2 flex-wrap">
      <SavedFiltersDialog
        currentSearchQuery={searchQuery}
        currentCategory={activeCategory}
        currentStatus={activeStatus}
        currentAdvancedFilters={advancedFilters}
        onApplyFilter={onApplyFilter}
      />

      {filteredEquipment.map(item => (
        <React.Fragment key={item.id}>
          <CheckoutDialog 
            equipment={item} 
            onCheckout={onCheckout}
            onCheckin={onCheckin}
          />
          <QRCodeGenerator equipment={item} />
          <DocumentAttachment
            equipment={item}
            onAddDocument={onAddDocument}
          />
        </React.Fragment>
      ))}
    </div>
  );
};
