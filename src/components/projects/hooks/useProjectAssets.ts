
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProjectAsset } from '../types/projectTypes';
import { Equipment } from '@/components/equipment/types';

export const useProjectAssets = (projectId: string) => {
  const [assets, setAssets] = useState<ProjectAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
          // Use type as category if not present in database
          category: item.equipment.type as Equipment['category'] || undefined,
          type: item.equipment.type || '',
          name: item.equipment.name,
          id: item.equipment.id,
          tenant_id: item.equipment.tenant_id,
          location: item.equipment.location || '',
          gpsTag: item.equipment.gps_tag || '',
          lastMaintenance: item.equipment.last_maintenance || new Date().toISOString(),
          nextMaintenance: item.equipment.next_maintenance || new Date().toISOString()
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

  useEffect(() => {
    fetchProjectAssets();
  }, [projectId]);

  return {
    assets,
    isLoading,
    fetchAssets: fetchProjectAssets,
    removeAsset: handleRemoveAsset
  };
};

export default useProjectAssets;
