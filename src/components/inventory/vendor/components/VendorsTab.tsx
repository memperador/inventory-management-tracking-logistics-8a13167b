
import React from 'react';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';

export const VendorsTab: React.FC = () => {
  return (
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
  );
};
