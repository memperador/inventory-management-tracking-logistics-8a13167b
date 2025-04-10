
import { ServiceTier } from '@/components/payment/plans/PricingTiers';

// Service tiers data
export const serviceTiers: ServiceTier[] = [
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

export default serviceTiers;
