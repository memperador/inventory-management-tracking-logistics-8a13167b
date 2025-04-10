
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface PlanHeaderProps {
  title: string;
  isAnnual: boolean;
}

export const PlanHeader: React.FC<PlanHeaderProps> = ({ title, isAnnual }) => {
  return (
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>
        {isAnnual 
          ? 'You will be charged annually (10% discount applied)'
          : 'You will be charged this amount monthly'
        }
      </CardDescription>
    </CardHeader>
  );
};
