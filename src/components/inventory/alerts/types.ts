
export interface InventoryAlertConfig {
  inventoryLevel: number;
  emailEnabled: boolean;
  pushEnabled: boolean;
  type: 'low-inventory' | 'maintenance-due' | 'certification-expiring';
  name: string;
}
