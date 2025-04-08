
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Equipment } from '@/components/equipment/types';
import { useComplianceAlerts } from './hooks/useComplianceAlerts';
import { AlertItem } from './AlertItem';
import { EmptyAlerts } from './EmptyAlerts';

interface ComplianceAlertsProps {
  equipmentData: Equipment[];
}

export const ComplianceAlerts: React.FC<{ equipmentData: Equipment[] }> = ({ equipmentData }) => {
  const { toast } = useToast();
  const { alerts, lastEquipmentUpdate, acknowledgeAlert, resolveAlert } = useComplianceAlerts(equipmentData);
  
  const handleAcknowledgeAlert = (alertId: string) => {
    acknowledgeAlert(alertId);
    toast({
      title: "Alert acknowledged",
      description: "The compliance alert has been acknowledged",
    });
  };
  
  const handleResolveAlert = (alertId: string) => {
    const alertToResolve = alerts.find(a => a.id === alertId);
    resolveAlert(alertId);
    
    if (alertToResolve) {
      toast({
        title: "Alert resolved",
        description: `${alertToResolve.alertType} alert for ${alertToResolve.equipmentName} has been resolved`,
      });
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          Compliance Alerts
        </CardTitle>
        <div className="flex items-center gap-2">
          {lastEquipmentUpdate && (
            <span className="text-xs text-muted-foreground">
              Last updated: {format(new Date(lastEquipmentUpdate), 'MMM dd, yyyy HH:mm')}
            </span>
          )}
          <Badge variant="outline" className="ml-2">
            {alerts.length} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <EmptyAlerts />
        ) : (
          <div className="space-y-3">
            {alerts.map(alert => (
              <AlertItem 
                key={alert.id}
                alert={alert}
                onAcknowledge={handleAcknowledgeAlert}
                onResolve={handleResolveAlert}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
