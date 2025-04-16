
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import PlansTab from '@/components/payment/plans/PlansTab';
import BillingTab from '@/components/payment/billing/BillingTab';
import AccountTab from '@/components/payment/account/AccountTab';
import PageTitle from '@/components/layout/PageTitle';
import TrialInfoCard from '@/components/payment/trial/TrialInfoCard';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

export const Payment = () => {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const navigate = useNavigate();
  
  // Check if user needs to complete onboarding first
  useEffect(() => {
    if (currentTenant && currentTenant.onboarding_completed === false) {
      logAuth('PAYMENT', 'Redirecting to onboarding because it is not completed', {
        level: AUTH_LOG_LEVELS.INFO
      });
      navigate('/customer-onboarding');
    }
  }, [currentTenant, navigate]);

  useEffect(() => {
    logAuth('PAYMENT', `Payment page accessed by user ${user?.id || 'unknown'}`, {
      level: AUTH_LOG_LEVELS.INFO,
      data: {
        tenant: currentTenant?.id,
        subscription_tier: currentTenant?.subscription_tier,
        subscription_status: currentTenant?.subscription_status,
        onboarding_completed: currentTenant?.onboarding_completed
      }
    });
  }, [user, currentTenant]);

  // Handle trial start and redirect to dashboard
  const handleTrialStarted = () => {
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };
  
  return (
    <div className="container mx-auto py-8">
      <PageTitle title="Subscription Management" />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        <div className="lg:col-span-8">
          <Tabs defaultValue="plans" className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>
            
            <TabsContent value="plans" className="space-y-8">
              {/* Featured Trial Card */}
              <div className="mb-8">
                <TrialInfoCard onStartTrial={handleTrialStarted} />
              </div>
              
              <div className="opacity-50 pointer-events-none">
                <PlansTab />
              </div>
            </TabsContent>
            
            <TabsContent value="billing">
              <Card className="p-6">
                <BillingTab />
              </Card>
            </TabsContent>
            
            <TabsContent value="account">
              <Card className="p-6">
                <AccountTab />
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="lg:col-span-4">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-3">Subscription Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Plan:</p>
                <p className="font-medium">{currentTenant?.subscription_tier?.charAt(0).toUpperCase() + (currentTenant?.subscription_tier?.slice(1) || 'Basic')}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Status:</p>
                <p className="font-medium capitalize">{currentTenant?.subscription_status || 'Inactive'}</p>
              </div>
              
              {currentTenant?.trial_ends_at && (
                <div>
                  <p className="text-sm text-muted-foreground">Trial Ends At:</p>
                  <p className="font-medium">
                    {new Date(currentTenant.trial_ends_at).toLocaleDateString()}
                  </p>
                </div>
              )}
              
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Need assistance?</p>
                <p className="text-sm">
                  Contact our support team for any billing or subscription inquiries.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Payment;
