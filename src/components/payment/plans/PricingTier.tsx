
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, HelpCircle, Building, Zap, TrendingDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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
}) => {
  const navigate = useNavigate();
  
  const handleEnterpriseInquiry = () => {
    navigate('/payment');
  };

  // Calculate annual price with 10% discount
  const annualPrice = Math.round(price * 12 * 0.9);
  
  // Display monthly price (either regular monthly or annual divided by 12)
  const displayPrice = paymentType === 'annual' ? Math.round(annualPrice / 12) : price;
  
  // What to display under the price
  const pricePeriod = paymentType === 'annual' ? '/month (billed annually)' : '/month';
  
  // Calculate savings amount and percentage
  const monthlyCost = price * 12;
  const annualSavings = monthlyCost - annualPrice;
  const savingsPercentage = 10; // 10% discount

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
        <div className="mt-2 text-center">
          {id === 'enterprise' ? (
            <span className="text-lg font-medium">Custom Pricing</span>
          ) : (
            <>
              <span className="text-3xl font-bold">${(displayPrice / 100).toFixed(2)}</span>
              <span className="text-muted-foreground">{pricePeriod}</span>
              {paymentType === 'annual' && (
                <div className="text-xs text-emerald-600 mt-1">Billed annually (${(annualPrice / 100).toFixed(2)}/year)</div>
              )}
              
              {/* Annual Savings Indicator */}
              {paymentType === 'annual' && (
                <div className="flex items-center justify-center mt-2 text-emerald-600 bg-emerald-50 rounded-md p-2">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">
                    Save ${(annualSavings / 100).toFixed(2)} ({savingsPercentage}%)
                  </span>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="pt-3">
          {id !== 'enterprise' ? (
            <Button 
              className="w-full"
              onClick={() => onSelect(id)}
              variant={isSelected ? "outline" : "default"}
            >
              {isSelected ? "Selected" : "Select Plan"}
            </Button>
          ) : (
            <Button 
              className="w-full bg-slate-800 hover:bg-slate-900"
              onClick={handleEnterpriseInquiry}
            >
              <Building className="mr-2 h-4 w-4" />
              Contact Sales
            </Button>
          )}
        </div>
        
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
      </CardContent>
    </Card>
  );
};

export default PricingTier;
