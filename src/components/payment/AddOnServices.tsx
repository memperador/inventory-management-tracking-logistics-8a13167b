
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Check, Download, Users, Wrench, Shield, Database, PenTool, GraduationCap, Clock } from 'lucide-react';
import { v4 as uuidv4 } from '@/utils/uuid';

interface AddOnServicesProps {
  currentTier: string;
}

interface AddOnService {
  id: string;
  name: string;
  description: string;
  price: number;
  compatibility: string[];
  icon: React.ReactNode;
}

const AddOnServices: React.FC<AddOnServicesProps> = ({ currentTier }) => {
  const { toast } = useToast();
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  
  const addOnServices: AddOnService[] = [
    {
      id: 'additional-users',
      name: 'Additional Users',
      description: 'Add 5 more user accounts to your subscription',
      price: 2500, // $25.00
      compatibility: ['basic', 'standard', 'premium'],
      icon: <Users className="h-5 w-5" />
    },
    {
      id: 'maintenance-module',
      name: 'Maintenance Module',
      description: 'Comprehensive maintenance scheduling and tracking',
      price: 4900, // $49.00
      compatibility: ['standard', 'premium'],
      icon: <Wrench className="h-5 w-5" />
    },
    {
      id: 'compliance-module',
      name: 'Compliance & Certification',
      description: 'Advanced certification tracking and compliance reporting',
      price: 5900, // $59.00
      compatibility: ['standard', 'premium'],
      icon: <Shield className="h-5 w-5" />
    },
    {
      id: 'data-export',
      name: 'Advanced Data Export',
      description: 'Export to multiple formats including Excel, CSV, PDF and API access',
      price: 1900, // $19.00
      compatibility: ['basic', 'standard', 'premium'],
      icon: <Download className="h-5 w-5" />
    },
    {
      id: 'custom-reporting',
      name: 'Custom Reporting',
      description: 'Create and schedule custom reports with advanced visualization',
      price: 3900, // $39.00
      compatibility: ['standard', 'premium'],
      icon: <PenTool className="h-5 w-5" />
    },
    {
      id: 'data-retention',
      name: 'Extended Data Retention',
      description: 'Increase historical data storage from 12 months to 3 years',
      price: 2900, // $29.00
      compatibility: ['basic', 'standard', 'premium'],
      icon: <Database className="h-5 w-5" />
    },
    {
      id: 'training-session',
      name: 'Training Session',
      description: 'One-time 2-hour virtual training session for your team',
      price: 19900, // $199.00 (one-time fee)
      compatibility: ['basic', 'standard', 'premium'],
      icon: <GraduationCap className="h-5 w-5" />
    },
    {
      id: 'priority-support',
      name: 'Priority Support',
      description: 'Get expedited support with guaranteed 4-hour response time',
      price: 4900, // $49.00
      compatibility: ['standard', 'premium'],
      icon: <Clock className="h-5 w-5" />
    }
  ];

  // Filter add-ons based on tier compatibility
  const compatibleAddOns = addOnServices.filter(addon => 
    addon.compatibility.includes(currentTier)
  );

  const toggleAddOn = (id: string) => {
    setSelectedAddOns(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const calculateTotal = () => {
    return selectedAddOns.reduce((total, id) => {
      const addon = addOnServices.find(a => a.id === id);
      return total + (addon?.price || 0);
    }, 0);
  };

  const handlePurchase = () => {
    if (selectedAddOns.length === 0) {
      toast({
        title: "No add-ons selected",
        description: "Please select at least one add-on to purchase.",
        variant: "destructive"
      });
      return;
    }

    const selectedItems = selectedAddOns.map(id => {
      const addon = addOnServices.find(a => a.id === id);
      return addon?.name || "";
    });

    // In a real application, this would initiate a payment process
    toast({
      title: "Add-ons Selected",
      description: `You've selected: ${selectedItems.join(", ")}. Proceed to checkout.`,
    });

    // Generate a mock order ID
    const orderId = uuidv4().substring(0, 8);
    
    toast({
      title: "Add-on Purchase Initiated",
      description: `Order #${orderId} has been created. Our team will contact you to complete the setup.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-4 rounded-lg border mb-6">
        <h2 className="font-medium text-lg mb-2">Enhance Your Subscription</h2>
        <p className="text-muted-foreground">
          Add powerful features to your {currentTier} subscription to tailor it to your specific needs. 
          All add-ons are billed monthly alongside your main subscription.
        </p>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {compatibleAddOns.map((addon) => (
          <Card 
            key={addon.id}
            className={selectedAddOns.includes(addon.id) ? 'border-primary ring-1 ring-primary' : ''}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                    {addon.icon}
                  </div>
                  <CardTitle className="text-lg">{addon.name}</CardTitle>
                </div>
                {selectedAddOns.includes(addon.id) && (
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
              </div>
              <CardDescription className="mt-1.5">{addon.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="font-semibold text-lg">
                  ${(addon.price / 100).toFixed(2)}
                  {addon.id === 'training-session' ? ' one-time' : '/mo'}
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={`addon-${addon.id}`} 
                    checked={selectedAddOns.includes(addon.id)}
                    onCheckedChange={() => toggleAddOn(addon.id)}
                  />
                  <Label htmlFor={`addon-${addon.id}`}>Select</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {selectedAddOns.length > 0 && (
        <div className="mt-8 p-4 border rounded-lg bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-lg">Selected Add-ons</h3>
            <div className="text-right">
              <div className="text-lg font-bold">
                ${(calculateTotal() / 100).toFixed(2)}
                {selectedAddOns.length === 1 && selectedAddOns[0] === 'training-session' 
                  ? ' one-time' 
                  : '/month'
                }
              </div>
              <div className="text-sm text-muted-foreground">
                Plus applicable taxes
              </div>
            </div>
          </div>
          
          <Button 
            className="w-full" 
            onClick={handlePurchase}
          >
            Purchase Add-ons
          </Button>
        </div>
      )}

      <div className="text-sm text-muted-foreground mt-4">
        <p>Add-ons can be canceled at any time. One-time fees are non-refundable.</p>
        <p>For custom add-ons or enterprise needs, please contact our sales team.</p>
      </div>
    </div>
  );
};

export default AddOnServices;
