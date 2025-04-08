
import React, { useState, useEffect } from 'react';
import { InventoryHeader } from '@/components/inventory/InventoryHeader';
import { InventoryFilters } from '@/components/inventory/InventoryFilters';
import { InventoryViewSelector, ViewMode } from '@/components/inventory/InventoryViewSelector';
import { InventoryCategoryTabs } from '@/components/inventory/InventoryCategoryTabs';
import { EmptyInventoryState } from '@/components/inventory/EmptyInventoryState';
import { ComplianceSection } from '@/components/inventory/ComplianceSection';
import { useInventoryImportExport } from '@/components/inventory/inventoryUtils';
import { EquipmentList } from '@/components/equipment/EquipmentList';
import { EquipmentListView } from '@/components/equipment/EquipmentListView';
import { EquipmentCompactView } from '@/components/equipment/EquipmentCompactView';
import { equipmentData } from '@/components/equipment/EquipmentData';
import { InventoryCategory } from '@/components/equipment/types';
import { VendorIntegration } from '@/components/inventory/VendorIntegration';
import { NewInventoryItemDialog } from '@/components/inventory/NewInventoryItemDialog';
import { useToast } from '@/hooks/use-toast';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { InventoryDashboard } from '@/components/inventory/InventoryDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, LineChart, ListFilter } from 'lucide-react';

const Inventory = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list'); // Changed default to 'list'
  const [activeCategory, setActiveCategory] = useState<InventoryCategory | 'All'>('All');
  const [activeStatus, setActiveStatus] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'list' | 'dashboard'>('list');
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false);
  const [showVendorIntegration, setShowVendorIntegration] = useState(false);
  const { toast } = useToast();
  
  const { handleImport, handleFileUpload, handleExport, handleExportCSV } = useInventoryImportExport();
  
  // Filter equipment based on search query and active filters
  const filteredEquipment = equipmentData.filter(equipment => {
    // Assign default category if not present (for backward compatibility)
    const equipmentCategory = equipment.category || 'Heavy Equipment';
    
    const matchesSearch = 
      equipment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      activeCategory === 'All' || 
      equipmentCategory === activeCategory;
      
    const matchesStatus = 
      activeStatus === 'All' || 
      equipment.status === activeStatus;
      
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handler functions
  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveCategory('All');
    setActiveStatus('All');
    
    toast({
      title: "Filters Reset",
      description: "All inventory filters have been cleared."
    });
  };

  const handleExportData = () => {
    handleExport(filteredEquipment);
  };
  
  const handleExportDataCSV = () => {
    handleExportCSV(filteredEquipment);
  };
  
  // Check for compliance issues on initial load
  useEffect(() => {
    const expiredItems = equipmentData.filter(item => {
      if (item.certificationRequired && item.certificationExpiry) {
        const expiryDate = new Date(item.certificationExpiry);
        if (expiryDate < new Date()) {
          return true;
        }
      }
      return false;
    });
    
    if (expiredItems.length > 0) {
      // Show toast only after component has mounted
      const timer = setTimeout(() => {
        toast({
          title: "Compliance Alert",
          description: `${expiredItems.length} items have expired certifications`,
          variant: "destructive",
        });
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <NotificationProvider>
      <div className="space-y-6">
        <InventoryHeader 
          onImport={handleImport}
          onExport={handleExportData}
          onExportCSV={handleExportDataCSV}
          onAddItem={() => setIsNewItemDialogOpen(true)}
          onToggleVendorIntegration={() => setShowVendorIntegration(!showVendorIntegration)}
          showVendorIntegration={showVendorIntegration}
        />
        
        {showVendorIntegration && <VendorIntegration />}
        
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as 'list' | 'dashboard')}
          className="w-full"
        >
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                Inventory List
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <LineChart className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {filteredEquipment.length} items
              </span>
            </div>
          </div>
          
          <TabsContent value="list" className="mt-0 space-y-6">
            <InventoryFilters 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              activeStatus={activeStatus}
              onStatusChange={setActiveStatus}
            />
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <InventoryCategoryTabs 
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
              
              <InventoryViewSelector 
                viewMode={viewMode} 
                onViewModeChange={setViewMode}
              />
            </div>

            {filteredEquipment.length > 0 ? (
              viewMode === 'grid' ? (
                <EquipmentList equipmentData={filteredEquipment} />
              ) : viewMode === 'compact' ? (
                <EquipmentCompactView equipmentData={filteredEquipment} />
              ) : (
                <EquipmentListView equipmentData={filteredEquipment} />
              )
            ) : (
              <EmptyInventoryState onClearFilters={handleClearFilters} />
            )}
          </TabsContent>
          
          <TabsContent value="dashboard" className="mt-0 space-y-6">
            <InventoryDashboard />
          </TabsContent>
        </Tabs>
        
        <ComplianceSection />
        
        <NewInventoryItemDialog 
          open={isNewItemDialogOpen} 
          onOpenChange={setIsNewItemDialogOpen} 
        />
        
        <button 
          id="add-inventory-item" 
          onClick={() => setIsNewItemDialogOpen(true)}
          className="hidden"
        />
        
        <input 
          type="file" 
          id="file-upload" 
          accept=".json,.csv" 
          onChange={handleFileUpload} 
          className="hidden"
        />
      </div>
    </NotificationProvider>
  );
};

export default Inventory;
