
import React from 'react';
import { Equipment } from '@/components/equipment/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BellRing } from 'lucide-react';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { AlertConfigItem } from './components/AlertConfigItem';
import { EmailSettings } from './components/EmailSettings';
import { useAlertConfigs } from './hooks/useAlertConfigs';
import { useEmailSettings } from './hooks/useEmailSettings';

interface InventoryAlertsProps {
  equipmentData: Equipment[];
}

export const InventoryAlerts: React.FC<InventoryAlertsProps> = ({
  equipmentData
}) => {
  const { alertConfigs, toggleAlertChannel, updateInventoryLevel } = useAlertConfigs();
  const { emailSettings, updateEmail, saveEmailSettings } = useEmailSettings();
  const { addNotification } = useNotificationContext();

  // Test notification
  const sendTestNotification = (type: string) => {
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
    
    // Fix the addNotification call to use the proper number of arguments
    addNotification(
      notificationType as any, // type
      title, // title
      message, // message
      'high', // priority
      undefined, // equipmentId
      undefined, // equipmentName
      undefined, // actionUrl
      true // showToast
    );
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
              <AlertConfigItem
                key={config.type}
                config={config}
                index={index}
                onToggleChannel={toggleAlertChannel}
                onUpdateLevel={updateInventoryLevel}
                onTestAlert={sendTestNotification}
              />
            ))}
            
            <EmailSettings
              email={emailSettings.email}
              isValid={emailSettings.isValid}
              onChange={updateEmail}
              onSave={saveEmailSettings}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
