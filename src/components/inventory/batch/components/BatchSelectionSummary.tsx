
import React from 'react';
import { Button } from '@/components/ui/button';

interface BatchSelectionSummaryProps {
  selectedCount: number;
  onClearSelection: () => void;
}

export const BatchSelectionSummary: React.FC<BatchSelectionSummaryProps> = ({
  selectedCount,
  onClearSelection
}) => {
  return (
    <div className="flex items-center gap-2">
      <span className="font-medium">{selectedCount} items selected</span>
      <Button variant="outline" size="sm" onClick={onClearSelection}>
        Clear
      </Button>
    </div>
  );
};
