
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import StartTrialButton from './StartTrialButton';

interface PremiumFeature {
  name: string;
  description: string;
}

const premiumFeatures: PremiumFeature[] = [
  {
    name: "Advanced GPS Tracking",
    description: "Real-time tracking with history and analytics"
  },
  {
    name: "Geofencing",
    description: "Create virtual boundaries for equipment and projects"
  },
  {
    name: "Route Optimization",
    description: "Optimize routes for equipment transportation"
  },
  {
    name: "Premium Analytics",
    description: "Advanced insights into equipment usage and project progress"
  },
  {
    name: "AI Assistance",
    description: "Get smart recommendations for equipment management"
  }
];

interface TrialInfoCardProps {
  onStartTrial?: () => void;
}

const TrialInfoCard: React.FC<TrialInfoCardProps> = ({ onStartTrial }) => {
  return (
    <Card className="w-full max-w-2xl border-2 border-primary/20">
      <CardHeader className="bg-primary/5">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl">Free 7-Day Trial</CardTitle>
            <CardDescription>Experience all premium features at no cost</CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary text-primary-foreground">
            Premium Tier
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <h3 className="font-medium text-lg mb-4">Premium Features Included:</h3>
        
        <div className="grid gap-3">
          {premiumFeatures.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{feature.name}</p>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 bg-muted/50 p-4 rounded-md">
          <h4 className="font-medium">What happens after the trial?</h4>
          <p className="text-sm text-muted-foreground mt-1">
            After your 7-day trial ends, you'll automatically be switched to the Basic tier. 
            No payment information is required and you won't be charged automatically.
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col">
        <StartTrialButton onSuccess={onStartTrial} />
        <p className="text-xs text-center mt-3 text-muted-foreground">
          No credit card required. Cancel anytime.
        </p>
      </CardFooter>
    </Card>
  );
};

export default TrialInfoCard;
