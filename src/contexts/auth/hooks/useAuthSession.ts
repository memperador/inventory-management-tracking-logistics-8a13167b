
import { useMemoizedAuthSession } from './useMemoizedAuthSession';

// This hook now uses the optimized memoized version
export const useAuthSession = (onUserChange?: (userId: string | null) => void) => {
  const { user, session, loading, sessionError } = useMemoizedAuthSession(onUserChange);

  return {
    user,
    session,
    loading,
    sessionError
  };
};
