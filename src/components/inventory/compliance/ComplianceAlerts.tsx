import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, Bell, Check, Wrench, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ComplianceAlert, Equipment } from '@/components/equipment/types';
import { format, isPast, isAfter, addDays } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

interface ComplianceAlertsProps {
  equipmentData: Equipment[];
}

export const ComplianceAlerts: React.FC<ComplianceAlertsProps> = ({ equipmentData }) => {
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [lastEquipmentUpdate, setLastEquipmentUpdate] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Load alerts from localStorage on component mount
  useEffect(() => {
    const savedAlerts = localStorage.getItem('complianceAlerts');
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts));
    }
    
    const lastUpdate = localStorage.getItem('lastEquipmentUpdate');
    if (lastUpdate) {
      setLastEquipmentUpdate(lastUpdate);
    }
  }, []);
  
  // Generate alerts based on equipment data
  useEffect(() => {
    const today = new Date();
    const thirtyDaysFromNow = addDays(today, 30);
    const newAlerts: ComplianceAlert[] = [];
    
    // Check if equipment data has changed since last alert generation
    const currentEquipmentState = JSON.stringify(equipmentData);
    const previousEquipmentState = localStorage.getItem('equipmentState');
    
    if (previousEquipmentState === currentEquipmentState && alerts.length > 0) {
      // Equipment data hasn't changed, so we don't need to regenerate alerts
      return;
    }
    
    // Store current equipment state for future comparison
    localStorage.setItem('equipmentState', currentEquipmentState);
    localStorage.setItem('lastEquipmentUpdate', new Date().toISOString());
    setLastEquipmentUpdate(new Date().toISOString());
    
    // Keep acknowledged and resolved alerts
    const existingAlertsByKey = new Map();
    alerts.forEach(alert => {
      if (alert.status === 'Acknowledged' || alert.status === 'Resolved') {
        const key = `${alert.alertType}-${alert.equipmentId}-${alert.dueDate}`;
        existingAlertsByKey.set(key, alert);
      }
    });
    
    equipmentData.forEach(equipment => {
      // Check for maintenance alerts
      if (equipment.nextMaintenance) {
        const maintenanceDate = new Date(equipment.nextMaintenance);
        const alertKey = `Maintenance-${equipment.id}-${equipment.nextMaintenance}`;
        const existingAlert = existingAlertsByKey.get(alertKey);
        
        if (existingAlert) {
          newAlerts.push(existingAlert);
        } else if (isPast(maintenanceDate)) {
          newAlerts.push({
            id: `maint-${equipment.id}-${Date.now()}`,
            equipmentId: equipment.id,
            equipmentName: equipment.name,
            alertType: 'Maintenance',
            dueDate: equipment.nextMaintenance,
            priority: 'Critical',
            status: 'Open',
            description: 'Maintenance overdue',
            createdAt: new Date().toISOString()
          });
        } else if (isAfter(thirtyDaysFromNow, maintenanceDate)) {
          newAlerts.push({
            id: `maint-soon-${equipment.id}-${Date.now()}`,
            equipmentId: equipment.id,
            equipmentName: equipment.name,
            alertType: 'Maintenance',
            dueDate: equipment.nextMaintenance,
            priority: 'High',
            status: 'Open',
            description: 'Maintenance due soon',
            createdAt: new Date().toISOString()
          });
        }
      }
      
      // Check for certification alerts
      if (equipment.certificationRequired && equipment.certificationExpiry) {
        const certExpiryDate = new Date(equipment.certificationExpiry);
        const alertKey = `Certification-${equipment.id}-${equipment.certificationExpiry}`;
        const existingAlert = existingAlertsByKey.get(alertKey);
        
        if (existingAlert) {
          newAlerts.push(existingAlert);
        } else if (isPast(certExpiryDate)) {
          newAlerts.push({
            id: `cert-${equipment.id}-${Date.now()}`,
            equipmentId: equipment.id,
            equipmentName: equipment.name,
            alertType: 'Certification',
            dueDate: equipment.certificationExpiry,
            priority: 'Critical',
            status: 'Open',
            description: 'Certification expired',
            createdAt: new Date().toISOString()
          });
        } else if (isAfter(thirtyDaysFromNow, certExpiryDate)) {
          newAlerts.push({
            id: `cert-soon-${equipment.id}-${Date.now()}`,
            equipmentId: equipment.id,
            equipmentName: equipment.name,
            alertType: 'Certification',
            dueDate: equipment.certificationExpiry,
            priority: 'High',
            status: 'Open',
            description: 'Certification expiring soon',
            createdAt: new Date().toISOString()
          });
        }
      }
      
      // Check for inspection alerts
      if (equipment.nextInspection) {
        const inspectionDate = new Date(equipment.nextInspection);
        const alertKey = `Inspection-${equipment.id}-${equipment.nextInspection}`;
        const existingAlert = existingAlertsByKey.get(alertKey);
        
        if (existingAlert) {
          newAlerts.push(existingAlert);
        } else if (isPast(inspectionDate)) {
          newAlerts.push({
            id: `insp-${equipment.id}-${Date.now()}`,
            equipmentId: equipment.id,
            equipmentName: equipment.name,
            alertType: 'Inspection',
            dueDate: equipment.nextInspection,
            priority: 'Critical',
            status: 'Open',
            description: 'Inspection overdue',
            createdAt: new Date().toISOString()
          });
        } else if (isAfter(thirtyDaysFromNow, inspectionDate)) {
          newAlerts.push({
            id: `insp-soon-${equipment.id}-${Date.now()}`,
            equipmentId: equipment.id,
            equipmentName: equipment.name,
            alertType: 'Inspection',
            dueDate: equipment.nextInspection,
            priority: 'Medium',
            status: 'Open',
            description: 'Inspection due soon',
            createdAt: new Date().toISOString()
          });
        }
      }
    });
    
    // Update alerts and save to localStorage
    setAlerts(newAlerts);
    localStorage.setItem('complianceAlerts', JSON.stringify(newAlerts));
  }, [equipmentData]);
  
  const acknowledgeAlert = (alertId: string) => {
    const updatedAlerts = alerts.map(alert => 
      alert.id === alertId ? {...alert, status: 'Acknowledged', updatedAt: new Date().toISOString()} : alert
    );
    setAlerts(updatedAlerts);
    localStorage.setItem('complianceAlerts', JSON.stringify(updatedAlerts));
    
    // Show toast notification
    toast({
      title: "Alert acknowledged",
      description: "The compliance alert has been acknowledged",
    });
  };
  
  const resolveAlert = (alertId: string) => {
    const alertToResolve = alerts.find(a => a.id === alertId);
    
    if (!alertToResolve) return;
    
    const updatedAlerts = alerts.map(alert => 
      alert.id === alertId ? {
        ...alert, 
        status: 'Resolved', 
        resolvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } : alert
    );
    setAlerts(updatedAlerts);
    localStorage.setItem('complianceAlerts', JSON.stringify(updatedAlerts));
    
    // Show toast notification with contextual message based on alert type
    toast({
      title: "Alert resolved",
      description: `${alertToResolve.alertType} alert for ${alertToResolve.equipmentName} has been resolved`,
    });
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-yellow-500 text-black';
      case 'Low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };
  
  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'Maintenance': return <Wrench className="h-4 w-4" />;
      case 'Certification': return <FileText className="h-4 w-4" />;
      case 'Inspection': return <CalendarClock className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };
  
  // Filter out resolved alerts
  const activeAlerts = alerts.filter(alert => alert.status !== 'Resolved');
  
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
            {activeAlerts.length} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {activeAlerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active alerts at this time.</p>
        ) : (
          <div className="space-y-3">
            {activeAlerts.map(alert => (
              <div 
                key={alert.id} 
                className="flex items-start justify-between border-b pb-3"
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${getPriorityColor(alert.priority)}`}>
                    {getAlertIcon(alert.alertType)}
                  </div>
                  <div>
                    <h4 className="font-medium">{alert.equipmentName}</h4>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                    <div className="flex items-center mt-1">
                      <CalendarClock className="h-3 w-3 mr-1" />
                      <span className="text-xs">
                        Due: {format(new Date(alert.dueDate), 'MMM dd, yyyy')}
                      </span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {alert.alertType}
                      </Badge>
                      {alert.status === 'Acknowledged' && (
                        <Badge variant="outline" className="ml-2 text-xs bg-yellow-50">
                          Acknowledged
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {alert.status === 'Open' && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      Acknowledge
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    onClick={() => resolveAlert(alert.id)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Resolve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
