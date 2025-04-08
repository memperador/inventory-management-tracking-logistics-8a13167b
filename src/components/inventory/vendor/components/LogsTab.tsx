
import React from 'react';
import { Button } from '@/components/ui/button';

export const LogsTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">
        Review recent activity and integration logs
      </p>
      
      <div className="border rounded-md overflow-hidden">
        <div className="bg-muted px-4 py-2 font-medium">Integration Logs</div>
        <div className="divide-y">
          <div className="px-4 py-2 hover:bg-muted/50">
            <div className="flex items-center justify-between">
              <span className="font-medium">Webhook Test</span>
              <span className="text-xs text-muted-foreground">2 minutes ago</span>
            </div>
            <p className="text-sm text-muted-foreground">Test webhook sent to endpoint</p>
          </div>
          <div className="px-4 py-2 hover:bg-muted/50">
            <div className="flex items-center justify-between">
              <span className="font-medium">Connection Attempt</span>
              <span className="text-xs text-muted-foreground">15 minutes ago</span>
            </div>
            <p className="text-sm text-muted-foreground">API connection attempt to vendor system</p>
          </div>
          <div className="px-4 py-2 hover:bg-muted/50">
            <div className="flex items-center justify-between">
              <span className="font-medium">Webhook Created</span>
              <span className="text-xs text-muted-foreground">1 hour ago</span>
            </div>
            <p className="text-sm text-muted-foreground">New webhook endpoint configured</p>
          </div>
        </div>
      </div>
      
      <Button variant="outline" className="w-full">
        Export Logs
      </Button>
    </div>
  );
};
