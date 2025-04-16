
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { calculateTrialDaysLeft } from '@/utils/subscription/trialUtils';

interface TrialInfoCardProps {
  onStartTrial: () => void;
}

const TrialInfoCard: React.FC<TrialInfoCardProps> = ({ onStartTrial }) => {
  const { currentTenant } = useTenant();
  
  const isTrialActive = currentTenant?.subscription_status === 'trialing';
  const trialDaysLeft = calculateTrialDaysLeft(currentTenant?.trial_ends_at);
  
  return (
    <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="rounded-full p-2 bg-purple-100">
          <Sparkles className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold">
            {isTrialActive 
              ? `Your Premium Trial: ${trialDaysLeft} Days Remaining` 
              : "Try Premium Features Free for 7 Days"}
          </h3>
          <p className="text-muted-foreground">
            {isTrialActive 
              ? "You're currently accessing all premium features" 
              : "Experience all features with no commitment required"}
          </p>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-2">
              <div className="rounded-full p-1 bg-green-100">
                <svg className="h-3 w-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span className="text-sm">Advanced GPS Tracking</span>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="rounded-full p-1 bg-green-100">
                <svg className="h-3 w-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span className="text-sm">Premium Analytics</span>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="rounded-full p-1 bg-green-100">
                <svg className="h-3 w-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span className="text-sm">AI Assistant</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={onStartTrial} 
          className="w-full bg-purple-600 hover:bg-purple-700"
          disabled={isTrialActive}
        >
          {isTrialActive ? 'Trial Already Active' : 'Start Free Trial'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TrialInfoCard;
