
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InventoryAlertConfig } from '../types';

interface AlertConfigItemProps {
  config: InventoryAlertConfig;
  index: number;
  onToggleChannel: (index: number, channel: 'emailEnabled' | 'pushEnabled') => void;
  onUpdateLevel: (index: number, value: number) => void;
  onTestAlert: (type: InventoryAlertConfig['type']) => void;
}

export const AlertConfigItem: React.FC<AlertConfigItemProps> = ({
  config,
  index,
  onToggleChannel,
  onUpdateLevel,
  onTestAlert
}) => {
  return (
    <div className="border-b pb-4">
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
          onClick={() => onTestAlert(config.type)}
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
            onChange={(e) => onUpdateLevel(index, parseInt(e.target.value) || 0)}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Email Notifications</Label>
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              checked={config.emailEnabled}
              onChange={() => onToggleChannel(index, 'emailEnabled')}
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
              onChange={() => onToggleChannel(index, 'pushEnabled')}
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
  );
};
