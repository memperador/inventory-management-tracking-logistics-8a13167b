
import { useState, useEffect } from 'react';
import { Equipment, Document as EquipmentDocument } from '@/components/equipment/types';
import { useToast } from '@/hooks/use-toast';

export const useInventoryData = (initialData: Equipment[]) => {
  const [equipmentData, setEquipmentData] = useState<Equipment[]>(initialData);
  const { toast } = useToast();
  
  // Check for expired certifications and show notifications
  useEffect(() => {
    const expiredItems = equipmentData.filter(item => {
      if (item.certificationRequired && item.certificationExpiry) {
        const expiryDate = new Date(item.certificationExpiry);
        if (expiryDate < new Date()) {
          return true;
        }
      }
      return false;
    });
    
    if (expiredItems.length > 0) {
      const timer = setTimeout(() => {
        toast({
          title: "Compliance Alert",
          description: `${expiredItems.length} items have expired certifications`,
          variant: "destructive",
        });
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [equipmentData, toast]);

  return {
    equipmentData,
    setEquipmentData
  };
};
