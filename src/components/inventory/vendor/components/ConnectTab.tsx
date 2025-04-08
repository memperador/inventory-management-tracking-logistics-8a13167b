
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart } from 'lucide-react';

interface ConnectTabProps {
  vendorUrl: string;
  setVendorUrl: (url: string) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  handleConnect: (e: React.FormEvent) => void;
}

export const ConnectTab: React.FC<ConnectTabProps> = ({
  vendorUrl,
  setVendorUrl,
  apiKey,
  setApiKey,
  handleConnect
}) => {
  return (
    <div className="space-y-4">
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
    </div>
  );
};
