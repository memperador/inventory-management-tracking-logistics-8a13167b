
import React from 'react';
import { ShoppingCart, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PurchaseOrderList } from './components/PurchaseOrderList';
import { LowStockItems } from './components/LowStockItems';
import { NewOrderForm } from './components/NewOrderForm';
import { BulkOrderUpload } from './components/BulkOrderUpload';
import { useProcurement } from './hooks/useProcurement';
import { ProcurementIntegrationProps } from './types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const ProcurementIntegration: React.FC<ProcurementIntegrationProps> = ({
  equipmentData
}) => {
  const {
    purchaseOrders,
    newOrderDialog,
    setNewOrderDialog,
    bulkOrderDialog,
    setBulkOrderDialog,
    lowStockItems,
    newOrder,
    setNewOrder,
    createPurchaseOrder,
    updateOrderStatus,
    reorderItem,
    createBulkPurchaseOrders
  } = useProcurement(equipmentData);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold">Procurement Integration</h2>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => setNewOrderDialog(true)}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            New Purchase Order
          </Button>
          <Button variant="outline" onClick={() => setBulkOrderDialog(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Bulk Upload
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock Items</TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders" className="mt-4">
          <div className="rounded-md border">
            <div className="p-4 bg-muted/50 flex items-center justify-between">
              <h3 className="font-medium">Recent Purchase Orders</h3>
            </div>
            <PurchaseOrderList 
              purchaseOrders={purchaseOrders}
              updateOrderStatus={updateOrderStatus}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="low-stock" className="mt-4">
          <LowStockItems 
            items={lowStockItems}
            onReorder={reorderItem}
          />
        </TabsContent>
      </Tabs>
      
      <NewOrderForm
        open={newOrderDialog}
        onOpenChange={setNewOrderDialog}
        formData={newOrder}
        setFormData={setNewOrder}
        onSubmit={createPurchaseOrder}
      />
      
      <Dialog open={bulkOrderDialog} onOpenChange={setBulkOrderDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Bulk Order Upload</DialogTitle>
          </DialogHeader>
          <BulkOrderUpload onBulkOrderSubmit={createBulkPurchaseOrders} />
        </DialogContent>
      </Dialog>
    </div>
  );
};
