
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CheckCircle, HelpCircle, Building, Zap } from 'lucide-react';
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
}) => {
  const navigate = useNavigate();
  
  const handleEnterpriseInquiry = () => {
    // Call enterprise inquiry function, same as the original
    navigate('/payment');
  };

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
        <div className="mt-2">
          {id === 'enterprise' ? (
            <span className="text-lg font-medium">Custom Pricing</span>
          ) : (
            <>
              <span className="text-3xl font-bold">${(price / 100).toFixed(2)}</span>
              <span className="text-muted-foreground">/month</span>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {id !== 'enterprise' && (
          <RadioGroup value={isSelected ? id : undefined} onValueChange={() => onSelect(id)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={id} id={`radio-${id}`} />
              <Label htmlFor={`radio-${id}`}>Select Plan</Label>
            </div>
          </RadioGroup>
        )}
        
        <div className="space-y-2">
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
