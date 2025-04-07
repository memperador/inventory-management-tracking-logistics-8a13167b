
import React from 'react';
import { Plus, Import, FileDown, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface InventoryHeaderProps {
  onImport: () => void;
  onExport: () => void;
  onAddItem: () => void;
  onToggleVendorIntegration: () => void;
  showVendorIntegration: boolean;
}

export const InventoryHeader: React.FC<InventoryHeaderProps> = ({
  onImport,
  onExport,
  onAddItem,
  onToggleVendorIntegration,
  showVendorIntegration,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-gray-500 mt-1">Manage your complete inventory assets across all equipment types</p>
      </div>
      <div className="flex gap-2 flex-wrap justify-end">
        <input 
          type="file" 
          id="file-upload" 
          accept=".json" 
          className="hidden"
        />
        <Button variant="outline" onClick={onImport}>
          <Import className="mr-2 h-4 w-4" />
          Import
        </Button>
        <Button variant="outline" onClick={onExport}>
          <FileDown className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Button variant="outline" onClick={onToggleVendorIntegration}>
          <Package className="mr-2 h-4 w-4" />
          Vendor Integration
        </Button>
        <Button onClick={onAddItem}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>
    </div>
  );
};
