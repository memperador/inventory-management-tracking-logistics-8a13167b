
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Buildings } from 'lucide-react';
import TenantsTable from '@/components/users/migration/TenantsTable';
import { Separator } from '@/components/ui/separator';
import LoadingIndicator from '@/components/common/LoadingIndicator';

const TenantsManagementPanel: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [tenants, setTenants] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Fetch tenants on component mount
  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      console.log(`Loaded ${data?.length || 0} tenants`);
      setTenants(data || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      toast({
        title: 'Error',
        description: `Failed to load tenants: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTenants = tenants.filter(tenant => 
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tenant.subscription_status && 
      tenant.subscription_status.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Card className="mt-6 border-green-200">
      <CardHeader className="bg-green-50">
        <div className="flex items-center gap-2">
          <Buildings className="h-5 w-5 text-green-600" />
          <CardTitle className="text-green-800">Tenant Management</CardTitle>
        </div>
        <CardDescription>View and manage all organization tenants</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tenants by name or ID..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={fetchTenants}>Refresh</Button>
        </div>
        
        <Separator />
        
        {isLoading ? (
          <LoadingIndicator message="Loading tenants..." />
        ) : (
          <TenantsTable tenants={filteredTenants} />
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-6">
        <p className="text-xs text-muted-foreground">
          Total tenants: {tenants.length}
        </p>
      </CardFooter>
    </Card>
  );
};

export default TenantsManagementPanel;
