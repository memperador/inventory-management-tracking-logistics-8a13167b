
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, Bell, Check, Wrench, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ComplianceAlert, Equipment } from '@/components/equipment/types';
import { format, isPast, isAfter, addDays } from 'date-fns';

interface ComplianceAlertsProps {
  equipmentData: Equipment[];
}

export const ComplianceAlerts: React.FC<ComplianceAlertsProps> = ({ equipmentData }) => {
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  
  // Generate alerts based on equipment data
  useEffect(() => {
    const today = new Date();
    const thirtyDaysFromNow = addDays(today, 30);
    const newAlerts: ComplianceAlert[] = [];
    
    equipmentData.forEach(equipment => {
      // Check for maintenance alerts
      if (equipment.nextMaintenance) {
        const maintenanceDate = new Date(equipment.nextMaintenance);
        
        if (isPast(maintenanceDate)) {
          newAlerts.push({
            id: `maint-${equipment.id}-${Date.now()}`,
            equipmentId: equipment.id,
            equipmentName: equipment.name,
            alertType: 'Maintenance',
            dueDate: equipment.nextMaintenance,
            priority: 'Critical',
            status: 'Open',
            description: 'Maintenance overdue'
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
            description: 'Maintenance due soon'
          });
        }
      }
      
      // Check for certification alerts
      if (equipment.certificationRequired && equipment.certificationExpiry) {
        const certExpiryDate = new Date(equipment.certificationExpiry);
        
        if (isPast(certExpiryDate)) {
          newAlerts.push({
            id: `cert-${equipment.id}-${Date.now()}`,
            equipmentId: equipment.id,
            equipmentName: equipment.name,
            alertType: 'Certification',
            dueDate: equipment.certificationExpiry,
            priority: 'Critical',
            status: 'Open',
            description: 'Certification expired'
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
            description: 'Certification expiring soon'
          });
        }
      }
      
      // Check for inspection alerts
      if (equipment.nextInspection) {
        const inspectionDate = new Date(equipment.nextInspection);
        
        if (isPast(inspectionDate)) {
          newAlerts.push({
            id: `insp-${equipment.id}-${Date.now()}`,
            equipmentId: equipment.id,
            equipmentName: equipment.name,
            alertType: 'Inspection',
            dueDate: equipment.nextInspection,
            priority: 'Critical',
            status: 'Open',
            description: 'Inspection overdue'
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
            description: 'Inspection due soon'
          });
        }
      }
    });
    
    setAlerts(newAlerts);
  }, [equipmentData]);
  
  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? {...alert, status: 'Acknowledged'} : alert
    ));
  };
  
  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? {...alert, status: 'Resolved'} : alert
    ));
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
        <Badge variant="outline" className="ml-2">
          {activeAlerts.length} Active
        </Badge>
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
