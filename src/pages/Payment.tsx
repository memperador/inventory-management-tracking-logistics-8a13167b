
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TrialInfoCard from '@/components/payment/trial/TrialInfoCard';
import { checkTrialStatus } from '@/contexts/auth/handlers/tenantSubscription';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Payment = () => {
  const { user } = useAuth();
  const { tenantId, currentTenant } = useTenant();
  const navigate = useNavigate();
  const [trialActive, setTrialActive] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Check trial status on load
  useEffect(() => {
    const checkTrial = async () => {
      if (!tenantId) return;
      
      try {
        const status = await checkTrialStatus(tenantId);
        setTrialActive(status.isActive);
        setDaysRemaining(status.daysRemaining);
      } catch (error) {
        console.error("Error checking trial status:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkTrial();
  }, [tenantId]);
  
  const handleStartTrial = () => {
    // Refresh trial status
    if (tenantId) {
      checkTrialStatus(tenantId).then(status => {
        setTrialActive(status.isActive);
        setDaysRemaining(status.daysRemaining);
        
        if (status.isActive) {
          navigate('/dashboard');
        }
      });
    }
  };
  
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Please sign in to continue</h2>
          <p className="mt-2">You need to be logged in to access this page</p>
          <Button 
            className="mt-4" 
            onClick={() => navigate('/auth')}
          >
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Loading...</h2>
        </div>
      </div>
    );
  }
  
  if (trialActive) {
    return (
      <div className="container max-w-4xl py-12">
        <Alert className="mb-6 bg-green-50 border-green-200">
          <Info className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800">Active Trial</AlertTitle>
          <AlertDescription className="text-green-700">
            Your premium trial is active with {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining. 
            You currently have access to all premium features.
          </AlertDescription>
        </Alert>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Welcome to Your Premium Trial</h1>
          <p className="text-lg text-muted-foreground mb-6">
            You're all set! Explore the dashboard to start using all premium features.
          </p>
          <Button size="lg" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8 max-w-5xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Get Started with {currentTenant?.name || 'Your Account'}</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Start your free trial to access premium features
        </p>
      </div>
      
      <Tabs defaultValue="trial" className="w-full">
        <TabsList className="grid grid-cols-2 max-w-md mx-auto mb-8">
          <TabsTrigger value="trial">Free Trial</TabsTrigger>
          <TabsTrigger value="plans" disabled>Paid Plans</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trial" className="flex justify-center">
          <TrialInfoCard onStartTrial={handleStartTrial} />
        </TabsContent>
        
        <TabsContent value="plans" className="flex justify-center">
          <div className="text-center p-12">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="text-xl font-medium mt-4">Paid plans coming soon</h3>
            <p className="text-muted-foreground mt-2">
              We're still working on our paid subscription options. 
              For now, you can try all premium features with our free trial.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Payment;
