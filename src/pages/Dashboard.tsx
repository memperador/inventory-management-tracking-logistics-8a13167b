
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import PageHeader from '@/components/common/PageHeader';
import RecentActivityList from '@/components/dashboard/RecentActivityList';
import EmailVerificationStatus from '@/components/auth/EmailVerificationStatus';
import StatisticsCards from '@/components/dashboard/StatisticsCards';
import AnalyticsSummary from '@/components/dashboard/AnalyticsSummary';
import ProjectProgressTable from '@/components/dashboard/ProjectProgressTable';
import { NotificationsWidget } from '@/components/dashboard/NotificationsWidget';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { equipmentData } from '@/components/equipment/EquipmentData';

const Dashboard = () => {
  const { user } = useAuth();
  const { checkEquipmentNotifications } = useNotificationContext();
  
  // Check for equipment notifications when the dashboard loads
  useEffect(() => {
    checkEquipmentNotifications(equipmentData);
  }, [checkEquipmentNotifications]);
  
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
        <div className="lg:col-span-3">
          <AnalyticsSummary />
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <NotificationsWidget />
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
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
