
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
