
import { Equipment } from '@/components/equipment/types';

export interface PurchaseOrder {
  id: string;
  equipmentId?: string;
  equipmentName: string;
  quantity: number;
  status: 'pending' | 'approved' | 'ordered' | 'delivered';
  requestDate: string;
  expectedDelivery?: string;
  vendor?: string;
  cost?: number;
}

export interface NewOrderFormData {
  equipmentName: string;
  quantity: number;
  vendor: string;
  estimatedCost: string;
}

export interface BulkOrderItem {
  equipmentName: string;
  quantity: number;
  vendor: string;
  estimatedCost: string;
}

export interface ProcurementIntegrationProps {
  equipmentData: Equipment[];
}
