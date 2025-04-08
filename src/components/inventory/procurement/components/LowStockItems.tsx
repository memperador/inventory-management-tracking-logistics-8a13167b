
import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCw, ShoppingCart, CheckCircle } from 'lucide-react';
import { Equipment } from '@/components/equipment/types';

interface LowStockItemsProps {
  items: Equipment[];
  onReorder: (item: Equipment) => void;
}

export const LowStockItems: React.FC<LowStockItemsProps> = ({
  items,
  onReorder
}) => {
  return (
    <div className="rounded-md border">
      <div className="p-4 bg-muted/50 flex items-center justify-between">
        <h3 className="font-medium">Items Low In Stock</h3>
        <Button variant="outline" size="sm">
          <RotateCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
      <div className="divide-y">
        {items.length > 0 ? (
          items.map(item => (
            <div key={item.id} className="p-4 flex items-center justify-between">
              <div>
                <h4 className="font-medium">{item.name}</h4>
                <div className="text-sm text-muted-foreground">
                  <span>{item.category || 'Uncategorized'}</span>
                  <span className="mx-2">•</span>
                  <span>ID: {item.id}</span>
                  {item.cost && (
                    <>
                      <span className="mx-2">•</span>
                      <span>Cost: ${item.cost.toLocaleString()}</span>
                    </>
                  )}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onReorder(item)}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Reorder
              </Button>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>All items have sufficient stock</p>
          </div>
        )}
      </div>
    </div>
  );
};
