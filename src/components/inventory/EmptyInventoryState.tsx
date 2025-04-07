
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PackageOpen, Plus, Search } from 'lucide-react';

interface EmptyInventoryStateProps {
  onClearFilters: () => void;
}

export const EmptyInventoryState: React.FC<EmptyInventoryStateProps> = ({
  onClearFilters,
}) => {
  return (
    <Card className="border-dashed">
      <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-5">
        <div className="bg-muted/30 p-6 rounded-full">
          <PackageOpen size={48} className="text-muted-foreground" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-medium">No inventory items found</h3>
          <p className="text-muted-foreground max-w-md">
            We couldn't find any inventory items matching your current filters. Try adjusting your search criteria or clear all filters to see all items.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={onClearFilters} className="flex items-center gap-2">
            <Search size={16} />
            Clear Filters
          </Button>
          <Button onClick={() => document.getElementById('add-inventory-item')?.click()} className="flex items-center gap-2">
            <Plus size={16} />
            Add New Item
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
