
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlansTab from '@/components/payment/plans/PlansTab';
import AddOnServices from '@/components/payment/AddOnServices';
import { Zap } from 'lucide-react';
import BetaBanner from '@/components/common/BetaBanner';
import { TrialBanner } from '@/components/subscription/TrialBanner'; 

const PaymentPage = () => {
  const [activeTab, setActiveTab] = useState('plans');

  return (
    <div className="container mx-auto py-8">
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
