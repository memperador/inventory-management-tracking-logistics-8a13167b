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
import { LayoutGrid, LineChart } from 'lucide-react';

const Inventory = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [activeCategory, setActiveCategory] = useState<InventoryCategory | 'All'>('All');
  const [activeStatus, setActiveStatus] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'list' | 'dashboard'>('list');
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false);
  const [showVendorIntegration, setShowVendorIntegration] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    location: 'All',
    necCode: '',
    csiCode: '',
    maintenanceStatus: 'All',
    minCost: '',
    maxCost: '',
  });
  const { toast } = useToast();
  
  const { handleImport, handleFileUpload, handleExport, handleExportCSV } = useInventoryImportExport();
  
  // Filter equipment based on search query and active filters
  const filteredEquipment = equipmentData.filter(equipment => {
    // Assign default category if not present (for backward compatibility)
    const equipmentCategory = equipment.category || 'Heavy Equipment';
    
    // Basic search matching
    const matchesSearch = 
      (equipment.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (equipment.type?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (equipment.location?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (equipment.id?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (equipment.nec_code?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (equipment.csi_code?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Category and status filtering  
    const matchesCategory = activeCategory === 'All' || equipmentCategory === activeCategory;
    const matchesStatus = activeStatus === 'All' || equipment.status === activeStatus;
    
    // Advanced filtering
    const matchesLocation = advancedFilters.location === 'All' || 
                           equipment.location === advancedFilters.location;
    
    const matchesNecCode = !advancedFilters.necCode || 
                          (equipment.nec_code && 
                           equipment.nec_code.toLowerCase().includes(advancedFilters.necCode.toLowerCase()));
    
    const matchesCsiCode = !advancedFilters.csiCode || 
                          (equipment.csi_code && 
                           equipment.csi_code.toLowerCase().includes(advancedFilters.csiCode.toLowerCase()));
    
    // Maintenance status filtering
    let matchesMaintenance = true;
    if (advancedFilters.maintenanceStatus !== 'All' && equipment.nextMaintenance) {
      const today = new Date();
      const nextMaintDate = new Date(equipment.nextMaintenance);
      const daysUntilMaintenance = Math.floor((nextMaintDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      
      if (advancedFilters.maintenanceStatus === 'Due Soon') {
        matchesMaintenance = daysUntilMaintenance > 0 && daysUntilMaintenance <= 30;
      } else if (advancedFilters.maintenanceStatus === 'Overdue') {
        matchesMaintenance = daysUntilMaintenance < 0;
      } else if (advancedFilters.maintenanceStatus === 'Up to Date') {
        matchesMaintenance = daysUntilMaintenance > 30;
      }
    }
    
    // Cost range filtering
    const minCost = advancedFilters.minCost ? parseFloat(advancedFilters.minCost) : 0;
    const maxCost = advancedFilters.maxCost ? parseFloat(advancedFilters.maxCost) : Infinity;
    const matchesCost = equipment.cost ? (equipment.cost >= minCost && equipment.cost <= maxCost) : true;
    
    return matchesSearch && 
           matchesCategory && 
           matchesStatus && 
           matchesLocation && 
           matchesNecCode && 
           matchesCsiCode && 
           matchesMaintenance &&
           matchesCost;
  });

  // Handler functions
  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveCategory('All');
    setActiveStatus('All');
    setAdvancedFilters({
      location: 'All',
      necCode: '',
      csiCode: '',
      maintenanceStatus: 'All',
      minCost: '',
      maxCost: '',
    });
    
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
              advancedFilters={advancedFilters}
              onAdvancedFilterChange={setAdvancedFilters}
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
