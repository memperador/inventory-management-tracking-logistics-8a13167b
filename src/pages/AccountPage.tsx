
import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import AccountForm from '@/components/account/AccountForm';
import { Card, CardContent } from '@/components/ui/card';

const AccountPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Account Settings" 
        description="View and update your profile information"
      />
      
      <div className="mt-6">
        <Card>
          <CardContent className="pt-6">
            <AccountForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountPage;
