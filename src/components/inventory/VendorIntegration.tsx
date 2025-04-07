
import React, { useState } from 'react';
import { Package, Truck, ShoppingCart, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';

export const VendorIntegration = () => {
  const [activeTab, setActiveTab] = useState('connect');
  const [apiKey, setApiKey] = useState('');
  const [vendorUrl, setVendorUrl] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const { toast } = useToast();

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Connecting to vendor system:", { apiKey, vendorUrl });
    
    toast({
      title: "Vendor Connection",
      description: "Connection request sent. Check credentials and try again if no confirmation is received.",
    });
  };

  const handleWebhookSetup = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Setting up webhook:", webhookUrl);
    
    toast({
      title: "Webhook Setup",
      description: "Webhook URL has been registered for vendor notifications.",
    });
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="connect">Connect</TabsTrigger>
            <TabsTrigger value="webhook">Webhook</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
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
            <form onSubmit={handleWebhookSetup} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="webhook-url" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Webhook URL
                </label>
                <Input 
                  id="webhook-url" 
                  placeholder="https://your-app.com/api/webhooks/vendor" 
                  value={webhookUrl} 
                  onChange={e => setWebhookUrl(e.target.value)} 
                />
                <p className="text-xs text-muted-foreground">
                  Receive notifications when purchase orders are created or items shipped
                </p>
              </div>
              
              <Button type="submit" className="w-full">Set Up Webhook</Button>
            </form>
            
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Event Types</h3>
              <ul className="space-y-2 text-sm">
                <li>• Order Created</li>
                <li>• Order Shipped</li>
                <li>• Order Delivered</li>
                <li>• Inventory Level Alerts</li>
                <li>• Price Changes</li>
              </ul>
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
        </Tabs>
      </CardContent>
    </Card>
  );
};
