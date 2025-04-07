
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Equipment } from '@/components/equipment/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { isPast, isAfter, addDays, format } from 'date-fns';

interface ComplianceStatusProps {
  equipmentData: Equipment[];
}

export const ComplianceStatus: React.FC<ComplianceStatusProps> = ({ equipmentData }) => {
  const complianceStats = useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = addDays(today, 30);
    
    // Calculate code compliance (NEC/CSI)
    const codeCompliantCount = equipmentData.filter(eq => eq.nec_code || eq.csi_code).length;
    const codeCompliancePercent = Math.round((codeCompliantCount / equipmentData.length) * 100) || 0;
    
    // Calculate maintenance compliance
    const maintenanceItems = equipmentData.filter(eq => eq.nextMaintenance);
    const maintenanceOverdueCount = maintenanceItems.filter(eq => 
      isPast(new Date(eq.nextMaintenance!))
    ).length;
    const maintenanceSoonCount = maintenanceItems.filter(eq => 
      !isPast(new Date(eq.nextMaintenance!)) && 
      isAfter(thirtyDaysFromNow, new Date(eq.nextMaintenance!))
    ).length;
    const maintenanceCompliantCount = maintenanceItems.length - maintenanceOverdueCount - maintenanceSoonCount;
    
    // Calculate certification compliance
    const certificationItems = equipmentData.filter(eq => eq.certificationRequired);
    const certExpiredCount = certificationItems.filter(eq => 
      eq.certificationExpiry && isPast(new Date(eq.certificationExpiry))
    ).length;
    const certSoonCount = certificationItems.filter(eq => 
      eq.certificationExpiry && 
      !isPast(new Date(eq.certificationExpiry)) && 
      isAfter(thirtyDaysFromNow, new Date(eq.certificationExpiry))
    ).length;
    const certValidCount = certificationItems.length - certExpiredCount - certSoonCount;
    
    // Calculate overall compliance score
    let overallScore = 0;
    let totalFactors = 0;
    
    if (equipmentData.length > 0) {
      overallScore += (codeCompliantCount / equipmentData.length) * 100;
      totalFactors++;
    }
    
    if (maintenanceItems.length > 0) {
      overallScore += (maintenanceCompliantCount / maintenanceItems.length) * 100;
      totalFactors++;
    }
    
    if (certificationItems.length > 0) {
      overallScore += (certValidCount / certificationItems.length) * 100;
      totalFactors++;
    }
    
    const overallCompliance = totalFactors > 0 ? Math.round(overallScore / totalFactors) : 0;
    
    return {
      overallCompliance,
      codeCompliancePercent,
      maintenanceStats: {
        total: maintenanceItems.length,
        overdue: maintenanceOverdueCount,
        soon: maintenanceSoonCount,
        compliant: maintenanceCompliantCount
      },
      certificationStats: {
        total: certificationItems.length,
        expired: certExpiredCount,
        expiringSoon: certSoonCount,
        valid: certValidCount
      }
    };
  }, [equipmentData]);
  
  const getComplianceItems = (type: string) => {
    const today = new Date();
    const thirtyDaysFromNow = addDays(today, 30);
    
    switch (type) {
      case 'maintenance-overdue':
        return equipmentData.filter(eq => 
          eq.nextMaintenance && isPast(new Date(eq.nextMaintenance))
        );
      case 'maintenance-soon':
        return equipmentData.filter(eq => 
          eq.nextMaintenance && 
          !isPast(new Date(eq.nextMaintenance)) && 
          isAfter(thirtyDaysFromNow, new Date(eq.nextMaintenance))
        );
      case 'certification-expired':
        return equipmentData.filter(eq => 
          eq.certificationRequired && 
          eq.certificationExpiry && 
          isPast(new Date(eq.certificationExpiry))
        );
      case 'certification-soon':
        return equipmentData.filter(eq => 
          eq.certificationRequired && 
          eq.certificationExpiry && 
          !isPast(new Date(eq.certificationExpiry)) && 
          isAfter(thirtyDaysFromNow, new Date(eq.certificationExpiry))
        );
      case 'missing-codes':
        return equipmentData.filter(eq => !eq.nec_code && !eq.csi_code);
      default:
        return [];
    }
  };
  
  const getProgressColor = (percent: number) => {
    if (percent >= 80) return 'bg-green-500';
    if (percent >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Status</CardTitle>
        <CardDescription>
          Current compliance status across your equipment inventory
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">Overall Compliance Score</div>
            <div className="font-medium">{complianceStats.overallCompliance}%</div>
          </div>
          <Progress 
            value={complianceStats.overallCompliance} 
            className={getProgressColor(complianceStats.overallCompliance)}
          />
        </div>
        
        <Tabs defaultValue="code-compliance">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="code-compliance">Code Compliance</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="code-compliance">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">Industry Code Compliance</div>
                  <div>{complianceStats.codeCompliancePercent}%</div>
                </div>
                <Progress 
                  value={complianceStats.codeCompliancePercent} 
                  className={getProgressColor(complianceStats.codeCompliancePercent)}
                />
              </div>
              
              {getComplianceItems('missing-codes').length > 0 && (
                <div className="border rounded-md p-3">
                  <h4 className="font-medium mb-2">Equipment Missing Industry Codes</h4>
                  <div className="text-sm space-y-2">
                    {getComplianceItems('missing-codes').slice(0, 3).map(item => (
                      <div key={item.id} className="flex justify-between border-b pb-1">
                        <span>{item.name}</span>
                        <Badge variant="outline">Missing Codes</Badge>
                      </div>
                    ))}
                    {getComplianceItems('missing-codes').length > 3 && (
                      <div className="text-center text-sm text-muted-foreground">
                        {getComplianceItems('missing-codes').length - 3} more items...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="maintenance">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="border rounded-md p-3 text-center">
                  <div className="text-2xl font-medium text-green-500">
                    {complianceStats.maintenanceStats.compliant}
                  </div>
                  <div className="text-xs text-muted-foreground">Compliant</div>
                </div>
                <div className="border rounded-md p-3 text-center">
                  <div className="text-2xl font-medium text-yellow-500">
                    {complianceStats.maintenanceStats.soon}
                  </div>
                  <div className="text-xs text-muted-foreground">Due Soon</div>
                </div>
                <div className="border rounded-md p-3 text-center">
                  <div className="text-2xl font-medium text-red-500">
                    {complianceStats.maintenanceStats.overdue}
                  </div>
                  <div className="text-xs text-muted-foreground">Overdue</div>
                </div>
              </div>
              
              {getComplianceItems('maintenance-overdue').length > 0 && (
                <div className="border rounded-md p-3">
                  <h4 className="font-medium mb-2">Overdue Maintenance</h4>
                  <div className="text-sm space-y-2">
                    {getComplianceItems('maintenance-overdue').slice(0, 3).map(item => (
                      <div key={item.id} className="flex justify-between border-b pb-1">
                        <span>{item.name}</span>
                        <span className="text-red-500 text-xs">
                          Due: {item.nextMaintenance && format(new Date(item.nextMaintenance), 'MMM d, yyyy')}
                        </span>
                      </div>
                    ))}
                    {getComplianceItems('maintenance-overdue').length > 3 && (
                      <div className="text-center text-sm text-muted-foreground">
                        {getComplianceItems('maintenance-overdue').length - 3} more items...
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {getComplianceItems('maintenance-soon').length > 0 && (
                <div className="border rounded-md p-3">
                  <h4 className="font-medium mb-2">Maintenance Due Soon</h4>
                  <div className="text-sm space-y-2">
                    {getComplianceItems('maintenance-soon').slice(0, 3).map(item => (
                      <div key={item.id} className="flex justify-between border-b pb-1">
                        <span>{item.name}</span>
                        <span className="text-yellow-500 text-xs">
                          Due: {item.nextMaintenance && format(new Date(item.nextMaintenance), 'MMM d, yyyy')}
                        </span>
                      </div>
                    ))}
                    {getComplianceItems('maintenance-soon').length > 3 && (
                      <div className="text-center text-sm text-muted-foreground">
                        {getComplianceItems('maintenance-soon').length - 3} more items...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="certifications">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="border rounded-md p-3 text-center">
                  <div className="text-2xl font-medium text-green-500">
                    {complianceStats.certificationStats.valid}
                  </div>
                  <div className="text-xs text-muted-foreground">Valid</div>
                </div>
                <div className="border rounded-md p-3 text-center">
                  <div className="text-2xl font-medium text-yellow-500">
                    {complianceStats.certificationStats.expiringSoon}
                  </div>
                  <div className="text-xs text-muted-foreground">Expiring Soon</div>
                </div>
                <div className="border rounded-md p-3 text-center">
                  <div className="text-2xl font-medium text-red-500">
                    {complianceStats.certificationStats.expired}
                  </div>
                  <div className="text-xs text-muted-foreground">Expired</div>
                </div>
              </div>
              
              {getComplianceItems('certification-expired').length > 0 && (
                <div className="border rounded-md p-3">
                  <h4 className="font-medium mb-2">Expired Certifications</h4>
                  <div className="text-sm space-y-2">
                    {getComplianceItems('certification-expired').slice(0, 3).map(item => (
                      <div key={item.id} className="flex justify-between border-b pb-1">
                        <span>{item.name}</span>
                        <span className="text-red-500 text-xs">
                          Expired: {item.certificationExpiry && format(new Date(item.certificationExpiry), 'MMM d, yyyy')}
                        </span>
                      </div>
                    ))}
                    {getComplianceItems('certification-expired').length > 3 && (
                      <div className="text-center text-sm text-muted-foreground">
                        {getComplianceItems('certification-expired').length - 3} more items...
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {getComplianceItems('certification-soon').length > 0 && (
                <div className="border rounded-md p-3">
                  <h4 className="font-medium mb-2">Certifications Expiring Soon</h4>
                  <div className="text-sm space-y-2">
                    {getComplianceItems('certification-soon').slice(0, 3).map(item => (
                      <div key={item.id} className="flex justify-between border-b pb-1">
                        <span>{item.name}</span>
                        <span className="text-yellow-500 text-xs">
                          Expires: {item.certificationExpiry && format(new Date(item.certificationExpiry), 'MMM d, yyyy')}
                        </span>
                      </div>
                    ))}
                    {getComplianceItems('certification-soon').length > 3 && (
                      <div className="text-center text-sm text-muted-foreground">
                        {getComplianceItems('certification-soon').length - 3} more items...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
