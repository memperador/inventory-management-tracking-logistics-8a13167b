
import React, { useState, useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface BetaBannerProps {
  className?: string;
}

const BetaBanner: React.FC<BetaBannerProps> = ({ className }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastDismissed, setLastDismissed] = useState<string | null>(null);
  const [storedPreference, setStoredPreference] = useLocalStorage('beta-banner-preference', {
    dismissed: false,
    lastDismissed: null,
    showAgain: true
  });

  useEffect(() => {
    // Check if we should show the banner again based on the last dismissed date
    if (storedPreference.dismissed && storedPreference.showAgain) {
      const lastDate = new Date(storedPreference.lastDismissed || Date.now());
      const currentDate = new Date();
      
      // If it's a new day (different date), show the banner again
      if (currentDate.toDateString() !== lastDate.toDateString()) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    } else if (storedPreference.dismissed && !storedPreference.showAgain) {
      setIsVisible(false);
    }
  }, [storedPreference]);

  const handleKeepBanner = () => {
    setStoredPreference({
      dismissed: true,
      lastDismissed: new Date().toISOString(),
      showAgain: true
    });
    setIsVisible(false);
  };

  const handleRemoveBanner = () => {
    setStoredPreference({
      dismissed: true,
      lastDismissed: new Date().toISOString(),
      showAgain: false
    });
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <Alert variant="outline" className={`border-orange-300 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800 mb-4 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      <AlertTitle className="text-orange-800 dark:text-orange-300">Beta Version</AlertTitle>
      <AlertDescription className="text-orange-700 dark:text-orange-200">
        This platform is currently in beta. Features may change or be improved over time.
      </AlertDescription>
      <div className="flex gap-2 mt-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleKeepBanner}
          className="text-sm border-orange-300 hover:bg-orange-100 dark:border-orange-700 dark:hover:bg-orange-900/30"
        >
          Remind me tomorrow
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRemoveBanner}
          className="text-sm border-orange-300 hover:bg-orange-100 dark:border-orange-700 dark:hover:bg-orange-900/30"
        >
          Don't show again
        </Button>
      </div>
    </Alert>
  );
};

export default BetaBanner;
