
import React from 'react';
import PricingTier from './PricingTier';

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
}

export const PricingTiers: React.FC<PricingTiersProps> = ({
  tiers,
  selectedTier,
  onTierChange
}) => {
  return (
    <div className="grid gap-6 lg:grid-cols-4 mb-12">
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
        />
      ))}
    </div>
  );
};

export default PricingTiers;
