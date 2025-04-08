
import React, { useState, useEffect } from 'react';
import { InventoryHeader } from '@/components/inventory/InventoryHeader';
import { InventoryTabContent } from '@/components/inventory/InventoryTabContent';
import { ComplianceSection } from '@/components/inventory/ComplianceSection';
import { useInventoryImportExport } from '@/components/inventory/inventoryUtils';
import { equipmentData as initialEquipmentData } from '@/components/equipment/EquipmentData';
import { VendorIntegration } from '@/components/inventory/VendorIntegration';
import { NewInventoryItemDialog } from '@/components/inventory/NewInventoryItemDialog';
import { useToast } from '@/hooks/use-toast';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { useInventoryFilters } from '@/components/inventory/hooks/useInventoryFilters';
import { BatchOperationsBar } from '@/components/inventory/batch/BatchOperationsBar';
import { CheckoutDialog } from '@/components/inventory/checkout/CheckoutDialog';
import { QRCodeGenerator } from '@/components/inventory/qrcode/QRCodeGenerator';
import { EnhancedDashboard } from '@/components/inventory/analytics/EnhancedDashboard';
import { SavedFiltersDialog } from '@/components/inventory/filters/SavedFiltersDialog';
import { InventoryAlerts } from '@/components/inventory/alerts/InventoryAlerts';
import { DocumentAttachment } from '@/components/inventory/compliance/DocumentAttachment';
import { MobileInventoryView } from '@/components/inventory/mobile/MobileInventoryView';
import { ProcurementIntegration } from '@/components/inventory/procurement/ProcurementIntegration';
import { InventoryAuditLogs } from '@/components/inventory/audit/InventoryAuditLogs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Equipment, Document as EquipmentDocument } from '@/components/equipment/types';
import { useMediaQuery } from '@/hooks/use-mobile';

