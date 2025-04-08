
export type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  aiPrompt?: string; // Prompt to send to AI Assistant when step is active
};

export type OnboardingState = {
  steps: OnboardingStep[];
  currentStepIndex: number;
  isComplete: boolean;
};
