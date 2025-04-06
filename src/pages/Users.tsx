
import React from 'react';
import { Search, Plus, UserPlus, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer';
  status: 'active' | 'inactive';
  lastActive: string;
};

const usersData: User[] = [
  {
    id: 'USR-001',
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    role: 'admin',
    status: 'active',
    lastActive: '2023-04-05T10:30:00Z'
  },
  {
    id: 'USR-002',
    name: 'Samantha Davis',
    email: 'samantha.davis@example.com',
    role: 'manager',
    status: 'active',
    lastActive: '2023-04-05T09:15:00Z'
  },
  {
    id: 'USR-003',
    name: 'Michael Rodriguez',
    email: 'michael.rodriguez@example.com',
    role: 'operator',
    status: 'active',
    lastActive: '2023-04-04T16:45:00Z'
  },
  {
    id: 'USR-004',
    name: 'Emily Chen',
    email: 'emily.chen@example.com',
    role: 'manager',
    status: 'active',
    lastActive: '2023-04-05T11:20:00Z'
  },
  {
    id: 'USR-005',
    name: 'David Kim',
    email: 'david.kim@example.com',
    role: 'operator',
    status: 'inactive',
    lastActive: '2023-03-20T14:30:00Z'
  },
  {
    id: 'USR-006',
    name: 'Lisa Patel',
    email: 'lisa.patel@example.com',
    role: 'viewer',
    status: 'active',
    lastActive: '2023-04-05T08:45:00Z'
  }
];

const getRoleBadgeColor = (role: User['role']) => {
  switch (role) {
    case 'admin':
      return 'bg-inventory-blue-light text-inventory-blue border-inventory-blue';
    case 'manager':
      return 'bg-inventory-green-light text-inventory-green border-inventory-green';
    case 'operator':
      return 'bg-inventory-yellow-light text-inventory-yellow border-inventory-yellow';
    case 'viewer':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    default:
      return '';
  }
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
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

const Users = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-gray-500 mt-1">Manage users and permissions</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <UserPlus className="mr-2 h-4 w-4" />
            Invite User
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input 
          placeholder="Search users..." 
          className="pl-9 mb-6"
        />
      </div>
      
      <div className="border rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersData.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback className="bg-inventory-blue-light text-inventory-blue">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`${getRoleBadgeColor(user.role)} capitalize`}
                  >
                    {user.role === 'admin' && <Shield className="mr-1 h-3 w-3" />}
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full mr-2 ${
                      user.status === 'active' ? 'bg-inventory-green' : 'bg-gray-300'
                    }`} />
                    <span className="capitalize">{user.status}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {formatLastActive(user.lastActive)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Users;
