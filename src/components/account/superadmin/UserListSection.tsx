
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users } from 'lucide-react';
import { TenantMigrationUser } from './types';

interface UserListSectionProps {
  users: TenantMigrationUser[];
  loadAllUsers: () => Promise<void>;
  isLoadingUsers: boolean;
}

const UserListSection: React.FC<UserListSectionProps> = ({
  users,
  loadAllUsers,
  isLoadingUsers
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">All Users Across Tenants</h3>
        <Button onClick={loadAllUsers} variant="outline" disabled={isLoadingUsers}>
          <Users className="mr-2 h-4 w-4" />
          {isLoadingUsers ? 'Loading...' : 'Load All Users'}
        </Button>
      </div>
      
      {users.length > 0 ? (
        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.id.substring(0, 8)}...</div>
                  </TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <div className="font-medium">{user.tenantName}</div>
                    <div className="text-sm text-muted-foreground">{user.tenant_id.substring(0, 8)}...</div>
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 border rounded-md bg-muted/10">
          <Users className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Click "Load All Users" to view users across all tenants</p>
        </div>
      )}
    </div>
  );
};

export default UserListSection;
