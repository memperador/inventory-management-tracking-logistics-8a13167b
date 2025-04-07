
import React from 'react';
import { Button } from '@/components/ui/button';

interface AssetActionsProps {
  assetId: string;
  isRemoved: boolean;
  onRemove: (id: string) => void;
}

export const AssetActions: React.FC<AssetActionsProps> = ({ 
  assetId, 
  isRemoved, 
  onRemove 
}) => {
  if (isRemoved) {
    return null;
  }

  return (
    <Button
      variant="ghost" 
      size="sm"
      onClick={() => onRemove(assetId)}
    >
      Remove
    </Button>
  );
};

export default AssetActions;
