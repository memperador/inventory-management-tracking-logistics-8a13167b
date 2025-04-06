
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/common/PageHeader';
import EquipmentStatusChart from '@/components/dashboard/EquipmentStatusChart';
import RecentActivityList from '@/components/dashboard/RecentActivityList';
import EmailVerificationStatus from '@/components/auth/EmailVerificationStatus';

const Dashboard = () => {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <PageHeader 
        title="Dashboard" 
        description="Welcome to your FleetTrack dashboard"
      />
      
      {/* Email verification status */}
      <EmailVerificationStatus />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Equipment Status</h2>
          <EquipmentStatusChart />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <RecentActivityList />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
