
import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { OnboardingStep } from './types';

interface OnboardingProgressProps {
  steps: OnboardingStep[];
  currentIndex: number;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ steps, currentIndex }) => {
  const progress = ((currentIndex + 1) / steps.length) * 100;
  
  return (
    <div className="space-y-4 mb-6">
      <div className="flex justify-between mb-2">
        <h3 className="text-sm font-medium">Onboarding Progress</h3>
        <span className="text-sm text-muted-foreground">
          Step {currentIndex + 1} of {steps.length}
        </span>
      </div>
      
      <Progress value={progress} className="h-2" />
      
      <div className="flex justify-between mt-4">
        {steps.map((step, index) => (
          <div 
            key={step.id} 
            className={`flex flex-col items-center ${
              index === currentIndex 
                ? 'text-primary' 
                : step.completed 
                  ? 'text-green-600' 
                  : 'text-gray-400'
            }`}
          >
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 border ${
                index === currentIndex 
                  ? 'border-primary' 
                  : step.completed 
                    ? 'border-green-600 bg-green-100' 
                    : 'border-gray-300'
              }`}
            >
              {step.completed ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <span className="text-xs text-center max-w-[80px]">{step.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnboardingProgress;
