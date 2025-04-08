
import React, { useEffect, useState } from 'react';
import { Equipment } from '@/components/equipment/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Bell, BellRing, Info, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNotificationContext } from '@/contexts/NotificationContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InventoryAlertConfig {
  inventoryLevel: number;
  emailEnabled: boolean;
  pushEnabled: boolean;
  type: 'low-inventory' | 'maintenance-due' | 'certification-expiring';
  name: string;
}

interface InventoryAlertsProps {
  equipmentData: Equipment[];
}

export const InventoryAlerts: React.FC<InventoryAlertsProps> = ({
  equipmentData
}) => {
  const [alertConfigs, setAlertConfigs] = useState<InventoryAlertConfig[]>([
    { 
      inventoryLevel: 5,
      emailEnabled: true,
      pushEnabled: true,
      type: 'low-inventory',
      name: 'Low Inventory Alert'
    },
    { 
      inventoryLevel: 14, // days
      emailEnabled: true,
      pushEnabled: true,
      type: 'maintenance-due',
      name: 'Maintenance Due Alert'
    },
    { 
      inventoryLevel: 30, // days
      emailEnabled: true,
      pushEnabled: true,
      type: 'certification-expiring',
      name: 'Certification Expiring Alert'
    }
  ]);
  
  const { toast } = useToast();
  const { addNotification } = useNotificationContext();
  const [emailSettings, setEmailSettings] = useState({
    email: '',
    isValid: false
  });

  // Validate email
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailSettings(prev => ({
      ...prev,
      isValid: emailRegex.test(prev.email)
    }));
  }, [emailSettings.email]);

  // Function to toggle alert notification channels
  const toggleAlertChannel = (index: number, channel: 'emailEnabled' | 'pushEnabled') => {
    const newConfigs = [...alertConfigs];
    newConfigs[index][channel] = !newConfigs[index][channel];
    setAlertConfigs(newConfigs);
    
    toast({
      title: "Alert Setting Updated",
      description: `${channel === 'emailEnabled' ? 'Email' : 'Push'} notifications ${newConfigs[index][channel] ? 'enabled' : 'disabled'} for ${newConfigs[index].name}`,
    });
  };

  // Update inventory level threshold
  const updateInventoryLevel = (index: number, value: number) => {
    const newConfigs = [...alertConfigs];
    newConfigs[index].inventoryLevel = value;
    setAlertConfigs(newConfigs);
  };

  // Save email settings
  const saveEmailSettings = () => {
    if (!emailSettings.isValid) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Email Settings Saved",
      description: `Notifications will be sent to ${emailSettings.email}`,
    });
  };

  // Test notification
  const sendTestNotification = (type: InventoryAlertConfig['type']) => {
    const config = alertConfigs.find(config => config.type === type);
    if (!config) return;
    
    let title, message, notificationType;
    
    switch (type) {
      case 'low-inventory':
        title = "Low Inventory Alert";
        message = `Inventory levels for several items have fallen below the threshold of ${config.inventoryLevel} units`;
        notificationType = 'general';
        break;
      case 'maintenance-due':
        title = "Maintenance Alert";
        message = `${equipmentData.slice(0, 2).map(e => e.name).join(", ")} maintenance is due in ${config.inventoryLevel} days`;
        notificationType = 'maintenance_due';
        break;
      case 'certification-expiring':
        title = "Certification Alert";
        message = `${equipmentData.slice(0, 2).map(e => e.name).join(", ")} certifications expire in ${config.inventoryLevel} days`;
        notificationType = 'certification_expiring';
        break;
    }
    
    addNotification({
      type: notificationType as any,
      title,
      message,
      priority: 'high',
      showToast: true
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BellRing className="mr-2 h-5 w-5" />
            Inventory Alerts Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {alertConfigs.map((config, index) => (
              <div key={config.type} className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{config.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {config.type === 'low-inventory' && `Triggers when inventory falls below ${config.inventoryLevel} units`}
                      {config.type === 'maintenance-due' && `Triggers when maintenance is due in ${config.inventoryLevel} days`}
                      {config.type === 'certification-expiring' && `Triggers when certifications expire in ${config.inventoryLevel} days`}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => sendTestNotification(config.type)}
                  >
                    Test Alert
                  </Button>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>{config.type === 'low-inventory' ? 'Inventory Threshold' : 'Days Threshold'}</Label>
                    <Input 
                      type="number" 
                      value={config.inventoryLevel}
                      min={1}
                      onChange={(e) => updateInventoryLevel(index, parseInt(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Email Notifications</Label>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={config.emailEnabled}
                        onChange={() => toggleAlertChannel(index, 'emailEnabled')}
                        id={`email-${config.type}`}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor={`email-${config.type}`} className="text-sm">
                        {config.emailEnabled ? 'Enabled' : 'Disabled'}
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Push Notifications</Label>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={config.pushEnabled}
                        onChange={() => toggleAlertChannel(index, 'pushEnabled')}
                        id={`push-${config.type}`}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor={`push-${config.type}`} className="text-sm">
                        {config.pushEnabled ? 'Enabled' : 'Disabled'}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="pt-2">
              <h3 className="font-medium mb-2">Email Notification Settings</h3>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label htmlFor="alert-email">Email Address</Label>
                  <Input 
                    id="alert-email"
                    type="email"
                    placeholder="Enter email address"
                    value={emailSettings.email}
                    onChange={(e) => setEmailSettings({ ...emailSettings, email: e.target.value })}
                  />
                </div>
                <Button onClick={saveEmailSettings} disabled={!emailSettings.isValid}>
                  Save Email
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
