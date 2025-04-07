
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const ComplianceDocumentation: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Management</CardTitle>
        <CardDescription>
          Track and manage compliance requirements for equipment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Compliance Alerts System</h3>
          <p>
            The compliance alerts system tracks maintenance schedules, certification expirations, 
            and inspection requirements to ensure equipment remains compliant with regulations.
          </p>
          
          <h4 className="font-medium mt-3">Alert Types</h4>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Maintenance Alerts</strong> - For overdue or upcoming maintenance</li>
            <li><strong>Certification Alerts</strong> - For expired or expiring certifications</li>
            <li><strong>Inspection Alerts</strong> - For overdue or upcoming inspections</li>
          </ul>
          
          <h4 className="font-medium mt-3">Alert Management Flow</h4>
          <ol className="list-decimal pl-6 space-y-1">
            <li>Alerts are automatically generated based on equipment data</li>
            <li>Initial alerts have an "Open" status</li>
            <li>Users can "Acknowledge" alerts to indicate they're being addressed</li>
            <li>Users can "Resolve" alerts when the issue has been handled</li>
            <li>Maintenance alerts are automatically resolved when maintenance is completed</li>
          </ol>
          
          <h4 className="font-medium mt-3">Data Persistence</h4>
          <p>
            Alert status and history are stored in localStorage to maintain state between sessions.
            When equipment data changes, the system automatically updates related alerts.
          </p>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold">Maintenance Tracker</h3>
          <p>
            The maintenance tracker monitors changes to equipment maintenance dates and automatically
            records maintenance history.
          </p>
          
          <h4 className="font-medium mt-3">Features</h4>
          <ul className="list-disc pl-6 space-y-1">
            <li>Tracks both scheduled and completed maintenance</li>
            <li>Maintains a history of maintenance updates</li>
            <li>Automatically resolves maintenance-related compliance alerts</li>
            <li>Data persists between sessions using localStorage</li>
          </ul>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold">Compliance Reports</h3>
          <p>
            Generate reports on different aspects of compliance across your equipment inventory.
          </p>
          
          <h4 className="font-medium mt-3">Report Types</h4>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Maintenance Reports</strong> - Details on maintenance history and upcoming needs</li>
            <li><strong>Certification Reports</strong> - Information on certification status and expiration</li>
            <li><strong>Compliance Status Reports</strong> - Overall compliance statistics and summaries</li>
          </ul>
          
          <h4 className="font-medium mt-3">Export Options</h4>
          <ul className="list-disc pl-6 space-y-1">
            <li>Download as JSON file</li>
            <li>Print reports directly</li>
          </ul>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold">Compliance Status Dashboard</h3>
          <p>
            Visual dashboard showing overall compliance status across equipment inventory.
          </p>
          
          <h4 className="font-medium mt-3">Dashboard Components</h4>
          <ul className="list-disc pl-6 space-y-1">
            <li>Overall compliance score</li>
            <li>Industry code compliance metrics</li>
            <li>Maintenance compliance status</li>
            <li>Certification status</li>
            <li>Lists of equipment needing attention</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceDocumentation;
