
export interface UserLookupResult {
  userId: string;
  email: string;
  displayName: string;
}

export interface TenantMigrationUser {
  id: string;
  name: string;
  role: string;
  tenant_id: string;
  tenantName: string;
  created_at: string;
}
