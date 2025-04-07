
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const ComplianceSection: React.FC = () => {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Industry Compliance</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Code Compliance</CardTitle>
            <CardDescription>Industry standards and regulatory requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Track equipment compliance with NEC, CSI, and other industry code requirements.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Records</CardTitle>
            <CardDescription>OSHA and manufacturer requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Track maintenance schedules and history for audit and safety compliance.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Certifications</CardTitle>
            <CardDescription>Required equipment certification</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Manage equipment certification requirements and renewal dates.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
