
import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Equipment } from '@/components/equipment/types';
import { AlertCircle, Clock, CheckCircle2, Calendar } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ComplianceNotificationsProps {
  equipmentData: Equipment[];
}

export const ComplianceNotifications: React.FC<ComplianceNotificationsProps> = ({ equipmentData }) => {
  const { toast } = useToast();

  // Find equipment with expiring certifications or inspections
  const getExpiringItems = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    return equipmentData.filter(item => {
      let isExpiring = false;
      
      // Check certification expiry
      if (item.certificationRequired && item.certificationExpiry) {
        const expiryDate = new Date(item.certificationExpiry);
        if (expiryDate <= thirtyDaysFromNow && expiryDate > today) {
          isExpiring = true;
        }
      }
      
      // Check next inspection date
      if (item.nextInspection) {
        const inspectionDate = new Date(item.nextInspection);
        if (inspectionDate <= thirtyDaysFromNow && inspectionDate > today) {
          isExpiring = true;
        }
      }
      
      return isExpiring;
    });
  };
  
  // Find equipment with expired certifications or inspections
  const getExpiredItems = () => {
    const today = new Date();
    
    return equipmentData.filter(item => {
      let isExpired = false;
      
      // Check certification expiry
      if (item.certificationRequired && item.certificationExpiry) {
        const expiryDate = new Date(item.certificationExpiry);
        if (expiryDate < today) {
          isExpired = true;
        }
      }
      
      // Check next inspection date
      if (item.nextInspection) {
        const inspectionDate = new Date(item.nextInspection);
        if (inspectionDate < today) {
          isExpired = true;
        }
      }
      
      return isExpired;
    });
  };
  
  const expiringItems = getExpiringItems();
  const expiredItems = getExpiredItems();
  
  // Show toast notifications for expired and expiring items on component mount
  useEffect(() => {
    // Show toast for expired items
    if (expiredItems.length > 0) {
      toast({
        title: "Compliance Warning",
        description: `${expiredItems.length} items have expired certifications or inspections`,
        variant: "destructive",
      });
    }
    
    // Show toast for expiring items
    if (expiringItems.length > 0) {
      toast({
        title: "Compliance Alert",
        description: `${expiringItems.length} items have certifications or inspections expiring soon`,
        variant: "default",
      });
    }
  }, []);

  // Calculate days until expiration
  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    const targetDate = new Date(dateString);
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Compliance Notifications
        </CardTitle>
        <CardDescription>
          Manage equipment certification and inspection deadlines
        </CardDescription>
      </CardHeader>
      <CardContent>
        {expiredItems.length === 0 && expiringItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
            <h3 className="text-lg font-medium">All Equipment Compliant</h3>
            <p className="text-sm text-muted-foreground mt-1">
              No certification or inspection issues found
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {expiredItems.length > 0 && (
              <div>
                <h3 className="text-md font-medium mb-3 flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  Expired Items ({expiredItems.length})
                </h3>
                <div className="space-y-2">
                  {expiredItems.map((item) => (
                    <div key={item.id} className="border rounded-md p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.type}</p>
                          {item.certificationRequired && item.certificationExpiry && 
                            new Date(item.certificationExpiry) < new Date() && (
                            <div className="flex items-center mt-1">
                              <Badge variant="destructive" className="mr-2">
                                Certification Expired
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(item.certificationExpiry).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {item.nextInspection && 
                            new Date(item.nextInspection) < new Date() && (
                            <div className="flex items-center mt-1">
                              <Badge variant="destructive" className="mr-2">
                                Inspection Overdue
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(item.nextInspection).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                        <Button size="sm" variant="outline">Schedule</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {expiringItems.length > 0 && (
              <div>
                <h3 className="text-md font-medium mb-3 flex items-center">
                  <Clock className="h-4 w-4 text-amber-500 mr-2" />
                  Expiring Soon ({expiringItems.length})
                </h3>
                <div className="space-y-2">
                  {expiringItems.map((item) => (
                    <div key={item.id} className="border rounded-md p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.type}</p>
                          {item.certificationRequired && item.certificationExpiry && 
                            new Date(item.certificationExpiry) > new Date() && (
                            <div className="flex items-center mt-1">
                              <Badge variant="outline" className="mr-2 bg-amber-50">
                                Certification Expiring
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {getDaysUntil(item.certificationExpiry)} days remaining
                              </span>
                            </div>
                          )}
                          {item.nextInspection && 
                            new Date(item.nextInspection) > new Date() && (
                            <div className="flex items-center mt-1">
                              <Badge variant="outline" className="mr-2 bg-amber-50">
                                Inspection Due
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {getDaysUntil(item.nextInspection)} days remaining
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">Remind</Button>
                          <Button size="sm" variant="default">Schedule</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-3 border-t">
              <div className="text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 inline mr-1" />
                Last checked: {new Date().toLocaleString()}
              </div>
              <Button variant="link" size="sm">
                Export Report
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
