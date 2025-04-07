
import React, { useState } from 'react';
import { ProjectAssetTable } from './assets/ProjectAssetTable';
import { AddAssetDialog } from './AddAssetDialog';
import { useProjectAssets } from './hooks/useProjectAssets';
import ProjectAssetsHeader from './assets/ProjectAssetsHeader';

interface ProjectAssetsProps {
  projectId: string;
}

export const ProjectAssets: React.FC<ProjectAssetsProps> = ({ projectId }) => {
  const [showAddAssetDialog, setShowAddAssetDialog] = useState(false);
  const { assets, isLoading, fetchAssets, removeAsset } = useProjectAssets(projectId);

  const handleAddAssetClick = () => {
    setShowAddAssetDialog(true);
  };

  return (
    <div className="space-y-4">
      <ProjectAssetsHeader onAddAsset={handleAddAssetClick} />
      
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
