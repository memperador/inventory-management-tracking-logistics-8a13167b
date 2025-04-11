
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface OnboardingHeaderProps {
  isCompleted: boolean;
}

const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({ isCompleted }) => {
  return isCompleted ? (
    <CardHeader className="text-center bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
      <CardTitle className="text-2xl flex items-center justify-center gap-2">
        <CheckCircle2 className="h-6 w-6 text-green-600" />
        Setup Complete
      </CardTitle>
      <CardDescription>
        Your account is ready to go!
      </CardDescription>
    </CardHeader>
  ) : (
    <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
      <CardTitle className="text-2xl flex items-center justify-center gap-2">
        <Sparkles className="h-6 w-6 text-blue-600" />
        Complete Your Setup
      </CardTitle>
      <CardDescription>
        Just one more step to get started!
      </CardDescription>
    </CardHeader>
  );
};

export default OnboardingHeader;
