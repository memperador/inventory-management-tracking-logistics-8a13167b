
import React, { useState } from 'react';
import { Plus, UserPlus, RefreshCw, AlertCircle } from 'lucide-react';
import { UsersIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import Permission from '@/components/auth/Permission';
import PageHeader from '@/components/common/PageHeader';
import SearchBar from '@/components/users/SearchBar';
import UserList from '@/components/users/UserList';
import LoadingIndicator from '@/components/common/LoadingIndicator';
import { fetchUsers, fetchProfiles } from '@/services/userService';
import { Input } from '@/components/ui/input';
import MigrationStatus from '@/components/users/MigrationStatus';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

const UsersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [migrationEmail, setMigrationEmail] = useState('');
  const [emailToCheck, setEmailToCheck] = useState('');
  
  // Fetch users using React Query
  const { data: users = [], isLoading, refetch, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
  });
  
  // Separately fetch profiles to get names
  const { isLoading: isLoadingProfiles } = useQuery({
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

  // Check if we have users with missing emails
  const hasUsersWithoutEmails = users.some(user => user.email === 'No email available');

  const handleMigrationCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailToCheck(migrationEmail);
  };

  // Page header actions
  const headerActions = (
    <>
      <Button variant="outline" onClick={() => refetch()}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Refresh
      </Button>
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
    </>
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Users Management"
        description="Manage users, roles and permissions"
        actions={headerActions}
      />
      
      {hasUsersWithoutEmails && (
        <Alert variant="warning" className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Some users are missing email addresses. This may affect functionality. 
            Please update user information to include valid email addresses.
          </AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading users: {error instanceof Error ? error.message : 'Unknown error'}
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">
            <UsersIcon className="h-4 w-4 mr-2" />
            User List
          </TabsTrigger>
          <TabsTrigger value="migration">
            <RefreshCw className="h-4 w-4 mr-2" />
            Migration Status
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4">
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search users..."
          />
          
          {isLoading || isLoadingProfiles ? (
            <LoadingIndicator message="Loading users..." />
          ) : (
            <UserList users={filteredUsers} />
          )}
        </TabsContent>
        
        <TabsContent value="migration" className="space-y-4">
          <div className="border rounded-lg overflow-hidden bg-white p-4">
            <h3 className="font-medium mb-2">Check Migration Status</h3>
            <form onSubmit={handleMigrationCheck} className="flex gap-2 mb-4">
              <Input 
                placeholder="Enter email to check..."
                value={migrationEmail}
                onChange={(e) => setMigrationEmail(e.target.value)}
              />
              <Button type="submit">Check</Button>
            </form>
            
            <MigrationStatus email={emailToCheck} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UsersPage;
