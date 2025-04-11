
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuthContext';
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
import { Shield, RefreshCw } from 'lucide-react';
import LabratAdminButton from '@/components/admin/LabratAdminButton';

const Dashboard = () => {
  const { user } = useAuth();
  const { userRole, refreshRole } = useRole();
  const { checkEquipmentNotifications } = useNotificationContext();
  const [isFixing, setIsFixing] = React.useState(false);
  
  // Check for equipment notifications when the dashboard loads
  useEffect(() => {
    checkEquipmentNotifications(equipmentData);
  }, [checkEquipmentNotifications]);
  
  // Auto-trigger role fix on load if needed
  useEffect(() => {
    const autoFixRole = async () => {
      if (user?.email === 'labrat@iaware.com' && userRole !== 'admin') {
        console.log('Dashboard: Auto-triggering role fix for labrat user');
        // Wait a bit for other processes to complete
        setTimeout(async () => {
          await handleFixAdminRole(false);
        }, 1000);
      }
    };
    
    autoFixRole();
  }, [user, userRole]);
  
  // Function to manually fix the role
  const handleFixAdminRole = async (showToast = true) => {
    setIsFixing(true);
    try {
      if (user?.email !== 'labrat@iaware.com') {
        console.log('Not the labrat user, skipping admin role fix');
        return;
      }
      
      // Labrat's known ID
      const userId = '9e32e738-5f44-44f8-bc15-6946b27296a6';
      
      console.log('Dashboard: Fixing admin role for labrat user');
      
      // Update user role in DB
      const { error } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', userId);
        
      if (error) {
        console.error('Error updating database role:', error);
        throw error;
      }
      
      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { role: 'admin' }
      });
      
      if (metadataError) {
        console.error('Error updating auth metadata:', metadataError);
      }
      
      // Refresh session and role
      await supabase.auth.refreshSession();
      await refreshRole(false);
      
      if (showToast) {
        toast({
          title: 'Admin Role Applied',
          description: 'Your user role has been updated to Admin. The page will refresh shortly.',
        });
      }
      
      // Force reload after a short delay
      setTimeout(() => {
        sessionStorage.setItem('admin_role_fixed', 'true');
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Failed to fix admin role:', error);
      if (showToast) {
        toast({
          title: 'Error',
          description: 'Failed to set admin role. Please try again.',
          variant: 'destructive'
        });
      }
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
        <Alert className="border-red-300 bg-red-50">
          <Shield className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-800">Administrator Role Required</AlertTitle>
          <AlertDescription className="text-red-700">
            <div className="flex flex-col space-y-2">
              <p>Critical issue detected: Your account should have admin privileges but is currently set as <strong>{userRole || 'unknown'}</strong>.</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Button 
                  onClick={() => handleFixAdminRole(true)}
                  disabled={isFixing}
                  variant="destructive"
                  size="sm"
                >
                  {isFixing ? 'Updating...' : 'Fix Admin Access'}
                </Button>
                <Button 
                  onClick={() => refreshRole(true)}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Refresh Role
                </Button>
                <Button 
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                >
                  Reload Page
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Labrat Admin Button */}
      {user?.email === 'labrat@iaware.com' && (
        <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-4">
          <h3 className="font-bold text-red-800 mb-2">Labrat Emergency Admin Access</h3>
          <p className="text-red-700 mb-3">Current role: <strong>{userRole || 'unknown'}</strong></p>
          <LabratAdminButton />
        </div>
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
