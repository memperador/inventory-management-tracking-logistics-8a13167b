
import React, { useState } from 'react';
import { Plus, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { UserRole } from '@/types/roles';
import Permission from '@/components/auth/Permission';
import PageHeader from '@/components/common/PageHeader';
import SearchBar from '@/components/users/SearchBar';
import UserList from '@/components/users/UserList';
import LoadingIndicator from '@/components/common/LoadingIndicator';
import { fetchUsers, fetchProfiles } from '@/services/userService';
import { User } from '@/types/user';

const Users = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch users using React Query
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
  });
  
  // Separately fetch profiles to get names
  useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const updatedUsers = await fetchProfiles(users);
      return updatedUsers;
    },
    enabled: users.length > 0
  });
  
  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Page header actions
  const headerActions = (
    <Permission allowedRoles={['admin']}>
      <Button variant="outline">
        <UserPlus className="mr-2 h-4 w-4" />
        Invite User
      </Button>
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        Add User
      </Button>
    </Permission>
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Users"
        description="Manage users and permissions"
        actions={headerActions}
      />
      
      <SearchBar 
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search users..."
      />
      
      {isLoading ? (
        <LoadingIndicator message="Loading users..." />
      ) : (
        <UserList users={filteredUsers} />
      )}
    </div>
  );
};

export default Users;
