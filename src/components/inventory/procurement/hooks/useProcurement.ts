
import { useState } from 'react';
import { Equipment } from '@/components/equipment/types';
import { PurchaseOrder, NewOrderFormData, BulkOrderItem } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useProcurement = (equipmentData: Equipment[]) => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: 'PO-1001',
      equipmentName: 'DeWalt Drill Set (Replacement)',
      quantity: 2,
      status: 'delivered',
      requestDate: '2024-03-10',
      expectedDelivery: '2024-03-25',
      vendor: 'Tool Supply Co.',
      cost: 650
    },
    {
      id: 'PO-1002',
      equipmentName: 'Safety Harnesses',
      quantity: 10,
      status: 'ordered',
      requestDate: '2024-03-28',
      expectedDelivery: '2024-04-15',
      vendor: 'Safety First Ltd.',
      cost: 2800
    }
  ]);
  const [newOrderDialog, setNewOrderDialog] = useState(false);
  const [bulkOrderDialog, setBulkOrderDialog] = useState(false);
  const [lowStockItems] = useState<Equipment[]>(equipmentData.slice(0, 3));
  const { toast } = useToast();
  
  // New order form state
  const [newOrder, setNewOrder] = useState<NewOrderFormData>({
    equipmentName: '',
    quantity: 1,
    vendor: '',
    estimatedCost: ''
  });

  const createPurchaseOrder = () => {
    if (!newOrder.equipmentName || !newOrder.quantity || !newOrder.vendor) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }

    const po: PurchaseOrder = {
      id: `PO-${1003 + purchaseOrders.length}`,
      equipmentName: newOrder.equipmentName,
      quantity: newOrder.quantity,
      status: 'pending',
      requestDate: new Date().toISOString().split('T')[0],
      vendor: newOrder.vendor,
      cost: parseFloat(newOrder.estimatedCost) || 0
    };

    setPurchaseOrders([...purchaseOrders, po]);
    setNewOrderDialog(false);
    
    toast({
      title: "Purchase Order Created",
      description: `PO ${po.id} has been created for ${po.quantity} ${po.equipmentName}`,
    });
    
    // Reset form
    setNewOrder({
      equipmentName: '',
      quantity: 1,
      vendor: '',
      estimatedCost: ''
    });
  };

  const updateOrderStatus = (id: string, status: PurchaseOrder['status']) => {
    const updatedOrders = purchaseOrders.map(order => 
      order.id === id ? { ...order, status } : order
    );
    
    setPurchaseOrders(updatedOrders);
    
    toast({
      title: "Order Status Updated",
      description: `Purchase Order ${id} status changed to ${status}`,
    });
  };

  const reorderItem = (item: Equipment) => {
    setNewOrder({
      equipmentName: item.name,
      quantity: 1,
      vendor: '',
      estimatedCost: item.cost?.toString() || ''
    });
    setNewOrderDialog(true);
  };
  
  const createBulkPurchaseOrders = (bulkItems: BulkOrderItem[]) => {
    if (bulkItems.length === 0) {
      toast({
        title: "No items to order",
        description: "Please add items to your bulk order",
        variant: "destructive",
      });
      return;
    }
    
    const newPurchaseOrders = bulkItems.map((item, index) => {
      return {
        id: `PO-${1003 + purchaseOrders.length + index}`,
        equipmentName: item.equipmentName,
        quantity: item.quantity,
        status: 'pending' as const,
        requestDate: new Date().toISOString().split('T')[0],
        vendor: item.vendor,
        cost: parseFloat(item.estimatedCost) || 0
      };
    });
    
    setPurchaseOrders([...purchaseOrders, ...newPurchaseOrders]);
    setBulkOrderDialog(false);
    
    toast({
      title: "Bulk Order Created",
      description: `${newPurchaseOrders.length} purchase orders have been created`,
    });
  };

  return {
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
  };
};
