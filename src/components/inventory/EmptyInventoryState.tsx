
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EmptyInventoryStateProps {
  onClearFilters: () => void;
}

export const EmptyInventoryState: React.FC<EmptyInventoryStateProps> = ({
  onClearFilters,
}) => {
  return (
    <Card>
      <CardContent className="py-10 text-center">
        <p className="text-muted-foreground">No inventory items found matching your filters.</p>
        <Button variant="outline" className="mt-4" onClick={onClearFilters}>
          Clear Filters
        </Button>
      </CardContent>
    </Card>
  );
};
