import React from 'react';
import { useTenant } from '@/hooks/useTenantContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuthContext';
import PricingTiers, { ServiceTier } from './PricingTiers';
import PaymentOptions from './PaymentOptions';
import SubscriptionSummary from './SubscriptionSummary';
import { Button } from '@/components/ui/button';
import { Building } from 'lucide-react';

// Service tiers data
const serviceTiers: ServiceTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Inventory Management',
    price: 4900, // $49.00
    features: [
      'Core inventory features',
      'Basic analytics',
      'Simple alerts',
      'QR code generation',
      'Up to 25 assets',
      'Up to 3 users',
      'Inventory Management AI Assistant'
    ],
    ai: 'Inventory Expert Assistant',
    limits: {
      assets: 25,
      users: 3
    }
  },
  {
    id: 'standard',
    name: 'Standard',
    description: 'Inventory Management with Tracking',
    price: 9900, // $99.00
    features: [
      'Everything in Basic',
      'GPS Equipment Tracking',
      'Audit logs',
      'Advanced alerts',
      'Bulk QR generation',
      'Location history',
      'Up to 75 assets',
      'Up to 10 users',
      'Tracking-enhanced AI Assistant'
    ],
    ai: 'Inventory & Tracking Assistant',
    limits: {
      assets: 75,
      users: 10
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Full Asset Management Suite',
    price: 19900, // $199.00
    features: [
      'Everything in Standard',
      'Advanced GPS Integration',
      'Geofencing capabilities',
      'Route optimization',
      'Implementation support',
      'GPS intelligence features',
      'Up to 500 assets',
      'Up to 25 users',
      'Premium AI Asset Assistant'
    ],
    ai: 'Advanced Asset Management AI',
    limits: {
      assets: 500,
      users: 25
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Custom Solution for Large Organizations',
    price: 0, // Custom pricing
    features: [
      'Everything in Premium',
      'Unlimited assets and users',
      'Dedicated account manager',
      'Custom implementation',
      'API access',
      'White-labeling options',
      'SSO integration',
      'Custom reporting',
      'Service level agreement',
      'Premium support'
    ],
    ai: 'Enterprise-grade AI Solutions',
    limits: {
      assets: 'Unlimited',
      users: 'Unlimited'
    }
  }
];

export const PlansTab: React.FC = () => {
  const [selectedTier, setSelectedTier] = React.useState('standard');
  const [paymentAmount, setPaymentAmount] = React.useState(9900); // Default to Standard tier
  const [paymentType, setPaymentType] = React.useState('subscription');
  const [agreeToFees, setAgreeToFees] = React.useState(false);
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleTierChange = (tierId: string) => {
    setSelectedTier(tierId);
    const tier = serviceTiers.find(t => t.id === tierId);
    if (tier) {
      setPaymentAmount(tier.price);
    }
  };

  const selectedTierData = serviceTiers.find(tier => tier.id === selectedTier) || serviceTiers[1]; // Default to Standard

  const handleSuccess = (paymentIntent: any) => {
    console.log('Payment succeeded:', paymentIntent);
    
    // In a real app, you would update the subscription in the database
    toast({
      title: `Subscribed to ${selectedTierData.name} Plan`,
      description: `You now have access to ${selectedTierData.description} features.`,
    });
  };

  const handleError = (error: Error) => {
    console.error('Payment failed:', error);
    toast({
      title: "Payment Failed",
      description: error.message,
      variant: "destructive",
    });
  };

  const handleEnterpriseInquiry = () => {
    toast({
      title: "Enterprise Inquiry Sent",
      description: "Our team will contact you shortly to discuss your enterprise needs.",
    });
  };

  const isUpgrade = !!currentTenant?.subscription_tier;
  const isNewSignup = user?.user_metadata?.needs_subscription === true;
  
  // If enterprise tier is selected, show enterprise contact form
  if (selectedTier === 'enterprise') {
    return (
      <>
        <PricingTiers 
          tiers={serviceTiers} 
          selectedTier={selectedTier}
          onTierChange={handleTierChange}
        />
        <div className="text-center p-8 border rounded-lg bg-slate-50">
          <h3 className="text-xl font-semibold mb-4">Contact Our Enterprise Sales Team</h3>
          <p className="mb-4">Please reach out for custom pricing and implementation details for our Enterprise plan.</p>
          <Button onClick={handleEnterpriseInquiry} className="bg-slate-800 hover:bg-slate-900">
            <Building className="mr-2 h-4 w-4" />
            Contact Sales
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      {isNewSignup && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
          <h2 className="text-xl font-semibold mb-2">Welcome to Inventory Track Pro!</h2>
          <p>Please select a subscription plan to continue. All plans include a 14-day free trial period.</p>
        </div>
      )}

      <PricingTiers 
        tiers={serviceTiers} 
        selectedTier={selectedTier}
        onTierChange={handleTierChange}
      />
      
      <div className="grid gap-6 md:grid-cols-2">
        <PaymentOptions
          paymentType={paymentType}
          setPaymentType={setPaymentType}
          agreeToFees={agreeToFees}
          setAgreeToFees={setAgreeToFees}
        />
        
        <SubscriptionSummary
          selectedTierData={selectedTierData}
          paymentType={paymentType}
          agreeToFees={agreeToFees}
          isUpgrade={isUpgrade}
          currentTier={currentTenant?.subscription_tier}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </>
  );
};

export default PlansTab;
