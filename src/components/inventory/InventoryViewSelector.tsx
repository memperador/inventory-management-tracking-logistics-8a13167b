
import React from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ViewMode = 'grid' | 'list';

interface InventoryViewSelectorProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const InventoryViewSelector: React.FC<InventoryViewSelectorProps> = ({
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant={viewMode === 'grid' ? 'default' : 'outline'} 
        size="sm"
        onClick={() => onViewModeChange('grid')}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button 
        variant={viewMode === 'list' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewModeChange('list')}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
};

export { type ViewMode };
