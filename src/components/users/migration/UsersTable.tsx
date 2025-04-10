
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check } from 'lucide-react';

interface UsersTableProps {
  users: any[];
  currentUserId?: string;
}

const UsersTable: React.FC<UsersTableProps> = ({ users, currentUserId }) => {
  if (users.length === 0) return null;
  
  return (
    <div>
      <h4 className="font-medium mb-2">All Users ({users.length})</h4>
      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Tenant ID</TableHead>
              <TableHead className="w-[100px]">Current User</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id} className={currentUserId === user.id ? 'bg-blue-50' : ''}>
                <TableCell className="font-medium">{user.id}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell className="font-mono text-xs">{user.tenant_id}</TableCell>
                <TableCell>
                  {currentUserId === user.id && (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UsersTable;
