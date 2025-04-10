
import React from 'react';
import FloatingAIAssistant from '@/components/ai/FloatingAIAssistant';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { useLocation } from 'react-router-dom';

interface AIAssistantProviderProps {
  children: React.ReactNode;
}

export const AIAssistantProvider: React.FC<AIAssistantProviderProps> = ({ children }) => {
  const { canAccessFeature } = useFeatureAccess();
  const location = useLocation();
  
  // Don't show on login/auth pages
  const isAuthPage = location.pathname.includes('/auth') || 
                    location.pathname.includes('/login') || 
                    location.pathname === '/unauthorized';
  
  // Check if user has access to AI features
  const hasAIAccess = canAccessFeature('basic_ai_assistant');
  
  // Only show the assistant if user has access and we're not on an auth page
  const showAssistant = hasAIAccess && !isAuthPage;
  
  return (
    <>
      {children}
      {showAssistant && <FloatingAIAssistant />}
    </>
  );
};