const Inventory = () => {
  // State management
  const [equipmentData, setEquipmentData] = useState<Equipment[]>(initialEquipmentData);
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false);
  const [showVendorIntegration, setShowVendorIntegration] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>([]);
  const [activeTab, setActiveTab] = useState<string>("inventory");
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  const {
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    activeStatus,
    setActiveStatus,
    advancedFilters,
    setAdvancedFilters,
    filterEquipment,
    handleClearFilters
  } = useInventoryFilters(() => {
    toast({
      title: "Filters Reset",
      description: "All inventory filters have been cleared."
    });
  });
  
  // Get filtered equipment based on all filters
  const filteredEquipment = filterEquipment(equipmentData);
  
  const { handleImport, handleFileUpload, handleExport: exportFunc, handleExportCSV: exportCSVFunc } = useInventoryImportExport();
  
  // Create wrapper functions that don't expect parameters
  const handleExport = () => exportFunc(filteredEquipment);
  const handleExportCSV = () => exportCSVFunc(filteredEquipment);
  
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
  }, [toast]);

  // Handle batch operations
  const handleBatchUpdate = (updatedItems: Equipment[]) => {
    const updatedEquipmentData = [...equipmentData];
    
    updatedItems.forEach(updatedItem => {
      const index = updatedEquipmentData.findIndex(item => item.id === updatedItem.id);
      if (index !== -1) {
        updatedEquipmentData[index] = { ...updatedEquipmentData[index], ...updatedItem };
      }
    });
    
    setEquipmentData(updatedEquipmentData);
    setSelectedEquipment([]);
  };

  // Handle equipment check-in/check-out
  const handleCheckout = (equipment: Equipment, name: string, returnDate: Date) => {
    const updatedEquipment = equipmentData.map(item => 
      item.id === equipment.id 
        ? { ...item, isCheckedOut: true, checkedOutTo: name }
        : item
    );
    
    setEquipmentData(updatedEquipment);
  };

  const handleCheckin = (equipment: Equipment) => {
    const updatedEquipment = equipmentData.map(item => 
      item.id === equipment.id 
        ? { ...item, isCheckedOut: false, checkedOutTo: undefined }
        : item
    );
    
    setEquipmentData(updatedEquipment);
  };

  // Handle document attachment
  const handleAddDocument = (equipment: Equipment, document: EquipmentDocument) => {
    const updatedEquipment = equipmentData.map(item => {
      if (item.id === equipment.id) {
        const currentDocuments = item.documents || [];
        return {
          ...item,
          documents: [...currentDocuments, document],
          documentCount: (item.documentCount || 0) + 1
        };
      }
      return item;
    });
    
    setEquipmentData(updatedEquipment);
  };

  // Handle applying saved filter
  const handleApplySavedFilter = (filter: any) => {
    setSearchQuery(filter.searchQuery);
    setActiveCategory(filter.activeCategory);
    setActiveStatus(filter.activeStatus);
    setAdvancedFilters(filter.advancedFilters);
  };

  const toggleItemSelection = (item: Equipment) => {
    const isSelected = selectedEquipment.some(selected => selected.id === item.id);
    
    if (isSelected) {
      setSelectedEquipment(selectedEquipment.filter(selected => selected.id !== item.id));
    } else {
      setSelectedEquipment([...selectedEquipment, item]);
    }
  };

  // Custom components to integrate with existing tab system
  const InventoryView = () => (
    <>
      {isMobile ? (
        <MobileInventoryView
          equipmentData={filteredEquipment}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          activeStatus={activeStatus}
          onStatusChange={setActiveStatus}
          onClearFilters={handleClearFilters}
          onAddItem={() => setIsNewItemDialogOpen(true)}
        />
      ) : (
        <InventoryTabContent
          filteredEquipment={filteredEquipment}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          activeStatus={activeStatus}
          onStatusChange={setActiveStatus}
          advancedFilters={advancedFilters}
          onAdvancedFilterChange={setAdvancedFilters}
          onClearFilters={handleClearFilters}
        />
      )}
    </>
  );

  return (
    <NotificationProvider>
      <div className="space-y-6">
        <InventoryHeader 
          onImport={handleImport}
          onExport={handleExport}
          onExportCSV={handleExportCSV}
          onAddItem={() => setIsNewItemDialogOpen(true)}
          onToggleVendorIntegration={() => setShowVendorIntegration(!showVendorIntegration)}
          showVendorIntegration={showVendorIntegration}
        />
        
        {showVendorIntegration && <VendorIntegration />}
        
        {/* Enhanced features integration */}
        <div className="flex justify-end gap-2 flex-wrap">
          <SavedFiltersDialog
            currentSearchQuery={searchQuery}
            currentCategory={activeCategory}
            currentStatus={activeStatus}
            currentAdvancedFilters={advancedFilters}
            onApplyFilter={handleApplySavedFilter}
          />

          {!isMobile && filteredEquipment.map(item => (
            <React.Fragment key={item.id}>
              <CheckoutDialog 
                equipment={item} 
                onCheckout={handleCheckout}
                onCheckin={handleCheckin}
              />
              <QRCodeGenerator equipment={item} />
              <DocumentAttachment
                equipment={item}
                onAddDocument={handleAddDocument}
              />
            </React.Fragment>
          ))}
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="procurement">Procurement</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="alerts">Alerts & Notifications</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="inventory">
            <InventoryView />
          </TabsContent>
          
          <TabsContent value="procurement">
            <ProcurementIntegration equipmentData={equipmentData} />
          </TabsContent>
          
          <TabsContent value="analytics">
            <EnhancedDashboard equipmentData={equipmentData} />
          </TabsContent>
          
          <TabsContent value="alerts">
            <InventoryAlerts equipmentData={equipmentData} />
          </TabsContent>
          
          <TabsContent value="audit">
            <InventoryAuditLogs equipmentData={equipmentData} />
          </TabsContent>
        </Tabs>
        
        <ComplianceSection />
        
        <BatchOperationsBar
          selectedItems={selectedEquipment}
          onClearSelection={() => setSelectedEquipment([])}
          onUpdateItems={handleBatchUpdate}
        />
        
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
