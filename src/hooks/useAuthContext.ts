
import { useAuth } from '@/contexts/AuthContext';

// Re-export the useAuth hook from AuthContext
export { useAuth };

// For backward compatibility
export const useAuthContext = useAuth;
