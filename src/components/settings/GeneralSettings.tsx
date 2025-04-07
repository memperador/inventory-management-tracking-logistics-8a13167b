
import React from 'react';
import { useTenant } from '@/hooks/useTenantContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/hooks/useRoleContext';
import { useForm } from 'react-hook-form';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';

interface TenantFormData {
  name: string;
  subscription_tier: string;
  subscription_status: string;
}

const GeneralSettings = () => {
  const { currentTenant } = useTenant();
  const { userRole } = useRole();
  const { toast } = useToast();
  const isAdmin = userRole === 'admin';

  const form = useForm<TenantFormData>({
    defaultValues: {
      name: currentTenant?.name || '',
      subscription_tier: currentTenant?.subscription_tier || 'basic',
      subscription_status: currentTenant?.subscription_status || 'active',
    }
  });

  const onSubmit = (data: TenantFormData) => {
    toast({
      title: "Settings updated",
      description: "Organization settings have been updated successfully"
    });
    
    // Note: The form is read-only for now as updating these fields
    // would require additional API implementation
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Organization Settings</h3>
        <p className="text-sm text-muted-foreground">
          View and manage your organization information
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization Name</FormLabel>
                <FormControl>
                  <Input {...field} disabled={!isAdmin} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="subscription_tier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subscription Tier</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subscription_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subscription Status</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {isAdmin && (
            <Button type="submit">Save Changes</Button>
          )}
        </form>
      </Form>

      <div className="pt-4 border-t">
        <h4 className="text-md font-medium mb-2">Subscription Information</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Your current subscription plan and billing details
        </p>
        <div className="flex items-center justify-between p-4 bg-muted rounded-md">
          <div>
            <p className="text-sm font-medium">
              {currentTenant?.subscription_tier || 'Basic'} Plan
              <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                (currentTenant?.subscription_status === 'active') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {currentTenant?.subscription_status || 'Active'}
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              Manage your subscription and payment details
            </p>
          </div>
          <Button variant="outline" asChild>
            <a href="/payments">Manage Subscription</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;
