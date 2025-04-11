
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import OnboardingHeader from './OnboardingHeader';

const OnboardingCompletedView: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="w-full max-w-2xl">
      <OnboardingHeader isCompleted={true} />
      <CardContent className="pt-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p>You have already completed the onboarding process for your account. You can now access all features of the platform.</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={() => navigate('/dashboard')}
          className="space-x-2"
        >
          <span>Go to Dashboard</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OnboardingCompletedView;
