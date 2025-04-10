
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CheckCircle, HelpCircle, Building, Zap } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Toggle } from '@/components/ui/toggle';

interface TierLimit {
  assets: number | string;
  users: number | string;
}

interface PricingTierProps {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  ai: string;
  limits: TierLimit;
  isSelected: boolean;
  isPopular?: boolean;
  onSelect: (tierId: string) => void;
  paymentType: string;
  onPaymentTypeChange: (value: string) => void;
}

export const PricingTier: React.FC<PricingTierProps> = ({
  id,
  name,
  description,
  price,
  features,
  ai,
  limits,
  isSelected,
  isPopular = false,
  onSelect,
  paymentType,
  onPaymentTypeChange,
}) => {
  const navigate = useNavigate();
  
  const handleEnterpriseInquiry = () => {
    navigate('/payment');
  };

  // Calculate annual price with 10% discount
  const annualPrice = Math.round(price * 12 * 0.9);
  const displayPrice = paymentType === 'annual' ? annualPrice / 12 : price;

  return (
    <Card 
      className={`relative overflow-hidden ${
        isSelected ? 'border-primary ring-2 ring-primary ring-opacity-50' : ''
      }`}
    >
      {isPopular && (
        <div className="absolute top-0 right-0 bg-amber-500 text-white px-3 py-1 text-xs font-medium">
          MOST POPULAR
        </div>
      )}
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center mb-4">
          <div className="bg-slate-100 rounded-lg p-1 flex text-sm">
            <button 
              onClick={() => onPaymentTypeChange('subscription')}
              className={`px-4 py-1.5 font-medium rounded-md transition-colors ${
                paymentType === 'subscription' ? 'bg-white shadow-sm' : 'text-slate-600'
              }`}
            >
              Monthly
            </button>
            <button 
              onClick={() => onPaymentTypeChange('annual')}
              className={`px-4 py-1.5 font-medium rounded-md transition-colors ${
                paymentType === 'annual' ? 'bg-white shadow-sm' : 'text-slate-600'
              }`}
            >
              Annual <span className="text-emerald-600 text-xs ml-1">10% off</span>
            </button>
          </div>
        </div>
        
        <div className="mt-2 text-center">
          {id === 'enterprise' ? (
            <span className="text-lg font-medium">Custom Pricing</span>
          ) : (
            <>
              <span className="text-3xl font-bold">${(displayPrice / 100).toFixed(2)}</span>
              <span className="text-muted-foreground">/month</span>
              {paymentType === 'annual' && (
                <div className="text-xs text-emerald-600 mt-1">Billed annually (${(annualPrice / 100).toFixed(2)}/year)</div>
              )}
            </>
          )}
        </div>
        
        {id !== 'enterprise' && (
          <div className="pt-3">
            <Button 
              className="w-full"
              onClick={() => onSelect(id)}
              variant={isSelected ? "outline" : "default"}
            >
              {isSelected ? "Selected" : "Select Plan"}
            </Button>
          </div>
        )}
        
        <div className="space-y-2 pt-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Features</h4>
            {typeof limits.assets !== 'string' && (
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
                      <strong>Assets:</strong> Up to {limits.assets} tracked items
                    </p>
                    <p className="text-sm">
                      <strong>Users:</strong> Up to {limits.users} user accounts
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
          <ul className="space-y-2">
            {features.map((feature, i) => (
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
            <span className="text-sm">{ai}</span>
          </div>
        </div>
        
        {id === 'enterprise' && (
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
  );
};

export default PricingTier;
