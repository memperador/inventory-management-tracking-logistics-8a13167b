
import { Equipment } from '@/components/equipment/types';

export interface ProjectAsset {
  id: string;
  equipment: Equipment;
  assigned_date: string;
  removed_date: string | null;
  is_temporary: boolean;
}
