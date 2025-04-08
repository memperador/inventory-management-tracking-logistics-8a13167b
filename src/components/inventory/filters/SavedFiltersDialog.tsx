
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Equipment, InventoryCategory } from '@/components/equipment/types';
import { Plus, Save, Trash2, BookmarkCheck } from 'lucide-react';
import { AdvancedFiltersType } from '@/components/inventory/filters/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface SavedFilter {
  id: string;
  name: string;
  filter: {
    searchQuery: string;
    activeCategory: InventoryCategory | 'All';
    activeStatus: string;
    advancedFilters: AdvancedFiltersType;
  }
}

interface SavedFiltersDialogProps {
  currentSearchQuery: string;
  currentCategory: InventoryCategory | 'All';
  currentStatus: string;
  currentAdvancedFilters: AdvancedFiltersType;
  onApplyFilter: (filter: SavedFilter['filter']) => void;
}

export const SavedFiltersDialog: React.FC<SavedFiltersDialogProps> = ({
  currentSearchQuery,
  currentCategory,
  currentStatus,
  currentAdvancedFilters,
  onApplyFilter
}) => {
  const [open, setOpen] = useState(false);
  const [savedFilters, setSavedFilters] = useLocalStorage<SavedFilter[]>('inventory-saved-filters', []);
  const [newFilterName, setNewFilterName] = useState("");
  const { toast } = useToast();

  const handleSaveCurrentFilter = () => {
    if (!newFilterName.trim()) {
      toast({
        title: "Filter name required",
        description: "Please enter a name for this filter",
        variant: "destructive",
      });
      return;
    }

    const newFilter: SavedFilter = {
      id: `filter-${Date.now()}`,
      name: newFilterName,
      filter: {
        searchQuery: currentSearchQuery,
        activeCategory: currentCategory,
        activeStatus: currentStatus,
        advancedFilters: currentAdvancedFilters
      }
    };

    setSavedFilters([...savedFilters, newFilter]);
    setNewFilterName("");
    
    toast({
      title: "Filter Saved",
      description: `The filter "${newFilterName}" has been saved`,
    });
  };

  const handleApplyFilter = (filter: SavedFilter) => {
    onApplyFilter(filter.filter);
    setOpen(false);
    
    toast({
      title: "Filter Applied",
      description: `Applied the "${filter.name}" filter`,
    });
  };

  const handleDeleteFilter = (id: string, filterName: string) => {
    const updatedFilters = savedFilters.filter(filter => filter.id !== id);
    setSavedFilters(updatedFilters);
    
    toast({
      title: "Filter Deleted",
      description: `The filter "${filterName}" has been deleted`,
    });
  };

  // Generate a description of a saved filter
  const getFilterDescription = (filter: SavedFilter['filter']) => {
    const parts = [];
    
    if (filter.searchQuery) {
      parts.push(`Search: "${filter.searchQuery}"`);
    }
    
    if (filter.activeCategory !== 'All') {
      parts.push(`Category: ${filter.activeCategory}`);
    }
    
    if (filter.activeStatus !== 'All') {
      parts.push(`Status: ${filter.activeStatus}`);
    }
    
    if (filter.advancedFilters.location && filter.advancedFilters.location !== 'All') {
      parts.push(`Location: ${filter.advancedFilters.location}`);
    }
    
    if (filter.advancedFilters.minCost) {
      parts.push(`Min Cost: $${filter.advancedFilters.minCost}`);
    }
    
    if (filter.advancedFilters.maxCost) {
      parts.push(`Max Cost: $${filter.advancedFilters.maxCost}`);
    }
    
    return parts.join(", ") || "No filters applied";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <BookmarkCheck className="mr-2 h-4 w-4" />
          Saved Filters
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Saved Filters</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {savedFilters.length > 0 ? (
              savedFilters.map((filter) => (
                <div 
                  key={filter.id} 
                  className="flex items-start justify-between p-3 border rounded-md hover:bg-accent/50 cursor-pointer"
                  onClick={() => handleApplyFilter(filter)}
                >
                  <div>
                    <h4 className="font-medium">{filter.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {getFilterDescription(filter.filter)}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFilter(filter.id, filter.name);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookmarkCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No saved filters yet</p>
                <p className="text-sm">Save your current filter settings to access them quickly later</p>
              </div>
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <Label htmlFor="filter-name">Save Current Filter</Label>
            <div className="flex items-center gap-2 mt-2">
              <Input
                id="filter-name"
                placeholder="Filter name"
                value={newFilterName}
                onChange={(e) => setNewFilterName(e.target.value)}
              />
              <Button onClick={handleSaveCurrentFilter}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
