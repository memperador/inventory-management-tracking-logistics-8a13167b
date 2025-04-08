
import React from 'react';
import { Equipment } from '@/components/equipment/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, Clock, Search, Filter, Plus, RefreshCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { INVENTORY_CATEGORIES } from '@/components/equipment/types';
import { useToast } from '@/hooks/use-toast';

interface MobileInventoryViewProps {
  equipmentData: Equipment[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeCategory: string;
  onCategoryChange: (category: any) => void;
  activeStatus: string;
  onStatusChange: (status: string) => void;
  onClearFilters: () => void;
  onAddItem: () => void;
  isLoading?: boolean;
}

export const MobileInventoryView: React.FC<MobileInventoryViewProps> = ({
  equipmentData,
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  activeStatus,
  onStatusChange,
  onClearFilters,
  onAddItem,
  isLoading = false
}) => {
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Operational':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Maintenance':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Out of Service':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Operational':
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'Maintenance':
        return <Clock className="h-4 w-4 mr-1" />;
      case 'Out of Service':
        return <AlertTriangle className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  const handleRefresh = () => {
    toast({
      title: "Refreshing inventory",
      description: "Inventory data updated",
    });
  };

  return (
    <div className="space-y-4">
      {/* Mobile search and filter bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search inventory..."
            className="pl-9"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Filter Inventory</SheetTitle>
              <SheetDescription>
                Apply filters to narrow down your inventory view
              </SheetDescription>
            </SheetHeader>
            
            <div className="py-6 space-y-6">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={activeCategory} 
                  onValueChange={onCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    {INVENTORY_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={activeStatus} 
                  onValueChange={onStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="Operational">Operational</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Out of Service">Out of Service</SelectItem>
                    <SelectItem value="Testing">Testing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <SheetFooter>
              <Button variant="outline" onClick={onClearFilters}>
                Clear Filters
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        
        <Button variant="outline" size="icon" onClick={handleRefresh}>
          <RefreshCcw className="h-4 w-4" />
        </Button>
        
        <Button size="icon" onClick={onAddItem}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Equipment cards for mobile */}
      <div className="space-y-3">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 h-24 flex items-center justify-center bg-muted">
                <p className="text-muted-foreground">Loading...</p>
              </CardContent>
            </Card>
          ))
        ) : equipmentData.length > 0 ? (
          equipmentData.map(item => (
            <Card key={item.id} className="overflow-hidden hover:shadow-md">
              <CardContent className="p-0">
                <div className="grid grid-cols-[80px_1fr] h-full">
                  {item.image ? (
                    <div 
                      className="bg-center bg-cover" 
                      style={{ 
                        backgroundImage: `url(${item.image})`,
                        minHeight: "80px"
                      }} 
                    />
                  ) : (
                    <div className="bg-muted flex items-center justify-center min-h-[80px]">
                      <span className="text-xs text-muted-foreground">No image</span>
                    </div>
                  )}
                  
                  <div className="p-3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-medium line-clamp-1">{item.name}</h3>
                        <Badge className={`${getStatusColor(item.status)} flex items-center text-xs`} variant="outline">
                          {getStatusIcon(item.status)}
                          {item.status}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-muted-foreground mt-1">
                        <p>{item.category || 'Uncategorized'}</p>
                        <p>{item.location || 'No location'}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs">
                        ID: {item.id.substring(0, 8)}
                      </span>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No equipment items found</p>
              <Button variant="link" onClick={onClearFilters} className="mt-2">
                Clear filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
