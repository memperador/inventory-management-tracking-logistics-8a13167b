
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  NotificationChannel, 
  NotificationPreference,
  useNotificationPreferences, 
  NOTIFICATION_CATEGORIES
} from '@/hooks/useNotificationPreferences';
import { getNotificationIcon } from '@/components/notifications/notificationUtils';

const NotificationChannelLabel: Record<NotificationChannel, string> = {
  'in-app': 'In-App',
  'email': 'Email',
  'sms': 'SMS'
};

const NotificationPreferences: React.FC = () => {
  const { 
    preferences, 
    toggleNotificationType, 
    toggleChannel,
    toggleCategoryEnabled,
    isCategoryEnabled,
    isCategoryPartiallyEnabled,
    categories 
  } = useNotificationPreferences();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose which notifications you want to receive and how you want to receive them.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {categories.map((category) => (
          <div key={category.id} className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Switch
                checked={isCategoryEnabled(category.id)}
                onCheckedChange={(checked) => toggleCategoryEnabled(category.id, checked)}
                aria-label={`Enable ${category.name} notifications`}
                data-state={isCategoryPartiallyEnabled(category.id) ? "indeterminate" : undefined}
              />
              <Label className="text-lg font-semibold">{category.name} Notifications</Label>
              {isCategoryPartiallyEnabled(category.id) && (
                <Badge variant="outline">Partially Enabled</Badge>
              )}
            </div>
            
            <div className="space-y-3 ml-10">
              {category.types.map((type) => {
                const pref = preferences.find(p => p.type === type) || {
                  type,
                  enabled: false,
                  channels: ['in-app']
                };
                
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={pref.enabled}
                        onCheckedChange={() => toggleNotificationType(type)}
                        id={`check-${type}`}
                      />
                      <Label htmlFor={`check-${type}`} className="flex items-center gap-2">
                        <span className="text-muted-foreground">{getNotificationIcon(type)}</span>
                        {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Label>
                    </div>
                    
                    {pref.enabled && (
                      <div className="flex items-center gap-4 ml-6 text-sm">
                        <span className="text-muted-foreground min-w-24">Notify via:</span>
                        <div className="flex gap-4">
                          {(Object.keys(NotificationChannelLabel) as NotificationChannel[]).map((channel) => (
                            <div key={channel} className="flex items-center space-x-2">
                              <Checkbox
                                checked={pref.channels.includes(channel)}
                                onCheckedChange={() => toggleChannel(type, channel)}
                                id={`${type}-${channel}`}
                                disabled={channel === 'in-app'} // In-app always enabled
                              />
                              <Label htmlFor={`${type}-${channel}`}>
                                {NotificationChannelLabel[channel]}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {categories.indexOf(category) < categories.length - 1 && (
              <Separator className="my-4" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences;
