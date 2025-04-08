
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InventoryCategory, INVENTORY_CATEGORIES } from '@/components/equipment/types';
import { equipmentData } from '@/components/equipment/EquipmentData';

interface InventoryCategoryTabsProps {
  activeCategory: InventoryCategory | 'All';
  onCategoryChange: (category: InventoryCategory | 'All') => void;
}

export const InventoryCategoryTabs: React.FC<InventoryCategoryTabsProps> = ({
  activeCategory,
  onCategoryChange,
}) => {
  // Count items in each category for display in tabs
  const categoryItemCounts = INVENTORY_CATEGORIES.reduce((counts, category) => {
    counts[category] = equipmentData.filter(item => item.category === category).length;
    return counts;
  }, {} as Record<InventoryCategory, number>);

  // Get total count for All Items tab
  const totalItems = equipmentData.length;

  return (
    <Tabs value={activeCategory === 'All' ? 'all' : activeCategory.toLowerCase().replace(/\s+/g, '-')} 
          className="w-full" 
          onValueChange={(value) => {
            if (value === 'all') {
              onCategoryChange('All');
            } else {
              // Convert kebab-case back to Title Case for category
              const selectedCategory = INVENTORY_CATEGORIES.find(
                cat => cat.toLowerCase().replace(/\s+/g, '-') === value
              );
              if (selectedCategory) {
                onCategoryChange(selectedCategory);
              }
            }
          }}>
      <TabsList className="mb-4 overflow-auto max-w-full flex flex-nowrap pb-1">
        <TabsTrigger value="all">
          All Items <span className="ml-2 bg-muted rounded-full px-2 py-0.5 text-xs">{totalItems}</span>
        </TabsTrigger>
        {INVENTORY_CATEGORIES.map(category => (
          <TabsTrigger 
            key={category} 
            value={category.toLowerCase().replace(/\s+/g, '-')}
          >
            {category}
            <span className="ml-2 bg-muted rounded-full px-2 py-0.5 text-xs">
              {categoryItemCounts[category] || 0}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
