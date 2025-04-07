
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/common/PageHeader';
import RecentActivityList from '@/components/dashboard/RecentActivityList';
import EmailVerificationStatus from '@/components/auth/EmailVerificationStatus';
import StatisticsCards from '@/components/dashboard/StatisticsCards';
import AnalyticsSummary from '@/components/dashboard/AnalyticsSummary';
import ProjectProgressTable from '@/components/dashboard/ProjectProgressTable';

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
      
      {/* Statistics Cards */}
      <StatisticsCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <AnalyticsSummary />
        
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <RecentActivityList />
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <ProjectProgressTable />
      </div>
    </div>
  );
};

export default Dashboard;
