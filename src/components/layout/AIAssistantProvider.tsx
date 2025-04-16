
import React, { useEffect, useState } from 'react';
import FloatingAIAssistant from '@/components/ai/FloatingAIAssistant';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { useLocation } from 'react-router-dom';
import { AI_ASSISTANT_FEATURES } from '@/utils/subscription/aiFeatures';
import { FeatureAccessLevel } from '@/utils/subscriptionUtils';

interface AIAssistantProviderProps {
  children: React.ReactNode;
}

export const AIAssistantProvider: React.FC<AIAssistantProviderProps> = ({ children }) => {
  const { canAccessFeature, hasSubscriptionTier, currentTier } = useFeatureAccess();
  const location = useLocation();
  const [errors, setErrors] = useState<string[]>([]);
  
  // Don't show on login/auth pages
  const isAuthPage = location.pathname.includes('/auth') || 
                    location.pathname.includes('/login') || 
                    location.pathname === '/unauthorized';
  
  // Check if user has access to AI features
  const hasAIAccess = canAccessFeature('basic_ai_assistant');
  
  // Only show the assistant if user has access and we're not on an auth page
  const showAssistant = hasAIAccess && !isAuthPage;
  
  // Error tracking
  useEffect(() => {
    const originalConsoleError = console.error;
    const errorHandler = (...args: any[]) => {
      // Call the original console.error
      originalConsoleError.apply(console, args);
      
      // Add to our error tracking
      const error = args[0];
      if (typeof error === 'string') {
        setErrors(prev => [...prev.slice(-9), error]);
      } else if (error instanceof Error) {
        setErrors(prev => [...prev.slice(-9), error.message]);
      }
    };
    
    // Override console.error
    console.error = errorHandler as typeof console.error;
    
    // Restore on cleanup
    return () => {
      console.error = originalConsoleError;
    };
  }, []);
  
  // Get AI features based on subscription tier
  const getAIFeatures = () => {
    if (!currentTier) return [];
    // Ensure currentTier is one of the allowed values
    const validTier = (currentTier as string) === 'premium' || 
                       (currentTier as string) === 'standard' || 
                       (currentTier as string) === 'enterprise' || 
                       (currentTier as string) === 'basic' 
                       ? currentTier as FeatureAccessLevel 
                       : 'basic';
    return AI_ASSISTANT_FEATURES[validTier] || [];
  };
  
  return (
    <>
      {children}
      {showAssistant && (
        <FloatingAIAssistant 
          recentErrors={errors} 
          availableFeatures={getAIFeatures()}
          tier={(currentTier as string) === 'premium' || 
                (currentTier as string) === 'standard' || 
                (currentTier as string) === 'enterprise' || 
                (currentTier as string) === 'basic' 
                ? (currentTier as 'premium' | 'standard' | 'enterprise' | 'basic') 
                : 'basic'}
        />
      )}
    </>
  );
};
