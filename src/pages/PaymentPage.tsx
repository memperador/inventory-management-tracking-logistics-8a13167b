
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlansTab from '@/components/payment/plans/PlansTab';
import AddOnServices from '@/components/payment/AddOnServices';
import { Zap } from 'lucide-react';
import BetaBanner from '@/components/common/BetaBanner';
import { TrialBanner } from '@/components/subscription/TrialBanner'; 
import { useSubscriptionPlans } from '@/hooks/subscription/useSubscriptionPlans';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import LabratAdminButton from '@/components/admin/LabratAdminButton';

const PaymentPage = () => {
  const [activeTab, setActiveTab] = useState('plans');
  const { handleStartTrial, paymentType, handlePaymentTypeChange } = useSubscriptionPlans();
  
  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <BetaBanner />
      <TrialBanner className="mb-6" showTierSwitcher={true} />
      
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <Zap className="mr-2 h-6 w-6 text-primary" />
        Choose Your Service Plan
      </h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-2 w-[400px] mb-4">
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="addons">Add-On Services</TabsTrigger>
        </TabsList>
        
        {activeTab === 'plans' && (
          <div className="w-full max-w-md mx-auto mb-8">
            <div className="space-y-2">
              <Label className="text-lg font-medium">Payment Period</Label>
              <div className="flex items-center justify-between p-4 bg-slate-100 rounded-lg">
                <span className={`text-sm font-medium ${paymentType === 'subscription' ? 'text-primary' : 'text-muted-foreground'}`}>
                  Monthly
                </span>
                
                <Switch 
                  checked={paymentType === 'annual'}
                  onCheckedChange={(checked) => handlePaymentTypeChange(checked ? 'annual' : 'subscription')}
                  className="mx-4"
                />
                
                <div className="flex items-center">
                  <span className={`text-sm font-medium ${paymentType === 'annual' ? 'text-primary' : 'text-muted-foreground'}`}>
                    Annual
                  </span>
                  <div className="flex items-center ml-2">
                    <span className="text-emerald-600 text-xs px-1.5 py-0.5 bg-emerald-50 rounded">10% off</span>
                  </div>
                </div>
              </div>
              {paymentType === 'annual' && (
                <p className="text-sm text-emerald-600 text-center mt-2">
                  Save 10% with annual billing
                </p>
              )}
            </div>
          </div>
        )}
        
        <TabsContent value="plans">
          <PlansTab />
        </TabsContent>
        
        <TabsContent value="addons">
          <AddOnServices currentTier="standard" />
        </TabsContent>
      </Tabs>
      
      {/* Emergency admin button */}
      <div className="mt-8 max-w-lg mx-auto text-center">
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-red-800 font-medium mb-2">Admin Access Required</h3>
          <p className="text-sm text-red-700 mb-3">
            If you're the labrat@iaware.com user and need admin access, click below:
          </p>
          <LabratAdminButton />
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
