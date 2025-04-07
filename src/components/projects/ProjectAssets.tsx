
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectAssetTable } from './assets/ProjectAssetTable';
import { AddAssetDialog } from './AddAssetDialog';
import { useProjectAssets } from './hooks/useProjectAssets';

interface ProjectAssetsProps {
  projectId: string;
}

export const ProjectAssets: React.FC<ProjectAssetsProps> = ({ projectId }) => {
  const [showAddAssetDialog, setShowAddAssetDialog] = useState(false);
  const { assets, isLoading, fetchAssets, removeAsset } = useProjectAssets(projectId);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Project Assets</h3>
        <Button onClick={() => setShowAddAssetDialog(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Asset
        </Button>
      </div>
      
      <ProjectAssetTable 
        assets={assets}
        isLoading={isLoading}
        onRemoveAsset={removeAsset}
      />
      
      <AddAssetDialog 
        open={showAddAssetDialog} 
        onOpenChange={setShowAddAssetDialog}
        projectId={projectId}
        onAssetAdded={fetchAssets}
      />
    </div>
  );
};

export default ProjectAssets;
