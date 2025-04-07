
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { AddAssetDialog } from './AddAssetDialog';
import { Equipment } from '@/components/equipment/types';
import { useTenantContext } from '@/hooks/useTenantContext';

interface ProjectAssetsProps {
  projectId: string;
}

export interface ProjectAsset {
  id: string;
  equipment: Equipment;
  assigned_date: string;
  removed_date: string | null;
  is_temporary: boolean;
}

export const ProjectAssets: React.FC<ProjectAssetsProps> = ({ projectId }) => {
  const [assets, setAssets] = useState<ProjectAsset[]>([]);
  const [showAddAssetDialog, setShowAddAssetDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { currentTenant } = useTenantContext();

  const fetchProjectAssets = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_equipment')
        .select(`
          id,
          assigned_date,
          removed_date,
          is_temporary,
          equipment:equipment_id (*)
        `)
        .eq('project_id', projectId);
      
      if (error) throw error;
      
      // Transform the data to match the ProjectAsset type
      const transformedData: ProjectAsset[] = data?.map(item => ({
        id: item.id,
        assigned_date: item.assigned_date,
        removed_date: item.removed_date,
        is_temporary: item.is_temporary === null ? false : !!item.is_temporary,
        equipment: {
          ...item.equipment,
          // Ensure equipment properties match Equipment type
          status: item.equipment.status as Equipment['status'] || 'Operational',
          category: item.equipment.category as Equipment['category'] || undefined,
          type: item.equipment.type || '',
          name: item.equipment.name,
          id: item.equipment.id,
          tenant_id: item.equipment.tenant_id
        }
      })) || [];
      
      setAssets(transformedData);
    } catch (error) {
      console.error('Error fetching project assets:', error);
      toast({
        title: "Error",
        description: "Failed to load project assets",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectAssets();
  }, [projectId]);
  
  const handleRemoveAsset = async (assetId: string) => {
    try {
      const { error } = await supabase
        .from('project_equipment')
        .update({
          removed_date: new Date().toISOString()
        })
        .eq('id', assetId);
      
      if (error) throw error;
      
      toast({
        title: "Asset removed",
        description: "Asset has been removed from the project"
      });
      
      fetchProjectAssets();
    } catch (error) {
      console.error('Error removing asset:', error);
      toast({
        title: "Error",
        description: "Failed to remove asset from project",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Project Assets</h3>
        <Button onClick={() => setShowAddAssetDialog(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Asset
        </Button>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned Date</TableHead>
              <TableHead>Permanent/Temporary</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading assets...
                </TableCell>
              </TableRow>
            ) : assets.length > 0 ? (
              assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">{asset.equipment.name}</TableCell>
                  <TableCell>{asset.equipment.type}</TableCell>
                  <TableCell>{asset.equipment.category || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge 
                      className={`
                        ${asset.equipment.status === 'Operational' ? 'bg-green-100 text-green-800' : 
                         asset.equipment.status === 'Maintenance' ? 'bg-amber-100 text-amber-800' : 
                         'bg-red-100 text-red-800'}
                      `}
                    >
                      {asset.equipment.status || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(asset.assigned_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={asset.is_temporary ? "outline" : "default"}>
                      {asset.is_temporary ? 'Temporary' : 'Permanent'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {!asset.removed_date && (
                      <Button
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveAsset(asset.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No assets assigned to this project yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <AddAssetDialog 
        open={showAddAssetDialog} 
        onOpenChange={setShowAddAssetDialog}
        projectId={projectId}
        onAssetAdded={fetchProjectAssets}
      />
    </div>
  );
};

export default ProjectAssets;
