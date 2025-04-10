
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlansTab from '@/components/payment/plans/PlansTab';
import AddOnServices from '@/components/payment/AddOnServices';
import { Zap, Sparkles } from 'lucide-react';
import BetaBanner from '@/components/common/BetaBanner';
import { TrialBanner } from '@/components/subscription/TrialBanner'; 
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTenant } from '@/hooks/useTenantContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { addDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

const PaymentPage = () => {
  const [activeTab, setActiveTab] = useState('plans');
  const { currentTenant, setCurrentTenant } = useTenant();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleStartTrial = async () => {
    if (!currentTenant?.id) {
      toast({
        title: "Error",
        description: "Unable to start trial - no tenant information found",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Calculate trial end date - 7 days from now
      const trialEndsAt = addDays(new Date(), 7).toISOString();
      
      const { error } = await supabase
        .from('tenants')
        .update({
          subscription_tier: 'premium',
          subscription_status: 'trialing',
          trial_ends_at: trialEndsAt
        })
        .eq('id', currentTenant.id);
        
      if (error) throw error;
      
      // Update the local tenant state
      setCurrentTenant({
        ...currentTenant,
        subscription_tier: 'premium',
        subscription_status: 'trialing',
        trial_ends_at: trialEndsAt
      });
      
      toast({
        title: "Free Trial Started",
        description: "Your 7-day Premium tier trial has begun. Enjoy all Premium features!",
      });
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to start trial: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <BetaBanner />
      <TrialBanner className="mb-6" showTierSwitcher={true} />
      
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <Zap className="mr-2 h-6 w-6 text-primary" />
        Choose Your Service Plan
      </h1>
      
      {/* Free Trial Banner */}
      <Card className="mb-8 bg-gradient-to-r from-purple-100 to-cyan-100 border-purple-200">
        <CardContent className="p-6 relative">
          <div className="absolute top-0 right-0 h-40 w-40 opacity-10 -mt-12 -mr-12">
            <Sparkles className="h-full w-full text-purple-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-purple-800">Try Premium Free for 7 Days</h2>
          <p className="mb-4 text-purple-700">
            Experience all Premium tier features without commitment. During your trial, each feature will be labeled with its corresponding tier, so you'll know exactly what's included in each plan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <Button 
              onClick={handleStartTrial}
              size="lg" 
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Start 7-Day Free Trial
            </Button>
            <span className="text-purple-700 text-sm">No credit card required</span>
          </div>
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-2 w-[400px] mb-4">
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="addons">Add-On Services</TabsTrigger>
        </TabsList>
        
        <TabsContent value="plans">
          <PlansTab />
        </TabsContent>
        
        <TabsContent value="addons">
          <AddOnServices currentTier="standard" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentPage;
