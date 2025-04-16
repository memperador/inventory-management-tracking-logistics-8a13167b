
import { useAuth } from '@/contexts/auth/AuthContext';

// Re-export the useAuth hook
export { useAuth };

// For backward compatibility
export const useAuthContext = useAuth;
