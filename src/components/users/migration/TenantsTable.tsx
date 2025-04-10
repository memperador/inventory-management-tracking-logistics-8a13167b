
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface TenantsTableProps {
  tenants: any[];
}

const TenantsTable: React.FC<TenantsTableProps> = ({ tenants }) => {
  if (tenants.length === 0) return null;
  
  return (
    <div>
      <h4 className="font-medium mb-2">All Tenants ({tenants.length})</h4>
      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Trial End</TableHead>
              <TableHead>Onboarding</TableHead>
              <TableHead className="w-[100px]">ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map(tenant => (
              <TableRow key={tenant.id}>
                <TableCell className="font-medium">{tenant.name}</TableCell>
                <TableCell>{tenant.subscription_tier}</TableCell>
                <TableCell>
                  <Badge variant={tenant.subscription_status === 'active' ? 'default' : 
                          tenant.subscription_status === 'trialing' ? 'outline' : 'secondary'}>
                    {tenant.subscription_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {tenant.trial_ends_at ? new Date(tenant.trial_ends_at).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>
                  {tenant.onboarding_completed ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-800">Pending</Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{tenant.id}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TenantsTable;
