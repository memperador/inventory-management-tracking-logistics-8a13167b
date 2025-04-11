
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useTenant } from '@/hooks/useTenantContext';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

const CustomerOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { currentTenant, setCurrentTenant } = useTenant();
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  useEffect(() => {
    // Log when component mounts to verify redirection works
    logAuth('ONBOARDING', 'CustomerOnboarding page mounted', {
      level: AUTH_LOG_LEVELS.INFO,
      force: true,
      data: {
        timestamp: new Date().toISOString(),
        currentPath: window.location.pathname,
        currentUrl: window.location.href,
        referrer: document.referrer,
        hasTenant: !!currentTenant?.id,
        tenantId: currentTenant?.id || 'none',
        tenantSubscriptionStatus: currentTenant?.subscription_status || 'none'
      }
    });
    
    // Check if we need to show a notification for successful trial start
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('trial') === 'started') {
      toast({
        title: "Free Trial Started",
        description: "Your 7-day Premium tier trial has begun. Enjoy all Premium features!",
      });
    }
  }, [currentTenant?.id, currentTenant?.subscription_status]);
  
  const completionSteps = [
    { id: 'account', label: 'Account created', completed: true },
    { id: 'subscription', label: 'Subscription activated', completed: true },
    { id: 'tenant', label: 'Organization setup', completed: !!currentTenant?.id }
  ];
  
  const handleComplete = async () => {
    if (!acceptTerms) {
      toast({
        title: "Please accept the terms",
        description: "You must accept the terms and conditions to continue.",
        variant: "destructive"
      });
      return;
    }
    
    if (!currentTenant?.id) {
      toast({
        title: "Setup error",
        description: "There was an error with your account setup. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      logAuth('ONBOARDING', 'Completing customer onboarding', {
        level: AUTH_LOG_LEVELS.INFO,
        force: true,
        data: {
          tenantId: currentTenant.id,
          timestamp: new Date().toISOString()
        }
      });
      
      // Update tenant with onboarding completed
      const { error } = await supabase
        .from('tenants')
        .update({ onboarding_completed: true })
        .eq('id', currentTenant.id);
      
      if (error) {
        logAuth('ONBOARDING', `Error updating tenant onboarding status: ${error.message}`, {
          level: AUTH_LOG_LEVELS.ERROR,
          force: true,
          data: { error }
        });
        throw error;
      }
      
      // Update user metadata
      const { error: userError } = await supabase.auth.updateUser({
        data: { 
          onboarding_completed: true,
          needs_subscription: false
        }
      });
      
      if (userError) {
        logAuth('ONBOARDING', `Error updating user metadata: ${userError.message}`, {
          level: AUTH_LOG_LEVELS.ERROR,
          force: true,
          data: { userError }
        });
      }
      
      // Update tenant state
      if (currentTenant) {
        setCurrentTenant({
          ...currentTenant,
          onboarding_completed: true
        });
      }
      
      logAuth('ONBOARDING', 'Onboarding completed successfully, redirecting to dashboard', {
        level: AUTH_LOG_LEVELS.INFO,
        force: true
      });
      
      toast({
        title: "Setup Complete",
        description: "Your account has been fully configured, welcome!",
      });
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error("Error completing onboarding:", error);
      
      logAuth('ONBOARDING', 'Error completing onboarding', {
        level: AUTH_LOG_LEVELS.ERROR,
        force: true,
        data: error instanceof Error ? 
          { message: error.message, stack: error.stack } : 
          { error: String(error) }
      });
      
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-600" />
            Setup Complete
          </CardTitle>
          <CardDescription>
            Your account is ready to go!
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-4">
              {completionSteps.map((step) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    step.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <span className="ml-3 text-sm font-medium">{step.label}</span>
                </div>
              ))}
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">What's Next?</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Add your organization details</li>
                <li>Invite team members</li>
                <li>Start managing your inventory items</li>
                <li>Create your first project</li>
              </ul>
            </div>
            
            <div className="flex items-top space-x-2 pt-4">
              <Checkbox 
                id="accept-terms" 
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked === true)}
              />
              <Label htmlFor="accept-terms" className="text-sm text-muted-foreground">
                I accept the terms of service and have read the privacy policy.
              </Label>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={handleComplete}
            disabled={isLoading || !acceptTerms}
            className="space-x-2"
          >
            <span>Continue to Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CustomerOnboarding;
