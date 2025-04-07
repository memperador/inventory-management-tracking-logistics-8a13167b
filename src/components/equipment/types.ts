
export interface Equipment {
  id: string;
  name: string;
  type: string;
  image?: string;
  status: 'Operational' | 'Maintenance' | 'Out of Service';
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
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  uploadedBy: string;
}
