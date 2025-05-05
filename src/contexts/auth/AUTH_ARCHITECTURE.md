
# Authentication Architecture Documentation

## Overview

This document outlines the authentication system architecture for the application. The authentication system is built on top of Supabase Auth, with additional security and performance enhancements.

## Components

### Core Structure

```
src/contexts/auth/
├── AuthContext.tsx          # Main context provider
├── hooks/
│   ├── useAuthSession.ts    # Session management hook
│   ├── useAuthOperations.ts # Auth operations (sign in, sign up, etc.)
│   └── useMemoizedAuthSession.ts # Performance-optimized session hook
├── utils/
│   ├── authorizationUtils.ts # Role-based access control
│   ├── sessionUtils.ts       # Session validation utilities
│   └── secureCache.ts        # Secure in-memory caching
└── handlers/
    ├── sessionUtils.ts       # Session storage management
    └── redirectHandler.ts    # Authentication redirects
```

### Key Components

1. **AuthContext**: Central provider for authentication state and operations.
2. **useAuthSession**: Hook for accessing the current authentication session.
3. **useAuthOperations**: Hook for authentication operations (sign in, sign up, sign out).
4. **authorizationUtils**: Utilities for role-based access control.

## Authentication Flow

### Sign In

1. User submits credentials via `signIn` function from `useAuthOperations`
2. Credentials are validated against Supabase Auth
3. On successful authentication:
   - User session is stored and validated
   - Token refresh is scheduled if needed
   - User is redirected based on their role and subscription status

### Session Management

Sessions are managed through a combination of:

- Supabase's built-in session management
- Custom validation using `sessionUtils.ts`
- Automatic token refresh before expiration
- Secure caching for performance optimization

### Role-Based Access Control

Access control is implemented through:

- Role hierarchy defined in `authorizationUtils.ts`
- Permission checks via `hasRole`, `hasAnyRole`, and `hasRoleLevel` functions
- Protected routes using the `ProtectedRoute` component

## Security Features

### Token Validation

All tokens are validated for:
- Expiration
- Proper format
- Integrity

### Rate Limiting

Authentication operations are rate-limited to prevent brute force attacks:
- Maximum 5 attempts per minute for sign in operations
- Automatic blocking of excessive attempts

### Secure Storage

- Sensitive data is only stored in memory using `SecureCache`
- Auto-expiration of cached credentials
- No sensitive information in localStorage or sessionStorage

## Performance Optimizations

### Memoization

- Session validation results are memoized to prevent redundant checks
- User metadata is memoized to optimize derived state calculations

### Caching Strategy

- Short TTL cache for frequently accessed session data
- Automatic cleanup of expired cache entries
- Optimized token refresh to minimize API calls

## Error Handling

Errors are handled through:
- Dedicated error boundary components for auth components
- Centralized error logging
- User-friendly error messages via toast notifications

## Usage Guidelines

### Protected Routes

```tsx
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requiredRoles={['admin']}>
      <AdminPage />
    </ProtectedRoute>
  } 
/>
```

### Permission Checks

```tsx
import { hasRole } from '@/contexts/auth/utils/authorizationUtils';

function AdminAction({ user }) {
  if (!hasRole(user, 'admin')) {
    return <p>Unauthorized</p>;
  }
  
  return <AdminPanel />;
}
```

### Authentication Operations

```tsx
import { useAuth } from '@/contexts/auth/AuthContext';

function LoginForm() {
  const { signIn } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await signIn(email, password);
  };
  
  // ...
}
```
