
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { ProcessingState } from '../types';

// Rate limiting implementation
const rateLimitRegistry = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT = 5; // Max attempts
const RATE_WINDOW = 60 * 1000; // 1 minute window

const checkRateLimit = (operation: string, identifier: string): boolean => {
  const key = `${operation}:${identifier}`;
  const now = Date.now();
  const record = rateLimitRegistry.get(key);
  
  // Clear old records every 5 minutes
  if (now % (5 * 60 * 1000) < 1000) {
    for (const [key, value] of rateLimitRegistry.entries()) {
      if (now - value.timestamp > RATE_WINDOW) {
        rateLimitRegistry.delete(key);
      }
    }
  }
  
  if (!record) {
    rateLimitRegistry.set(key, { count: 1, timestamp: now });
    return true;
  }
  
  if (now - record.timestamp > RATE_WINDOW) {
    rateLimitRegistry.set(key, { count: 1, timestamp: now });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count += 1;
  return true;
}

export const useAuthOperations = () => {
  const [isProcessing, setIsProcessing] = useState<ProcessingState>({
    signIn: false,
    signUp: false,
    signOut: false,
    resetPassword: false,
    refreshSession: false
  });

  const signIn = useCallback(async (email: string, password: string) => {
    if (isProcessing.signIn) {
      return Promise.reject(new Error('Sign in already in progress'));
    }
    
    // Input validation
    if (!email || !password) {
      toast({
        title: 'Missing credentials',
        description: 'Please provide both email and password',
        variant: 'destructive'
      });
      return Promise.reject(new Error('Missing credentials'));
    }
    
    // Check rate limiting
    if (!checkRateLimit('signIn', email)) {
      logAuth('AUTH-LIMIT', 'Rate limit exceeded for sign in', {
        level: AUTH_LOG_LEVELS.WARN,
        data: { email }
      });
      
      toast({
        title: 'Too many attempts',
        description: 'Please try again later',
        variant: 'destructive'
      });
      
      return Promise.reject(new Error('Rate limit exceeded'));
    }
    
    try {
      setIsProcessing(prev => ({ ...prev, signIn: true }));
      
      logAuth('AUTH-SIGNIN', `Signing in user: ${email}`, {
        level: AUTH_LOG_LEVELS.INFO
      });
      
      await supabase.auth.signOut();
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;
      
      toast({
        title: 'Welcome back!',
        description: 'You have been signed in successfully',
      });
      
      return data;
    } catch (error: any) {
      logAuth('AUTH-SIGNIN', 'Sign in error:', {
        level: AUTH_LOG_LEVELS.ERROR,
        data: error
      });
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sign in',
        variant: 'destructive',
      });
      
      throw error;
    } finally {
      setIsProcessing(prev => ({ ...prev, signIn: false }));
    }
  }, [isProcessing]);

  const signUp = useCallback(async (email: string, password: string, firstName: string, lastName: string, companyName: string) => {
    if (isProcessing.signUp) {
      return Promise.reject(new Error('Sign up already in progress'));
    }
    
    // Input validation
    if (!email || !password || !firstName || !lastName) {
      toast({
        title: 'Missing information',
        description: 'Please fill all required fields',
        variant: 'destructive'
      });
      return Promise.reject(new Error('Missing required fields'));
    }
    
    // Check rate limiting
    if (!checkRateLimit('signUp', email)) {
      logAuth('AUTH-LIMIT', 'Rate limit exceeded for sign up', {
        level: AUTH_LOG_LEVELS.WARN,
        data: { email }
      });
      
      toast({
        title: 'Too many attempts',
        description: 'Please try again later',
        variant: 'destructive'
      });
      
      return Promise.reject(new Error('Rate limit exceeded'));
    }
    
    try {
      setIsProcessing(prev => ({ ...prev, signUp: true }));
      
      logAuth('AUTH-SIGNUP', `Signing up user: ${email}`, {
        level: AUTH_LOG_LEVELS.INFO
      });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            company_name: companyName || `${firstName}'s Company`,
            role: 'admin'
          },
          emailRedirectTo: `${window.location.origin}/auth?email_confirmed=true`,
        },
      });

      if (error) throw error;
      
      toast({
        title: 'Account created',
        description: 'Please check your email for verification link',
      });
      
      return { email, data };
    } catch (error: any) {
      logAuth('AUTH-SIGNUP', 'Sign up error:', {
        level: AUTH_LOG_LEVELS.ERROR,
        data: error
      });
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sign up',
        variant: 'destructive',
      });
      
      throw error;
    } finally {
      setIsProcessing(prev => ({ ...prev, signUp: false }));
    }
  }, [isProcessing]);

  const signOut = useCallback(async () => {
    if (isProcessing.signOut) {
      return Promise.reject(new Error('Sign out already in progress'));
    }
    
    try {
      setIsProcessing(prev => ({ ...prev, signOut: true }));
      
      // Get current user before signing out
      const { data: userData } = await supabase.auth.getUser();
      
      await supabase.auth.signOut();
      
      // Only show toast if we had a user
      if (userData?.user) {
        toast({
          title: 'Signed out',
          description: 'You have been signed out successfully',
        });
      }
    } catch (error: any) {
      logAuth('AUTH-SIGNOUT', 'Sign out error:', {
        level: AUTH_LOG_LEVELS.ERROR,
        data: error
      });
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sign out',
        variant: 'destructive',
      });
      
      throw error;
    } finally {
      setIsProcessing(prev => ({ ...prev, signOut: false }));
    }
  }, [isProcessing]);

  const resetPassword = useCallback(async (email: string) => {
    if (isProcessing.resetPassword) {
      return Promise.reject(new Error('Password reset already in progress'));
    }
    
    // Input validation
    if (!email) {
      toast({
        title: 'Missing email',
        description: 'Please provide your email address',
        variant: 'destructive'
      });
      return Promise.reject(new Error('Missing email'));
    }
    
    // Check rate limiting
    if (!checkRateLimit('resetPassword', email)) {
      logAuth('AUTH-LIMIT', 'Rate limit exceeded for password reset', {
        level: AUTH_LOG_LEVELS.WARN,
        data: { email }
      });
      
      toast({
        title: 'Too many attempts',
        description: 'Please try again later',
        variant: 'destructive'
      });
      
      return Promise.reject(new Error('Rate limit exceeded'));
    }
    
    try {
      setIsProcessing(prev => ({ ...prev, resetPassword: true }));
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: 'Password reset email sent',
        description: 'Check your email for the password reset link',
      });
    } catch (error: any) {
      logAuth('AUTH-RESET', 'Password reset error:', {
        level: AUTH_LOG_LEVELS.ERROR,
        data: error
      });
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send password reset email',
        variant: 'destructive',
      });
      
      throw error;
    } finally {
      setIsProcessing(prev => ({ ...prev, resetPassword: false }));
    }
  }, [isProcessing]);

  const refreshSession = useCallback(async () => {
    if (isProcessing.refreshSession) {
      return Promise.reject(new Error('Session refresh already in progress'));
    }
    
    try {
      setIsProcessing(prev => ({ ...prev, refreshSession: true }));
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        logAuth('AUTH-REFRESH', 'Error refreshing session:', {
          level: AUTH_LOG_LEVELS.ERROR,
          data: error
        });
        throw error;
      }
      
      return data;
    } catch (error) {
      logAuth('AUTH-REFRESH', 'Failed to refresh session:', {
        level: AUTH_LOG_LEVELS.ERROR,
        data: error
      });
      throw error;
    } finally {
      setIsProcessing(prev => ({ ...prev, refreshSession: false }));
    }
  }, [isProcessing]);

  return {
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshSession,
    isProcessing
  };
};
