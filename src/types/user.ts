
import { UserRole } from './roles';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive' | string;
  lastActive: string;
  tenantId?: string;
  tenantName?: string;
};
