
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import RoleDisplay from '@/components/users/RoleDisplay';
import { User } from '@/types/user';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface UserListProps {
  users: User[];
}

const UserList: React.FC<UserListProps> = ({ users }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase() || '?';
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffDays} days ago`;
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Tenant</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Active</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id} className={user.email === 'No email available' ? 'bg-amber-50' : ''}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback className={`${user.email === 'No email available' ? 'bg-amber-100 text-amber-600' : 'bg-inventory-blue-light text-inventory-blue'}`}>
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="flex items-center text-sm">
                        {user.email === 'No email available' ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="flex items-center text-amber-600">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  <span className="italic">Missing email address</span>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>This user has no associated email address</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span className="text-gray-500">{user.email}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <RoleDisplay userId={user.id} initialRole={user.role} />
                </TableCell>
                <TableCell>
                  {user.tenantId ? (
                    <Badge variant="outline" className="font-normal">
                      {user.tenantName || user.tenantId.substring(0, 8)}
                    </Badge>
                  ) : (
                    <span className="text-gray-400">No tenant</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full mr-2 ${
                      user.email === 'No email available' ? 'bg-amber-500' : 
                      user.status === 'active' ? 'bg-inventory-green' : 'bg-gray-300'
                    }`} />
                    <span className="capitalize">{user.email === 'No email available' ? 'incomplete' : user.status}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {formatLastActive(user.lastActive)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserList;
