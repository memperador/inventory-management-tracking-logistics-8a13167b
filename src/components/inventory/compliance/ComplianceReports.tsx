import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Printer, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Equipment } from '@/components/equipment/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface ComplianceReportsProps {
  equipmentData: Equipment[];
}

export const ComplianceReports: React.FC<ComplianceReportsProps> = ({ equipmentData }) => {
  const [reportType, setReportType] = useState<string>('maintenance');
  
  const generateMaintenanceReport = () => {
    // Filter equipment with maintenance data
    const maintenanceItems = equipmentData.filter(item => 
      item.lastMaintenance || item.nextMaintenance
    );
    
    // Sort by next maintenance date
    const sortedItems = [...maintenanceItems].sort((a, b) => {
      if (!a.nextMaintenance) return 1;
      if (!b.nextMaintenance) return -1;
      return new Date(a.nextMaintenance).getTime() - new Date(b.nextMaintenance).getTime();
    });
    
    return sortedItems;
  };
  
  const generateCertificationReport = () => {
    // Filter equipment with certification data
    const certItems = equipmentData.filter(item => 
      item.certificationRequired === true
    );
    
    // Sort by certification expiry date
    const sortedItems = [...certItems].sort((a, b) => {
      if (!a.certificationExpiry) return 1;
      if (!b.certificationExpiry) return -1;
      return new Date(a.certificationExpiry).getTime() - new Date(b.certificationExpiry).getTime();
    });
    
    return sortedItems;
  };
  
  const generateComplianceStatusReport = () => {
    // Group equipment by compliance status
    const compliantItems = equipmentData.filter(item => 
      item.complianceStatus === 'Compliant'
    );
    
    const nonCompliantItems = equipmentData.filter(item => 
      item.complianceStatus === 'Non-Compliant'
    );
    
    const reviewRequiredItems = equipmentData.filter(item => 
      item.complianceStatus === 'Review Required'
    );
    
    const unclassifiedItems = equipmentData.filter(item => 
      !item.complianceStatus
    );
    
    return {
      compliant: compliantItems,
      nonCompliant: nonCompliantItems,
      reviewRequired: reviewRequiredItems,
      unclassified: unclassifiedItems
    };
  };
  
  const downloadReport = (type: string) => {
    let reportData;
    let filename = '';
    
    switch (type) {
      case 'maintenance':
        reportData = generateMaintenanceReport();
        filename = `maintenance-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
        break;
      case 'certification':
        reportData = generateCertificationReport();
        filename = `certification-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
        break;
      case 'compliance':
        reportData = generateComplianceStatusReport();
        filename = `compliance-status-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
        break;
      default:
        reportData = equipmentData;
        filename = `inventory-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    }
    
    // Create a downloadable JSON file
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', filename);
    linkElement.click();
  };
  
  const printReport = () => {
    window.print();
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Reports</CardTitle>
        <CardDescription>
          Generate and download compliance reports for your inventory
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="maintenance" onValueChange={setReportType}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="certification">Certification</TabsTrigger>
            <TabsTrigger value="compliance">Compliance Status</TabsTrigger>
          </TabsList>
          
          <TabsContent value="maintenance">
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">Maintenance Report</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This report lists all equipment with their maintenance history and upcoming maintenance dates.
              </p>
              
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-2">Equipment</th>
                    <th className="text-left p-2">Last Maintenance</th>
                    <th className="text-left p-2">Next Due</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {generateMaintenanceReport().slice(0, 5).map(item => (
                    <tr key={item.id} className="border-b">
                      <td className="p-2">{item.name}</td>
                      <td className="p-2">{item.lastMaintenance ? format(new Date(item.lastMaintenance), 'MMM d, yyyy') : 'N/A'}</td>
                      <td className="p-2">{item.nextMaintenance ? format(new Date(item.nextMaintenance), 'MMM d, yyyy') : 'N/A'}</td>
                      <td className="p-2">
                        {item.nextMaintenance && new Date(item.nextMaintenance) < new Date() 
                          ? <Badge variant="destructive">Overdue</Badge> 
                          : <Badge variant="outline">Scheduled</Badge>}
                      </td>
                    </tr>
                  ))}
                  {generateMaintenanceReport().length > 5 && (
                    <tr>
                      <td colSpan={4} className="p-2 text-center text-muted-foreground">
                        {generateMaintenanceReport().length - 5} more items...
                      </td>
                    </tr>
                  )}
                  {generateMaintenanceReport().length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-2 text-center text-muted-foreground">
                        No maintenance data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
          
          <TabsContent value="certification">
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">Certification Report</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This report lists all equipment requiring certifications and their expiration dates.
              </p>
              
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-2">Equipment</th>
                    <th className="text-left p-2">Certification Status</th>
                    <th className="text-left p-2">Expiry Date</th>
                  </tr>
                </thead>
                <tbody>
                  {generateCertificationReport().slice(0, 5).map(item => (
                    <tr key={item.id} className="border-b">
                      <td className="p-2">{item.name}</td>
                      <td className="p-2">
                        {!item.certificationExpiry ? 'Unknown' : 
                          new Date(item.certificationExpiry) < new Date() 
                            ? <Badge variant="destructive">Expired</Badge> 
                            : <Badge variant="success">Valid</Badge>}
                      </td>
                      <td className="p-2">{item.certificationExpiry 
                        ? format(new Date(item.certificationExpiry), 'MMM d, yyyy') 
                        : 'N/A'}
                      </td>
                    </tr>
                  ))}
                  {generateCertificationReport().length > 5 && (
                    <tr>
                      <td colSpan={3} className="p-2 text-center text-muted-foreground">
                        {generateCertificationReport().length - 5} more items...
                      </td>
                    </tr>
                  )}
                  {generateCertificationReport().length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-2 text-center text-muted-foreground">
                        No certification data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
          
          <TabsContent value="compliance">
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">Compliance Status Report</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This report summarizes the compliance status of all inventory items.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="border rounded p-3">
                  <div className="text-2xl font-medium">{generateComplianceStatusReport().compliant.length}</div>
                  <div className="text-sm text-muted-foreground">Compliant Items</div>
                </div>
                <div className="border rounded p-3">
                  <div className="text-2xl font-medium">{generateComplianceStatusReport().nonCompliant.length}</div>
                  <div className="text-sm text-muted-foreground">Non-Compliant Items</div>
                </div>
                <div className="border rounded p-3">
                  <div className="text-2xl font-medium">{generateComplianceStatusReport().reviewRequired.length}</div>
                  <div className="text-sm text-muted-foreground">Items Needing Review</div>
                </div>
                <div className="border rounded p-3">
                  <div className="text-2xl font-medium">{generateComplianceStatusReport().unclassified.length}</div>
                  <div className="text-sm text-muted-foreground">Unclassified Items</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={printReport}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={() => downloadReport(reportType)}>
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
