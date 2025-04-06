
export type EquipmentStatus = 'operational' | 'maintenance' | 'out-of-service';

export type Equipment = {
  id: string;
  name: string;
  type: string;
  status: EquipmentStatus;
  location: string;
  lastMaintenance: string;
  nextMaintenance: string;
  gpsTag: string;
  tenantId: string;
};
