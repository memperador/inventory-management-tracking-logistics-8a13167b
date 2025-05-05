
import { User, Session } from '@supabase/supabase-js';

export interface ProcessingState {
  signIn: boolean;
  signUp: boolean;
  signOut: boolean;
  resetPassword: boolean;
  refreshSession: boolean;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  sessionError?: Error | null;
  isProcessing?: ProcessingState;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, firstName: string, lastName: string, companyName: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshSession: () => Promise<any>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
  onUserChange?: (userId: string | null) => void;
}
