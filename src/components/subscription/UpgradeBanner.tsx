
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { useTenant } from '@/hooks/useTenantContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface UpgradeBannerProps {
  className?: string;
  showDismiss?: boolean;
}

export const UpgradeBanner: React.FC<UpgradeBannerProps> = ({ 
  className = '',
  showDismiss = true 
}) => {
  const { currentTenant } = useTenant();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // If already on premium plan, don't show banner
  if (!currentTenant || !currentTenant.subscription_tier || 
      currentTenant.subscription_tier === 'premium') {
    return null;
  }
  
  if (!isVisible) {
    return null;
  }
  
  const isPremiumPromo = currentTenant.subscription_tier === 'standard';
  const isBasicPromo = currentTenant.subscription_tier === 'basic';
  
  const bannerBackgroundColor = isPremiumPromo ? 
    'bg-gradient-to-r from-purple-100 to-indigo-100 border-purple-200' : 
    'bg-gradient-to-r from-blue-100 to-cyan-100 border-blue-200';
  
  const accentColor = isPremiumPromo ? 'text-purple-600' : 'text-blue-600';
  const buttonColor = isPremiumPromo ? 'bg-purple-600 hover:bg-purple-700' : '';
  
  // Features to promote based on current tier
  const promotedFeatures = isPremiumPromo ? [
    'Advanced GPS Intelligence',
    'Geofencing Capabilities',
    'Route Optimization Tools',
    'Premium AI Asset Management'
  ] : [
    'GPS Equipment Tracking',
    'Audit Logs and Compliance',
    'Advanced Alert System',
    'Bulk QR Generation'
  ];
  
  const nextTier = isPremiumPromo ? 'Premium' : 'Standard';
  
  return (
    <div className={`${bannerBackgroundColor} border rounded-lg p-4 mb-6 ${className}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-full ${isPremiumPromo ? 'bg-purple-200' : 'bg-blue-200'}`}>
            <Zap className={`h-5 w-5 ${accentColor}`} />
          </div>
          
          <div>
            <h3 className="font-medium">
              Unlock more features with our {nextTier} plan!
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {isPremiumPromo ? 
                'Advanced GPS intelligence, geofencing, and more' : 
                'Get GPS tracking, advanced analytics, and bulk operations'}
            </p>
            
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <button 
                  className={`text-sm flex items-center ${accentColor} mt-1`}
                >
                  {isExpanded ? 'Show less' : 'See what you\'re missing'} 
                  {isExpanded ? 
                    <ChevronUp className="h-3 w-3 ml-1" /> : 
                    <ChevronDown className="h-3 w-3 ml-1" />}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="mt-2 space-y-1">
                  {promotedFeatures.map((feature, index) => (
                    <li key={index} className="text-sm flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-current mr-2"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            className={buttonColor}
            onClick={() => navigate('/payment')}
          >
            Upgrade Now <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
          
          {showDismiss && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsVisible(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
