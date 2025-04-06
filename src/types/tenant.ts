
export interface Tenant {
  id: string;
  name: string;
  settings: {
    theme: string;
    features: string[];
  };
}

export interface TenantContextType {
  currentTenant: Tenant | null;
  isLoading: boolean;
  error: Error | null;
  setCurrentTenant: (tenant: Tenant) => void;
  updateTenantSettings: (settings: Partial<Tenant['settings']>) => void;
}
