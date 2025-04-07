
import React from 'react';
import { LayoutGrid, List, Rows } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ViewMode = 'grid' | 'list' | 'compact';

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
        aria-label="Grid view"
        title="Grid view"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button 
        variant={viewMode === 'compact' ? 'default' : 'outline'} 
        size="sm"
        onClick={() => onViewModeChange('compact')}
        aria-label="Compact view"
        title="Compact view"
      >
        <Rows className="h-4 w-4" />
      </Button>
      <Button 
        variant={viewMode === 'list' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewModeChange('list')}
        aria-label="List view"
        title="List view"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
};

export { type ViewMode };
