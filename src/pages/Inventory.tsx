
import React, { useState } from 'react';
import { Plus, LayoutGrid, List, Import, Export, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { EquipmentList } from '@/components/equipment/EquipmentList';
import { EquipmentListView } from '@/components/equipment/EquipmentListView';
import { equipmentData } from '@/components/equipment/EquipmentData';
import { InventoryCategory, INVENTORY_CATEGORIES } from '@/components/equipment/types';
import { InventoryFilters } from '@/components/inventory/InventoryFilters';
import { NewInventoryItemDialog } from '@/components/inventory/NewInventoryItemDialog';
import { VendorIntegration } from '@/components/inventory/VendorIntegration';
import { useToast } from '@/components/ui/use-toast';

type ViewMode = 'grid' | 'list';

const Inventory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list'); // List view as default
  const [activeCategory, setActiveCategory] = useState<InventoryCategory | 'All'>('All');
  const [activeStatus, setActiveStatus] = useState<string>('All');
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false);
  const [showVendorIntegration, setShowVendorIntegration] = useState(false);
  const { toast } = useToast();
  
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

  const handleImport = () => {
    document.getElementById('file-upload')?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        console.log("Imported data:", importedData);
        toast({
          title: "Import Successful",
          description: `Imported ${importedData.length || 0} items`,
        });
      } catch (error) {
        console.error("Import error:", error);
        toast({
          title: "Import Failed",
          description: "The file format is not valid",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredEquipment, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `inventory-export-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Export Successful",
      description: `${filteredEquipment.length} items exported to JSON`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-gray-500 mt-1">Manage your complete inventory assets across all equipment types</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <input 
            type="file" 
            id="file-upload" 
            accept=".json" 
            onChange={handleFileUpload} 
            className="hidden"
          />
          <Button variant="outline" onClick={handleImport}>
            <Import className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Export className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={() => setShowVendorIntegration(!showVendorIntegration)}>
            <Package className="mr-2 h-4 w-4" />
            Vendor Integration
          </Button>
          <Button onClick={() => setIsNewItemDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>
      
      {showVendorIntegration && (
        <VendorIntegration />
      )}
      
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
      
      <NewInventoryItemDialog 
        open={isNewItemDialogOpen} 
        onOpenChange={setIsNewItemDialogOpen} 
      />
    </div>
  );
};

export default Inventory;
