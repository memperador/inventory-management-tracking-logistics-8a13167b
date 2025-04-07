
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InventoryCategory, INVENTORY_CATEGORIES } from '@/components/equipment/types';

interface InventoryCategoryTabsProps {
  activeCategory: InventoryCategory | 'All';
  onCategoryChange: (category: InventoryCategory | 'All') => void;
}

export const InventoryCategoryTabs: React.FC<InventoryCategoryTabsProps> = ({
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="mb-4 overflow-auto max-w-full flex flex-nowrap pb-1">
        <TabsTrigger value="all" onClick={() => onCategoryChange('All')}>
          All Items
        </TabsTrigger>
        {INVENTORY_CATEGORIES.map(category => (
          <TabsTrigger 
            key={category} 
            value={category.toLowerCase().replace(' ', '-')}
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
