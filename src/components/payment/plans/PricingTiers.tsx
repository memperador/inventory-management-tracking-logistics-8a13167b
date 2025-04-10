
import React from 'react';
import PricingTier from './PricingTier';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export interface ServiceTier {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  ai: string;
  limits: {
    assets: number | string;
    users: number | string;
  };
}

interface PricingTiersProps {
  tiers: ServiceTier[];
  selectedTier: string;
  onTierChange: (tierId: string) => void;
  paymentType: string;
  onPaymentTypeChange: (type: string) => void;
}

export const PricingTiers: React.FC<PricingTiersProps> = ({
  tiers,
  selectedTier,
  onTierChange,
  paymentType,
  onPaymentTypeChange
}) => {
  return (
    <div className="space-y-8">
      {/* Payment Period Toggle */}
      <div className="w-full max-w-md mx-auto">
        <div className="space-y-2">
          <Label className="text-lg font-medium">Payment Period</Label>
          <div className="flex items-center justify-between p-4 bg-slate-100 rounded-lg">
            <span className={`text-sm font-medium ${paymentType === 'subscription' ? 'text-primary' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            
            <Switch 
              checked={paymentType === 'annual'}
              onCheckedChange={(checked) => onPaymentTypeChange(checked ? 'annual' : 'subscription')}
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
      
      {/* Pricing Tiers Grid */}
      <div className="grid gap-6 lg:grid-cols-4">
        {tiers.map((tier) => (
          <PricingTier
            key={tier.id}
            id={tier.id}
            name={tier.name}
            description={tier.description}
            price={tier.price}
            features={tier.features}
            ai={tier.ai}
            limits={tier.limits}
            isSelected={selectedTier === tier.id}
            isPopular={tier.id === 'premium'}
            onSelect={onTierChange}
            paymentType={paymentType}
            onPaymentTypeChange={onPaymentTypeChange}
          />
        ))}
      </div>
    </div>
  );
};

export default PricingTiers;
