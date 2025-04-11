
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useRole } from '@/hooks/useRoleContext';
import PageHeader from '@/components/common/PageHeader';
import RecentActivityList from '@/components/dashboard/RecentActivityList';
import EmailVerificationStatus from '@/components/auth/EmailVerificationStatus';
import StatisticsCards from '@/components/dashboard/StatisticsCards';
import AnalyticsSummary from '@/components/dashboard/AnalyticsSummary';
import ProjectProgressTable from '@/components/dashboard/ProjectProgressTable';
import { NotificationsWidget } from '@/components/dashboard/NotificationsWidget';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { equipmentData } from '@/components/equipment/EquipmentData';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { userRole, refreshRole } = useRole();
  const { checkEquipmentNotifications } = useNotificationContext();
  const [isFixing, setIsFixing] = React.useState(false);
  
  // Check for equipment notifications when the dashboard loads
  useEffect(() => {
    checkEquipmentNotifications(equipmentData);
  }, [checkEquipmentNotifications]);
  
  // Function to manually fix the role
  const handleFixAdminRole = async () => {
    setIsFixing(true);
    try {
      // Labrat's known ID
      const userId = '9e32e738-5f44-44f8-bc15-6946b27296a6';
      
      // Update user role in DB
      const { error } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', userId);
        
      if (error) throw error;
      
      // Update user metadata
      await supabase.auth.updateUser({
        data: { role: 'admin' }
      });
      
      // Refresh session and role
      await supabase.auth.refreshSession();
      await refreshRole();
      
      toast({
        title: 'Admin Role Applied',
        description: 'Your user role has been updated to Admin. Please reload the page.',
      });
      
      // Force reload after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Failed to fix admin role:', error);
      toast({
        title: 'Error',
        description: 'Failed to set admin role. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsFixing(false);
    }
  };
  
  // Only show the admin role fixer if email matches labrat
  const showAdminFixer = user?.email === 'labrat@iaware.com' && userRole !== 'admin';
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <PageHeader 
        title="Dashboard" 
        description="Welcome to your FleetTrack dashboard"
      />
      
      {/* Admin Role Alert */}
      {showAdminFixer && (
        <Alert className="border-amber-300 bg-amber-50">
          <Shield className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-800">Role Update Required</AlertTitle>
          <AlertDescription className="text-amber-700">
            <div className="flex flex-col space-y-2">
              <p>Your account should have admin privileges but is currently set as {userRole}.</p>
              <div className="flex items-center space-x-2 mt-2">
                <Button 
                  onClick={handleFixAdminRole}
                  disabled={isFixing}
                  variant="default"
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {isFixing ? 'Updating...' : 'Update to Admin Role'}
                </Button>
                <Button 
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                >
                  Refresh Page
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Email verification status */}
      <EmailVerificationStatus />
      
      {/* Statistics Cards */}
      <StatisticsCards />
      
      {/* Rest of dashboard content */}
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
