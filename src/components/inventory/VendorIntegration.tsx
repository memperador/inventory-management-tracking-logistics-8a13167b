
import React, { useState, useEffect } from 'react';
import { Package, Truck, ShoppingCart, Database, Webhook, Check, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { webhookConfigSchema, WebhookConfigValues } from '@/components/rfi/utils/formSchemas';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const VendorIntegration = () => {
  const [activeTab, setActiveTab] = useState('connect');
  const [apiKey, setApiKey] = useState('');
  const [vendorUrl, setVendorUrl] = useState('');
  const [webhooks, setWebhooks] = useState<WebhookConfigValues[]>([]);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const { toast } = useToast();

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

  // Load saved webhooks from localStorage on component mount
  useEffect(() => {
    const savedWebhooks = localStorage.getItem('vendorWebhooks');
    if (savedWebhooks) {
      try {
        setWebhooks(JSON.parse(savedWebhooks));
      } catch (error) {
        console.error('Error parsing saved webhooks', error);
      }
    }
  }, []);

  // Save webhooks to localStorage when they change
  useEffect(() => {
    if (webhooks.length > 0) {
      localStorage.setItem('vendorWebhooks', JSON.stringify(webhooks));
    }
  }, [webhooks]);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vendorUrl || !apiKey) {
      toast({
        title: "Validation Error",
        description: "Please provide both API URL and API Key",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Connecting to vendor system:", { apiKey, vendorUrl });
    
    toast({
      title: "Vendor Connection",
      description: "Connection request sent. Check credentials and try again if no confirmation is received.",
    });
  };

  const handleWebhookSubmit = (values: WebhookConfigValues) => {
    console.log("Setting up webhook:", values);
    
    // Add the new webhook to the list
    setWebhooks(prev => [...prev, { ...values, isActive: true }]);
    
    toast({
      title: "Webhook Created",
      description: "Webhook URL has been registered for vendor notifications.",
    });
    
    webhookForm.reset();
  };

  const toggleWebhookStatus = (index: number) => {
    setWebhooks(prev => 
      prev.map((webhook, i) => 
        i === index ? { ...webhook, isActive: !webhook.isActive } : webhook
      )
    );
    
    const webhook = webhooks[index];
    toast({
      title: webhook.isActive ? "Webhook Disabled" : "Webhook Enabled",
      description: `${webhook.description || webhook.webhookUrl} has been ${webhook.isActive ? 'disabled' : 'enabled'}.`,
    });
  };

  const deleteWebhook = (index: number) => {
    setWebhooks(prev => prev.filter((_, i) => i !== index));
    
    toast({
      title: "Webhook Deleted",
      description: "The webhook has been removed from your configuration.",
    });
  };

  const testWebhook = async (webhookUrl: string) => {
    setTestingWebhook(webhookUrl);
    setTestStatus('testing');
    
    try {
      // In a real app, this would send a test payload to the webhook URL
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success
      setTestStatus('success');
      toast({
        title: "Test Successful",
        description: "The webhook responded successfully to the test payload.",
      });
    } catch (error) {
      setTestStatus('error');
      toast({
        title: "Test Failed",
        description: "The webhook did not respond or returned an error.",
        variant: "destructive",
      });
    } finally {
      // Reset the status after a delay
      setTimeout(() => {
        setTestingWebhook(null);
        setTestStatus('idle');
      }, 3000);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Vendor Integration
        </CardTitle>
        <CardDescription>
          Connect to your vendor purchasing systems to streamline inventory management
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="connect" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="connect">Connect</TabsTrigger>
            <TabsTrigger value="webhook">Webhooks</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connect" className="pt-4">
            <form onSubmit={handleConnect} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="vendor-url" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Vendor API URL
                </label>
                <Input 
                  id="vendor-url"
                  placeholder="https://api.vendor.com" 
                  value={vendorUrl} 
                  onChange={e => setVendorUrl(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="api-key" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  API Key
                </label>
                <Input 
                  id="api-key" 
                  type="password" 
                  placeholder="Your vendor API key" 
                  value={apiKey} 
                  onChange={e => setApiKey(e.target.value)} 
                />
              </div>
              
              <Button type="submit" className="w-full">Connect to Vendor System</Button>
            </form>
            
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Supported Vendor Integrations</h3>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Home Depot Pro
                </Button>
                <Button variant="outline" className="justify-start">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Grainger
                </Button>
                <Button variant="outline" className="justify-start">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Ferguson
                </Button>
                <Button variant="outline" className="justify-start">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Fastenal
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="webhook" className="pt-4">
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
                            onClick={() => toggleWebhookStatus(index)}
                          >
                            {webhook.isActive ? 'Disable' : 'Enable'}
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => testWebhook(webhook.webhookUrl)}
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
                            onClick={() => deleteWebhook(index)}
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
          </TabsContent>
          
          <TabsContent value="vendors" className="pt-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Connect with your preferred vendors to view catalogs, check pricing, and place orders directly from the inventory system.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center">
                    <Package className="mr-2 h-4 w-4" />
                    <span>Home Depot Pro</span>
                  </div>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Not Connected</span>
                </div>
                
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center">
                    <Package className="mr-2 h-4 w-4" />
                    <span>Grainger</span>
                  </div>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Not Connected</span>
                </div>
                
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center">
                    <Package className="mr-2 h-4 w-4" />
                    <span>Ferguson</span>
                  </div>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Not Connected</span>
                </div>
                
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center">
                    <Package className="mr-2 h-4 w-4" />
                    <span>Fastenal</span>
                  </div>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Not Connected</span>
                </div>
              </div>
              
              <Button className="w-full">Search Vendor Catalog</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="logs" className="pt-4">
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
