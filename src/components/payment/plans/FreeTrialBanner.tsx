
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface FreeTrialBannerProps {
  onStartTrial: () => void;
}

export const FreeTrialBanner: React.FC<FreeTrialBannerProps> = ({ onStartTrial }) => {
  return (
    <div className="mb-8 bg-gradient-to-r from-purple-100 to-cyan-100 border border-purple-200 rounded-lg p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 h-40 w-40 opacity-10 -mt-12 -mr-12">
        <Sparkles className="h-full w-full text-purple-500" />
      </div>
      <h2 className="text-2xl font-bold mb-2 text-purple-800">Try Premium Free for 7 Days</h2>
      <p className="mb-4 text-purple-700">
        Experience all Premium tier features without commitment. During your trial, each feature will be labeled with its corresponding tier, so you'll know exactly what's included in each plan.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <Button 
          onClick={onStartTrial}
          size="lg" 
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Start 7-Day Free Trial
        </Button>
        <span className="text-purple-700 text-sm">No credit card required</span>
      </div>
    </div>
  );
};

export default FreeTrialBanner;
