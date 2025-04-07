
import { useState, useEffect } from 'react';
import { Equipment } from '@/components/equipment/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useEquipmentSelection = (projectId: string, tenantId: string | undefined) => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEquipment = async () => {
      if (!tenantId) return;
      
      setIsLoading(true);
      try {
        let query = supabase
          .from('equipment')
          .select('*')
          .eq('tenant_id', tenantId);
        
        // Exclude equipment already assigned to this project and not removed
        const { data: assignedEquipment } = await supabase
          .from('project_equipment')
          .select('equipment_id')
          .eq('project_id', projectId)
          .is('removed_date', null);
        
        if (assignedEquipment && assignedEquipment.length > 0) {
          const assignedIds = assignedEquipment.map(item => item.equipment_id);
          query = query.not('id', 'in', assignedIds);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Transform the data to match the Equipment type
        const transformedData: Equipment[] = data?.map(item => ({
          ...item,
          // Set default values for required Equipment properties
          status: item.status as Equipment['status'] || 'Operational',
          category: item.category as Equipment['category'] || undefined,
          type: item.type || '',
          name: item.name,
          id: item.id,
          tenant_id: item.tenant_id
        })) || [];
        
        setEquipment(transformedData);
      } catch (error) {
        console.error('Error fetching equipment:', error);
        toast({
          title: "Error",
          description: "Failed to load equipment",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEquipment();
  }, [projectId, tenantId]);

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = searchQuery ? 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.type && item.type.toLowerCase().includes(searchQuery.toLowerCase())) : 
      true;
    
    const matchesCategory = categoryFilter ? 
      item.category === categoryFilter : 
      true;
    
    return matchesSearch && matchesCategory;
  });

  return {
    equipment,
    filteredEquipment,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    isLoading
  };
};

export default useEquipmentSelection;
