
import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  completed: boolean;
}

interface CompletionStepsProps {
  steps: Step[];
}

const CompletionSteps: React.FC<CompletionStepsProps> = ({ steps }) => {
  return (
    <div className="space-y-4">
      {steps.map((step) => (
        <div key={step.id} className="flex items-center">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
            step.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
          }`}>
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <span className="ml-3 text-sm font-medium">{step.label}</span>
        </div>
      ))}
    </div>
  );
};

export default CompletionSteps;
