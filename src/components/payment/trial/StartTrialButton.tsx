
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from '@/hooks/use-toast';
import { startUserTrial } from '@/contexts/auth/handlers/tenantSubscription';
import { useTenant } from '@/contexts/TenantContext';
import { useNavigate } from 'react-router-dom';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

interface StartTrialButtonProps {
  className?: string;
  onSuccess?: () => void;
}

const StartTrialButton: React.FC<StartTrialButtonProps> = ({ 
  className,
  onSuccess 
}) => {
  const { tenantId, currentTenant, setCurrentTenant } = useTenant();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleStartTrial = async () => {
    if (!tenantId) {
      toast({
        title: "Error",
        description: "No tenant selected. Please reload the page and try again.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    logAuth('TRIAL', `Attempting to start trial for tenant: ${tenantId}`, {
      level: AUTH_LOG_LEVELS.INFO
    });

    try {
      const success = await startUserTrial(tenantId);
      
      if (success) {
        // Update the local tenant data to reflect the change
        if (currentTenant) {
          const trialEndsAt = new Date();
          trialEndsAt.setDate(trialEndsAt.getDate() + 7);
          
          setCurrentTenant({
            ...currentTenant,
            subscription_tier: 'premium',
            subscription_status: 'trialing',
            trial_ends_at: trialEndsAt.toISOString()
          });
        }
        
        logAuth('TRIAL', `Trial started successfully for tenant: ${tenantId}`, {
          level: AUTH_LOG_LEVELS.INFO
        });
        
        toast({
          title: "Trial Started",
          description: "Your 7-day premium trial has been activated. Enjoy all premium features!",
        });
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        logAuth('TRIAL', `Failed to start trial for tenant: ${tenantId}`, {
          level: AUTH_LOG_LEVELS.ERROR
        });
        
        toast({
          title: "Error",
          description: "Failed to start your trial. Please try again later.",
          variant: "destructive"
        });
      }
    } catch (error) {
      logAuth('TRIAL', `Error starting trial:`, {
        level: AUTH_LOG_LEVELS.ERROR,
        data: error
      });
      
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleStartTrial} 
      disabled={isLoading}
      className={className || "w-full"}
      size="lg"
      variant="default"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Starting your trial...
        </>
      ) : (
        "Start Free 7-Day Premium Trial"
      )}
    </Button>
  );
};

export default StartTrialButton;
