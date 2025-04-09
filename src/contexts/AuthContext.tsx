
// Re-export from the new location for backward compatibility
// This file exists to support a smooth transition after refactoring
// and should be cleaned up in future releases
import { AuthProvider, AuthContext, useAuth } from '@/contexts/auth/AuthContext';

export { AuthProvider, AuthContext, useAuth };
