import React, { useState } from 'react';
import { Plus, Import, FileDown, Package, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import { useOnboardingState } from '@/components/onboarding/hooks/useOnboardingState';

interface InventoryHeaderProps {
  onImport: () => void;
  onExport: () => void;
  onExportCSV?: () => void;
  onAddItem: () => void;
  onToggleVendorIntegration: () => void;
  showVendorIntegration: boolean;
}

export const InventoryHeader: React.FC<InventoryHeaderProps> = ({
  onImport,
  onExport,
  onExportCSV,
  onAddItem,
  onToggleVendorIntegration,
  showVendorIntegration,
}) => {
  const navigate = useNavigate();
  const { onboardingState } = useOnboardingState();
  
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
      </div>
      
      {!onboardingState.isComplete && (
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => navigate('/onboarding')}
        >
          <HelpCircle className="h-4 w-4" />
          Continue Onboarding
        </Button>
      )}
    </div>
  );
};
