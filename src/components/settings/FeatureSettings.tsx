
import React from 'react';
import { useTenant } from '@/hooks/useTenantContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/hooks/useRoleContext';

const featureLabels: Record<string, {
  title: string;
  description: string;
  minRole?: string;
}> = {
  equipment: {
    title: 'Equipment Tracking',
    description: 'Track and manage your fleet equipment'
  },
  projects: {
    title: 'Project Management',
    description: 'Manage construction projects and related equipment'
  },
  gps: {
    title: 'GPS Integration',
    description: 'Real-time location tracking for your equipment',
    minRole: 'operator'
  },
  maintenance: {
    title: 'Maintenance Scheduling',
    description: 'Schedule and track equipment maintenance',
    minRole: 'operator'
  },
  analytics: {
    title: 'Advanced Analytics',
    description: 'Get insights on equipment usage and project progress',
    minRole: 'manager'
  }
};

const FeatureSettings = () => {
  const { currentTenant, updateTenantSettings } = useTenant();
  const { userRole } = useRole();
  const { toast } = useToast();
  
  const enabledFeatures = currentTenant?.settings?.features || [];

  const toggleFeature = (featureName: string, enabled: boolean) => {
    if (!currentTenant) return;
    
    let updatedFeatures: string[] = [...enabledFeatures];
    
    if (enabled) {
      updatedFeatures.push(featureName);
    } else {
      updatedFeatures = updatedFeatures.filter(f => f !== featureName);
    }

    updateTenantSettings({
      features: updatedFeatures
    });
    
    toast({
      title: enabled ? "Feature enabled" : "Feature disabled",
      description: `${featureLabels[featureName]?.title} has been ${enabled ? 'enabled' : 'disabled'}`
    });
  };

  // Check if user has access to manage this feature based on their role
  const hasAccess = (minRole?: string) => {
    if (!minRole) return true;
    
    const roles = ['viewer', 'operator', 'manager', 'admin'];
    const userRoleIndex = roles.indexOf(userRole || 'viewer');
    const requiredRoleIndex = roles.indexOf(minRole);
    
    return userRoleIndex >= requiredRoleIndex;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Feature Settings</h3>
        <p className="text-sm text-muted-foreground">
          Enable or disable features based on your business needs
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(featureLabels).map(([key, { title, description, minRole }]) => {
          const isEnabled = enabledFeatures.includes(key);
          const canAccess = hasAccess(minRole);
          
          return (
            <div key={key} className={`flex items-center justify-between p-4 border rounded-md ${!canAccess ? 'opacity-60' : ''}`}>
              <div>
                <Label htmlFor={`feature-${key}`} className="font-medium">{title}</Label>
                <p className="text-sm text-muted-foreground">{description}</p>
                {!canAccess && (
                  <p className="text-xs text-amber-600 mt-1">
                    Requires {minRole} access or higher
                  </p>
                )}
              </div>
              <Switch
                id={`feature-${key}`}
                checked={isEnabled}
                onCheckedChange={(checked) => toggleFeature(key, checked)}
                disabled={!canAccess}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeatureSettings;
