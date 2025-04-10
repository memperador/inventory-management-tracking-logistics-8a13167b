
import React from 'react';
import { InventoryContent } from './InventoryContent';
import { InventoryDashboard } from './InventoryDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, LineChart } from 'lucide-react';
import { Equipment, InventoryCategory } from '@/components/equipment/types';
import { AdvancedFiltersType } from './filters/types';

interface InventoryTabContentProps {
  filteredEquipment: Equipment[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeCategory: InventoryCategory | 'All';
  onCategoryChange: (category: InventoryCategory | 'All') => void;
  activeStatus: string;
  onStatusChange: (status: string) => void;
  advancedFilters: AdvancedFiltersType;
  onAdvancedFilterChange: (filters: AdvancedFiltersType) => void;
  onClearFilters: () => void;
}

export const InventoryTabContent: React.FC<InventoryTabContentProps> = ({
  filteredEquipment,
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  activeStatus, 
  onStatusChange,
  advancedFilters,
  onAdvancedFilterChange,
  onClearFilters
}) => {
  const [activeTab, setActiveTab] = React.useState<'list' | 'dashboard'>('list');

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={(value) => setActiveTab(value as 'list' | 'dashboard')}
      className="w-full"
    >
      <div className="flex justify-between items-center mb-4">
        <TabsList className="flex-grow-0 bg-white shadow-sm">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            List View
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Analytics View
          </TabsTrigger>
        </TabsList>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredEquipment.length} items
          </span>
        </div>
      </div>
      
      <TabsContent value="list" className="mt-0 space-y-6">
        <InventoryContent 
          filteredEquipment={filteredEquipment}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          activeCategory={activeCategory}
          onCategoryChange={onCategoryChange}
          activeStatus={activeStatus}
          onStatusChange={onStatusChange}
          advancedFilters={advancedFilters}
          onAdvancedFilterChange={onAdvancedFilterChange}
          onClearFilters={onClearFilters}
        />
      </TabsContent>
      
      <TabsContent value="dashboard" className="mt-0 space-y-6">
        <InventoryDashboard />
      </TabsContent>
    </Tabs>
  );
};
