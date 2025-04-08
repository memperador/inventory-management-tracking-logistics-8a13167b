
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Check, Webhook } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TestStatus, WebhookConfigValues } from '../types';
import { webhookConfigSchema } from '@/components/rfi/utils/formSchemas';

interface WebhookTabProps {
  webhooks: WebhookConfigValues[];
  testingWebhook: string | null;
  testStatus: TestStatus;
  onAddWebhook: (webhook: WebhookConfigValues) => void;
  onToggleWebhookStatus: (index: number) => void;
  onDeleteWebhook: (index: number) => void;
  onTestWebhook: (url: string) => void;
}

export const WebhookTab: React.FC<WebhookTabProps> = ({
  webhooks,
  testingWebhook,
  testStatus,
  onAddWebhook,
  onToggleWebhookStatus,
  onDeleteWebhook,
  onTestWebhook
}) => {
  const webhookForm = useForm<WebhookConfigValues>({
    resolver: zodResolver(webhookConfigSchema),
    defaultValues: {
      webhookUrl: '',
      eventType: 'inventory_update',
      isActive: true,
      secretKey: '',
      description: '',
    },
  });

  const handleWebhookSubmit = (values: WebhookConfigValues) => {
    onAddWebhook(values);
    webhookForm.reset();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Configure New Webhook</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Set up webhooks to receive notifications from vendor systems
        </p>
        
        <Form {...webhookForm}>
          <form onSubmit={webhookForm.handleSubmit(handleWebhookSubmit)} className="space-y-4">
            <FormField
              control={webhookForm.control}
              name="webhookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://your-app.com/api/webhooks/vendor" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    The URL that will receive webhook events
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={webhookForm.control}
              name="eventType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an event type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="inventory_update">Inventory Update</SelectItem>
                      <SelectItem value="order_created">Order Created</SelectItem>
                      <SelectItem value="order_shipped">Order Shipped</SelectItem>
                      <SelectItem value="order_delivered">Order Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the event type to trigger this webhook
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={webhookForm.control}
              name="secretKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secret Key (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="password"
                      placeholder="Webhook secret for signature verification" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Used to verify webhook authenticity
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={webhookForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add a description for this webhook" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={webhookForm.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Receive notifications when events are triggered
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full">Create Webhook</Button>
          </form>
        </Form>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium mb-2">Configured Webhooks</h3>
        
        {webhooks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Webhook className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p>No webhooks configured yet</p>
            <p className="text-sm">Create a webhook above to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {webhooks.map((webhook, index) => (
              <div key={index} className="border rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Webhook className="h-5 w-5 mr-2" />
                    <span className="font-medium">{webhook.description || webhook.webhookUrl}</span>
                  </div>
                  <div className="flex items-center">
                    {webhook.isActive ? (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full mr-2">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full mr-2">
                        Inactive
                      </span>
                    )}
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {webhook.eventType.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground truncate mb-3">{webhook.webhookUrl}</p>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onToggleWebhookStatus(index)}
                  >
                    {webhook.isActive ? 'Disable' : 'Enable'}
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => onTestWebhook(webhook.webhookUrl)}
                    disabled={testingWebhook === webhook.webhookUrl}
                  >
                    {testingWebhook === webhook.webhookUrl ? (
                      testStatus === 'testing' ? 'Testing...' : 
                      testStatus === 'success' ? 'Success!' : 
                      testStatus === 'error' ? 'Failed!' : 'Test'
                    ) : 'Test'}
                    {testingWebhook === webhook.webhookUrl && testStatus === 'success' && (
                      <Check className="ml-1 h-4 w-4 text-green-500" />
                    )}
                    {testingWebhook === webhook.webhookUrl && testStatus === 'error' && (
                      <AlertCircle className="ml-1 h-4 w-4 text-red-500" />
                    )}
                  </Button>
                  <Button 
                    size="sm"
                    variant="destructive"
                    onClick={() => onDeleteWebhook(index)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Webhook URLs must be publicly accessible. For testing, you can use tools like ngrok or webhook.site.
        </AlertDescription>
      </Alert>
    </div>
  );
};
