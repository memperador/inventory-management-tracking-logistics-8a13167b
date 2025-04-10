
import React from 'react';
import { Plus, Import, FileDown, Package, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface HeaderActionsProps {
  onImport: () => void;
  onExport: () => void;
  onExportCSV?: () => void;
  onAddItem: () => void;
  onToggleVendorIntegration: () => void;
  showVendorIntegration: boolean;
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({
  onImport,
  onExport,
  onExportCSV,
  onAddItem,
  onToggleVendorIntegration,
  showVendorIntegration,
}) => {
  return (
    <>
      <input 
        type="file" 
        id="file-upload" 
        accept=".json,.csv" 
        className="hidden"
      />
      <Button variant="outline" onClick={onImport}>
        <Import className="mr-2 h-4 w-4" />
        Import
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onExport}>
            <FileDown className="mr-2 h-4 w-4" />
            Export as JSON
          </DropdownMenuItem>
          {onExportCSV && (
            <DropdownMenuItem onClick={onExportCSV}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export as CSV
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button variant="outline" onClick={onToggleVendorIntegration}>
        <Package className="mr-2 h-4 w-4" />
        Vendor Integration
      </Button>
      
      <Button onClick={onAddItem}>
        <Plus className="mr-2 h-4 w-4" />
        Add Item
      </Button>
    </>
  );
};
