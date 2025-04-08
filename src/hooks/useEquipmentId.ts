
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenantContext';
import { generateEquipmentId } from '@/utils/equipmentIdUtils';

export const useEquipmentId = () => {
  const { currentTenant } = useTenant();
  const [nextId, setNextId] = useState<string | null>(null);

  // Get the highest sequential number from existing equipment
  const { data: latestEquipment } = useQuery({
    queryKey: ['latestEquipmentId', currentTenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      return data?.[0] || null;
    }
  });

  useEffect(() => {
    if (currentTenant && latestEquipment) {
      // Extract tenant prefix (first 2-5 chars of tenant name)
      const tenantPrefix = currentTenant.name.slice(0, 5).replace(/[^A-Za-z]/g, '');
      
      // Get the latest sequential number and increment by 1
      const currentNumber = latestEquipment.id ? 
        parseInt(latestEquipment.id.match(/\d{5}$/)?.[0] || '0', 10) : 0;
      
      const newId = generateEquipmentId(tenantPrefix, currentNumber + 1);
      setNextId(newId);
    }
  }, [currentTenant, latestEquipment]);

  return { nextId };
};
