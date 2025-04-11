
import React from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles } from 'lucide-react';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

interface FreeTrialBannerProps {
  onStartTrial: () => void;
  isStartingTrial?: boolean;
}

const FreeTrialBanner: React.FC<FreeTrialBannerProps> = ({ 
  onStartTrial, 
  isStartingTrial = false 
}) => {
  const handleClick = () => {
    logAuth('TRIAL_BANNER', 'User clicked Start Free Trial button', {
      level: AUTH_LOG_LEVELS.INFO,
      force: true,
      data: {
        timestamp: new Date().toISOString(),
        currentPath: window.location.pathname
      }
    });
    
    onStartTrial();
  };
  
  return (
    <div className="relative overflow-hidden rounded-lg border bg-white shadow-sm mb-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Try Premium for 7 days</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              All features unlocked. No credit card required.
            </p>
          </div>
        </div>
        <Button 
          className="w-full md:w-auto"
          onClick={handleClick}
          disabled={isStartingTrial}
        >
          {isStartingTrial ? (
            <>
              <span className="animate-spin mr-2">⏳</span> Starting trial...
            </>
          ) : (
            'Start Free Trial'
          )}
        </Button>
      </div>
      <div className="absolute top-0 right-0">
        <svg
          className="h-24 w-24 text-primary/10"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 0H0V100C0 55.2 44.8 0 100 0Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
};

export default FreeTrialBanner;
