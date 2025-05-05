
# Authentication System Documentation

This document provides an overview of the security-enhanced authentication system.

## Architecture

The authentication system follows a modular design pattern with:
- Core context provider (`AuthContext.tsx`)
- Specialized hooks for session management (`useAuthSession.ts`)
- Authentication operations (`useAuthOperations.ts`)
- Utility modules for security features

## Security Features

### 1. Token Validation & Auto-Refresh
- Automatic token validation on every auth state change
- Proactive refresh of tokens before they expire
- Secure storage of tokens with proper cleanup

### 2. Rate Limiting
- Protection against brute force attacks
- Configurable rate limits for auth operations
- Automatic cleanup of rate limiting data

### 3. Session State Management
- Robust session validation
- Prevention of auth loops and redirect cycles
- Handling of edge cases (session expiry, invalid tokens)

### 4. Role-Based Access Control
- Fine-grained permission checks
- Role hierarchy support
- Protected routes with configurable requirements

### 5. Secure Data Handling
- Input validation and sanitization
- Protection against XSS attacks
- Secure error handling

## Usage Guide

### Basic Authentication

```tsx
import { useAuth } from '@/contexts/auth/AuthContext';

function MyComponent() {
  const { user, signIn, signOut } = useAuth();
  
  return (
    <div>
      {user ? (
        <button onClick={signOut}>Sign Out</button>
      ) : (
        <button onClick={() => signIn(email, password)}>Sign In</button>
      )}
    </div>
  );
}
```

### Protected Routes

```tsx
import ProtectedRoute from '@/components/auth/ProtectedRoute';

<Routes>
  <Route path="/public" element={<PublicPage />} />
  <Route
    path="/admin"
    element={
      <ProtectedRoute requiredRoles={['admin']}>
        <AdminDashboard />
      </ProtectedRoute>
    }
  />
</Routes>
```

### Role & Permission Checks

```tsx
import { hasRole, hasRoleLevel } from '@/contexts/auth/utils/authorizationUtils';

function AdminAction({ user }) {
  if (!hasRoleLevel(user, 'admin')) {
    return <p>Unauthorized</p>;
  }
  
  return <AdminPanel />;
}
```

## Best Practices

1. Always validate user input before passing to auth functions
2. Use the ProtectedRoute component for securing routes
3. Handle auth errors gracefully with user-friendly messages
4. Use the provided utility functions instead of direct checks
5. Monitor auth logs for suspicious activity
