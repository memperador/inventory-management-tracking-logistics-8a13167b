
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/hooks/useTenantContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Building, User } from 'lucide-react';
import { EquipmentIcon, ProjectIcon } from '@/components/icons/CustomIcons';

const Index = () => {
  const { user, loading } = useAuth();
  const { currentTenant, isLoading: tenantLoading } = useTenant();

  if (loading || tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto mb-4 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Welcome to FleetTrack</CardTitle>
            <CardDescription className="text-center">
              Track and manage your fleet with ease
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <p className="text-center text-gray-600">
              Please sign in to access the application
            </p>
            <Link to="/auth">
              <Button size="lg">
                Sign In / Register
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <Card className="bg-white shadow-sm border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Building className="h-5 w-5" />
              {currentTenant?.name || 'Your Organization'}
            </CardTitle>
            <CardDescription className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {user.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {currentTenant ? (
                <>
                  <p>
                    <span className="font-medium">Organization ID:</span> {currentTenant.id}
                  </p>
                  <p>
                    <span className="font-medium">Subscription:</span> {currentTenant.subscription_tier || 'Basic'} - {currentTenant.subscription_status || 'Active'}
                  </p>
                </>
              ) : (
                <p className="text-amber-600">
                  No organization data found. Please contact an administrator.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <EquipmentIcon className="h-5 w-5" />
              Equipment Tracking
            </CardTitle>
            <CardDescription>
              Track and manage all your equipment in one place
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Monitor equipment status, location, and maintenance schedules. Assign equipment to projects and track their usage.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/equipment" className="w-full">
              <Button className="w-full">View Equipment</Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ProjectIcon className="h-5 w-5" />
              Project Management
            </CardTitle>
            <CardDescription>
              Monitor your projects and their resource allocation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Create and manage projects, assign equipment, track progress, and generate reports for better decision-making.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/projects" className="w-full">
              <Button className="w-full">View Projects</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Index;
