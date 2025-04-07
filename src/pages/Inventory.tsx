
import React, { useState } from 'react';
import { Plus, LayoutGrid, List, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { EquipmentList } from '@/components/equipment/EquipmentList';
import { EquipmentListView } from '@/components/equipment/EquipmentListView';
import { equipmentData } from '@/components/equipment/EquipmentData';
import { InventoryCategory, INVENTORY_CATEGORIES } from '@/components/equipment/types';
import { InventoryFilters } from '@/components/inventory/InventoryFilters';

type ViewMode = 'grid' | 'list';

const Inventory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list'); // Changed default to list view
  const [activeCategory, setActiveCategory] = useState<InventoryCategory | 'All'>('All');
  const [activeStatus, setActiveStatus] = useState<string>('All');
  
  // Filter equipment based on search query and active filters
  const filteredEquipment = equipmentData.filter(equipment => {
    const matchesSearch = 
      equipment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      activeCategory === 'All' || 
      equipment.category === activeCategory;
      
    const matchesStatus = 
      activeStatus === 'All' || 
      equipment.status === activeStatus;
      
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-gray-500 mt-1">Manage your complete inventory assets</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Asset
        </Button>
      </div>
      
      <InventoryFilters 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
      />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4 overflow-auto max-w-full flex flex-nowrap pb-1">
            <TabsTrigger value="all" onClick={() => setActiveCategory('All')}>
              All Items
            </TabsTrigger>
            {INVENTORY_CATEGORIES.map(category => (
              <TabsTrigger 
                key={category} 
                value={category.toLowerCase().replace(' ', '-')}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === 'grid' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filteredEquipment.length > 0 ? (
        viewMode === 'grid' ? (
          <EquipmentList equipmentData={filteredEquipment} />
        ) : (
          <EquipmentListView equipmentData={filteredEquipment} />
        )
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">No inventory items found matching your filters.</p>
            <Button variant="outline" className="mt-4" onClick={() => {
              setSearchQuery('');
              setActiveCategory('All');
              setActiveStatus('All');
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Industry Compliance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Code Compliance</CardTitle>
              <CardDescription>Industry standards and regulatory requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Track equipment compliance with NEC, CSI, and other industry code requirements.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Records</CardTitle>
              <CardDescription>OSHA and manufacturer requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Track maintenance schedules and history for audit and safety compliance.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Certifications</CardTitle>
              <CardDescription>Required equipment certification</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Manage equipment certification requirements and renewal dates.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
