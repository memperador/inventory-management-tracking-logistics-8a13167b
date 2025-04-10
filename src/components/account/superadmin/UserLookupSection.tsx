
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Search, User } from 'lucide-react';
import { useTenantManagement } from '@/hooks/subscription/useTenantManagement';
import { UserLookupResult } from './types';

interface UserLookupSectionProps {
  userEmail: string;
  setUserEmail: (email: string) => void;
  lookupResult: UserLookupResult | null;
}

const UserLookupSection: React.FC<UserLookupSectionProps> = ({ 
  userEmail, 
  setUserEmail,
  lookupResult
}) => {
  const { lookupUserByEmail, isLoading } = useTenantManagement();

  const handleUserLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userEmail.trim()) {
      await lookupUserByEmail(userEmail.trim());
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium">User Lookup</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Find a user by email to perform operations on their account
      </p>
      
      <form onSubmit={handleUserLookup} className="flex flex-col gap-4">
        <div>
          <div className="flex gap-2">
            <Input
              placeholder="Enter user email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              disabled={isLoading}
              className="flex-1"
              required
            />
            <Button 
              type="submit" 
              disabled={isLoading || !userEmail.trim()}
              variant="secondary"
            >
              <Search className="mr-2 h-4 w-4" />
              Find User
            </Button>
          </div>
        </div>
      </form>
      
      {lookupResult && (
        <Alert className="mt-4">
          <div className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            <AlertTitle>User Selected</AlertTitle>
          </div>
          <AlertDescription>
            Email: {lookupResult.email} <br />
            User ID: {lookupResult.userId.substring(0, 8)}...
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default UserLookupSection;
