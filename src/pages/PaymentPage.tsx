
import React, { useState } from 'react';
import { StripeProvider } from '@/components/payment/StripeProvider';
import PaymentForm from '@/components/payment/PaymentForm';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { CheckCircle, Zap, ShieldCheck, Building, UserPlus, HelpCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useTenant } from '@/hooks/useTenantContext';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import AddOnServices from '@/components/payment/AddOnServices';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const serviceTiers = [
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

const PaymentPage = () => {
  const [selectedTier, setSelectedTier] = useState('standard');
  const [paymentAmount, setPaymentAmount] = useState(9900); // Default to Standard tier
  const [paymentType, setPaymentType] = useState('subscription');
  const [agreeToFees, setAgreeToFees] = useState(false);
  const [activeTab, setActiveTab] = useState('plans');
  const { currentTenant, updateCompanyType } = useTenant();
  const { toast } = useToast();
  
  // Calculate selected tier price
  const selectedTierData = serviceTiers.find(tier => tier.id === selectedTier) || serviceTiers[1];

  const handleTierChange = (tierId: string) => {
    setSelectedTier(tierId);
    const tier = serviceTiers.find(t => t.id === tierId);
    if (tier) {
      setPaymentAmount(tier.price);
    }
  };

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

  // Determine if this is an upgrade from existing subscription
  const isUpgrade = !!currentTenant?.subscription_tier;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">
        {isUpgrade ? 'Upgrade Subscription' : 'Choose Your Service Plan'}
      </h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-2 w-[400px] mb-4">
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="addons">Add-On Services</TabsTrigger>
        </TabsList>
        
        <TabsContent value="plans">
          <div className="grid gap-6 lg:grid-cols-4 mb-12">
            {serviceTiers.map((tier) => (
              <Card 
                key={tier.id} 
                className={`relative overflow-hidden ${
                  selectedTier === tier.id ? 'border-primary ring-2 ring-primary ring-opacity-50' : ''
                }`}
              >
                {tier.id === 'premium' && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-white px-3 py-1 text-xs font-medium">
                    MOST POPULAR
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="mt-2">
                    {tier.id === 'enterprise' ? (
                      <span className="text-lg font-medium">Custom Pricing</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold">${(tier.price / 100).toFixed(2)}</span>
                        <span className="text-muted-foreground">/month</span>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tier.id !== 'enterprise' && (
                    <RadioGroup value={selectedTier} onValueChange={handleTierChange}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={tier.id} id={`radio-${tier.id}`} />
                        <Label htmlFor={`radio-${tier.id}`}>Select Plan</Label>
                      </div>
                    </RadioGroup>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Features</h4>
                      {typeof tier.limits.assets !== 'string' && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 rounded-full p-0">
                              <HelpCircle className="h-4 w-4" />
                              <span className="sr-only">Asset and user limits info</span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="font-medium">Plan Limits</h4>
                              <p className="text-sm">
                                <strong>Assets:</strong> Up to {tier.limits.assets} tracked items
                              </p>
                              <p className="text-sm">
                                <strong>Users:</strong> Up to {tier.limits.users} user accounts
                              </p>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                    <ul className="space-y-2">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <h4 className="font-medium mb-2">AI Assistant</h4>
                    <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded">
                      <Zap className="h-5 w-5 text-primary" />
                      <span className="text-sm">{tier.ai}</span>
                    </div>
                  </div>
                  
                  {tier.id === 'enterprise' && (
                    <Button 
                      className="w-full mt-4 bg-slate-800 hover:bg-slate-900"
                      onClick={handleEnterpriseInquiry}
                    >
                      <Building className="mr-2 h-4 w-4" />
                      Contact Sales
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {selectedTier !== 'enterprise' && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Options</CardTitle>
                  <CardDescription>Configure your payment details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment-type">Payment Period</Label>
                    <Select
                      value={paymentType}
                      onValueChange={setPaymentType}
                    >
                      <SelectTrigger id="payment-type">
                        <SelectValue placeholder="Select payment period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="subscription">Monthly Subscription</SelectItem>
                        <SelectItem value="annual">Annual (Save 10%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-top space-x-2 pt-4">
                    <Checkbox 
                      id="agree-fees" 
                      checked={agreeToFees}
                      onCheckedChange={(checked) => setAgreeToFees(checked === true)}
                    />
                    <Label htmlFor="agree-fees" className="text-sm text-muted-foreground">
                      I understand that payment processing fees for credit cards (Visa, Mastercard, Discover, American Express) 
                      will be added to my bill. These fees are typically 2.9% + $0.30 per transaction.
                    </Label>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isUpgrade ? 'Upgrade to ' + selectedTierData.name : 'Subscribe to ' + selectedTierData.name}
                  </CardTitle>
                  <CardDescription>
                    {paymentType === 'subscription' 
                      ? 'You will be charged this amount monthly'
                      : 'You will be charged annually (10% discount applied)'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isUpgrade && (
                    <div className="mb-4 p-3 bg-amber-50 text-amber-800 rounded border border-amber-200">
                      <p className="text-sm">
                        <strong>Upgrading from {currentTenant?.subscription_tier}:</strong> You'll be charged a prorated 
                        amount for the remainder of the current billing cycle.
                      </p>
                    </div>
                  )}
                  
                  <ErrorBoundary>
                    <StripeProvider>
                      <PaymentForm 
                        amount={paymentType === 'annual' ? Math.round(selectedTierData.price * 12 * 0.9) : selectedTierData.price}
                        disabled={!agreeToFees}
                        onSuccess={handleSuccess}
                        onError={handleError}
                        selectedTier={selectedTier}
                      />
                    </StripeProvider>
                  </ErrorBoundary>
                </CardContent>
                <CardFooter className="flex flex-col items-start text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Your payment information is securely processed by Stripe.</span>
                  </div>
                  <p>You can upgrade or downgrade your plan at any time.</p>
                </CardFooter>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="addons">
          <AddOnServices currentTier={selectedTier} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentPage;
