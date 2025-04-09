
// This file is kept for backward compatibility
// It re-exports all auth utilities from their modularized files

export {
  signUp,
  signIn,
  signOut,
  resetPassword,
  refreshSession
} from './auth';
