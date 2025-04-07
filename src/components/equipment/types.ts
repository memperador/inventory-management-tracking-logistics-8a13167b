
export interface Equipment {
  id: string;
  name: string;
  type: string;
  image?: string;
  status: 'Operational' | 'Maintenance' | 'Out of Service' | 'Testing' | 'Certification Pending';
  location: string;
  utilization?: number;
  lastMaintenance?: string;
  nextMaintenance?: string;
  documentCount?: number;
  documents?: Document[];
  isCheckedOut?: boolean;
  checkedOutTo?: string;
  gpsTag?: string;
  csi_code?: string;
  nec_code?: string;
  tenant_id: string;
  cost?: number;
  purchaseDate?: string; // Date when equipment was purchased
  lifespan?: number; // Expected lifespan in years
  category?: InventoryCategory; // New property to categorize by inventory type
  model?: string;
  manufacturer?: string;
  serialNumber?: string;
  warrantyExpiration?: string;
  condition?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  uploadedBy: string;
}

export interface ProjectType {
  id: string;
  name: string;
  site_address: string | null;
  start_date: string | null;
  end_date: string | null;
  status: 'active' | 'completed' | 'planned' | string;
  equipment_count?: number;
  equipment_cost?: number;
  depreciated_cost?: number;
  team_size?: number;
  created_at?: string;
  updated_at?: string;
  tenant_id?: string;
  geofence_coordinates?: any;
  electrical_category?: string;
  permit_number?: string;
}

// New enum for inventory categories
export type InventoryCategory = 
  | 'Heavy Equipment' 
  | 'Power Tools' 
  | 'Hand Tools' 
  | 'Vehicles' 
  | 'Electrical' 
  | 'Plumbing' 
  | 'HVAC' 
  | 'Safety' 
  | 'Materials' 
  | 'Specialty';

export const INVENTORY_CATEGORIES: InventoryCategory[] = [
  'Heavy Equipment',
  'Power Tools',
  'Hand Tools',
  'Vehicles',
  'Electrical',
  'Plumbing',
  'HVAC',
  'Safety',
  'Materials',
  'Specialty'
];

export interface InventoryFilters {
  searchQuery: string;
  category?: InventoryCategory | 'All';
  status?: Equipment['status'] | 'All';
  location?: string | 'All';
}
