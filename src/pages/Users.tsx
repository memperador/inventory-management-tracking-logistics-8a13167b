
import React, { useState } from 'react';
import { Search, Plus, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/contexts/RoleContext';
import RoleDisplay from '@/components/users/RoleDisplay';
import Permission from '@/components/auth/Permission';

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  lastActive: string;
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

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
};

const Users = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch users using React Query
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // Join users table with profiles to get names
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          role,
          created_at,
          profiles:profiles(first_name, last_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data
      return data.map(user => ({
        id: user.id,
        name: `${user.profiles?.first_name || ''} ${user.profiles?.last_name || ''}`.trim() || 'Unknown User',
        email: 'user@example.com', // Placeholder - you could fetch this from auth if needed
        role: user.role,
        status: 'active', // Placeholder - could be determined based on last login
        lastActive: user.created_at // Placeholder - using creation date as last active
      }));
    }
  });
  
  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-gray-500 mt-1">Manage users and permissions</p>
        </div>
        <Permission allowedRoles={['admin']}>
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
        </Permission>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input 
          placeholder="Search users..." 
          className="pl-9 mb-6"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="border rounded-lg overflow-hidden bg-white">
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-inventory-blue border-t-transparent mb-2"></div>
            <p className="text-sm text-gray-500">Loading users...</p>
          </div>
        ) : (
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
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
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
                      <RoleDisplay userId={user.id} initialRole={user.role} />
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
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default Users;
