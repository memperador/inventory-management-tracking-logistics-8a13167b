
import React from 'react';
import { useTenant } from '@/hooks/useTenantContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuthContext';
import PricingTiers, { ServiceTier } from './PricingTiers';
import PaymentOptions from './PaymentOptions';
import SubscriptionSummary from './SubscriptionSummary';
import { Button } from '@/components/ui/button';
import { Building, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { addDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';

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
  const { currentTenant, setCurrentTenant } = useTenant();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleTierChange = (tierId: string) => {
    setSelectedTier(tierId);
    const tier = serviceTiers.find(t => t.id === tierId);
    if (tier) {
      setPaymentAmount(tier.price);
    }
  };

  const selectedTierData = serviceTiers.find(tier => tier.id === selectedTier) || serviceTiers[1]; // Default to Standard

  const handleSuccess = async (paymentIntent: any) => {
    console.log('Payment succeeded:', paymentIntent);
    
    toast({
      title: `Subscribed to ${selectedTierData.name} Plan`,
      description: `You now have access to ${selectedTierData.description} features.`,
    });
    
    // Redirect to dashboard after 2 seconds
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
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
    
    // For testing purposes, also set the subscription to enterprise
    if (currentTenant?.id) {
      updateSubscription('enterprise');
    }
  };

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
  
  const updateSubscription = async (tier: string) => {
    if (!currentTenant?.id) return;
    
    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          subscription_tier: tier,
          subscription_status: 'active',
          // Clear trial end date if it was on a trial
          trial_ends_at: null
        })
        .eq('id', currentTenant.id);
        
      if (error) throw error;
      
      // Update the local tenant state
      setCurrentTenant({
        ...currentTenant,
        subscription_tier: tier as any,
        subscription_status: 'active',
        trial_ends_at: null
      });
      
      toast({
        title: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan Activated`,
        description: tier === 'enterprise' 
          ? "Enterprise plan has been activated. Our team will contact you shortly."
          : `Your ${tier} plan has been activated.`
      });
      
      // Navigate to dashboard if not enterprise
      if (tier !== 'enterprise') {
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update subscription: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
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
          <p>Please select a subscription plan to continue, or start with our free trial.</p>
        </div>
      )}

      {/* Free Trial Banner */}
      <div className="mb-8 bg-gradient-to-r from-purple-100 to-cyan-100 border border-purple-200 rounded-lg p-6 relative overflow-hidden">
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
      </div>

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
