
export interface Tenant {
  id: string;
  name: string;
  subscription_tier?: string;
  subscription_status?: string;
  settings: {
    theme: string;
    features: string[];
    logoUrl?: string | null;
  };
}

export interface TenantContextType {
  currentTenant: Tenant | null;
  isLoading: boolean;
  error: Error | null;
  setCurrentTenant: (tenant: Tenant) => void;
  updateTenantSettings: (settings: Partial<Tenant['settings']>) => void;
}
