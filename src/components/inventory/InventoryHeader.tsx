
import React from 'react';
import { Plus, Import, FileDown, Package, FileSpreadsheet, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { useOnboardingState } from '@/components/onboarding/hooks/useOnboardingState';
import { HeaderActions } from './header/HeaderActions';
import { HeaderTitle } from './header/HeaderTitle';

interface InventoryHeaderProps {
  onImport: () => void;
  onExport: () => void;
  onExportCSV?: () => void;
  onAddItem: () => void;
  onToggleVendorIntegration: () => void;
  showVendorIntegration: boolean;
}

export const InventoryHeader: React.FC<InventoryHeaderProps> = (props) => {
  const navigate = useNavigate();
  const { onboardingState } = useOnboardingState();
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <HeaderTitle />
      
      <div className="flex gap-2 flex-wrap justify-end items-center">
        <HeaderActions {...props} />
        
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
    </div>
  );
};
