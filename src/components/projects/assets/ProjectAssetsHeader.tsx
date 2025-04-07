
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectAssetsHeaderProps {
  onAddAsset: () => void;
}

export const ProjectAssetsHeader: React.FC<ProjectAssetsHeaderProps> = ({ onAddAsset }) => {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium">Project Assets</h3>
      <Button onClick={onAddAsset} size="sm">
        <Plus className="h-4 w-4 mr-1" />
        Add Asset
      </Button>
    </div>
  );
};

export default ProjectAssetsHeader;
