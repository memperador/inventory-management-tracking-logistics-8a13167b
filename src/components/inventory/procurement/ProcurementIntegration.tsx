
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Equipment } from '@/components/equipment/types';
import { ShoppingCart, Truck, ClipboardEdit, RotateCw, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PurchaseOrder {
  id: string;
  equipmentId?: string;
  equipmentName: string;
  quantity: number;
  status: 'pending' | 'approved' | 'ordered' | 'delivered';
  requestDate: string;
  expectedDelivery?: string;
  vendor?: string;
  cost?: number;
}

interface ProcurementIntegrationProps {
  equipmentData: Equipment[];
}

export const ProcurementIntegration: React.FC<ProcurementIntegrationProps> = ({
  equipmentData
}) => {
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
  const [lowStockItems, setLowStockItems] = useState<Equipment[]>(
    equipmentData.slice(0, 3)
  );
  const { toast } = useToast();
  
  // New order form state
  const [newOrder, setNewOrder] = useState({
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

  const getStatusBadge = (status: PurchaseOrder['status']) => {
    switch(status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Pending</span>;
      case 'approved':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Approved</span>;
      case 'ordered':
        return <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">Ordered</span>;
      case 'delivered':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Delivered</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold">Procurement Integration</h2>
        <Button onClick={() => setNewOrderDialog(true)}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          New Purchase Order
        </Button>
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
            <div className="divide-y">
              {purchaseOrders.map(order => (
                <div key={order.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{order.equipmentName}</h4>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span>PO: {order.id}</span>
                        <span className="mx-2">•</span>
                        <span>Quantity: {order.quantity}</span>
                        <span className="mx-2">•</span>
                        <span>Vendor: {order.vendor || 'Not specified'}</span>
                      </div>
                      <div className="text-sm">
                        <span>Requested: {new Date(order.requestDate).toLocaleDateString()}</span>
                        {order.expectedDelivery && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Expected: {new Date(order.expectedDelivery).toLocaleDateString()}</span>
                          </>
                        )}
                        {order.cost && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Cost: ${order.cost.toLocaleString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      {order.status === 'pending' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'approved')}
                        >
                          <ClipboardEdit className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                      )}
                      {order.status === 'approved' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'ordered')}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Place Order
                        </Button>
                      )}
                      {order.status === 'ordered' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                        >
                          <Truck className="mr-2 h-4 w-4" />
                          Mark Delivered
                        </Button>
                      )}
                      {order.status === 'delivered' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Completed
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {purchaseOrders.length === 0 && (
                <div className="p-6 text-center text-muted-foreground">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No purchase orders found</p>
                  <p className="text-sm">Create a new purchase order to get started</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="low-stock" className="mt-4">
          <div className="rounded-md border">
            <div className="p-4 bg-muted/50 flex items-center justify-between">
              <h3 className="font-medium">Items Low In Stock</h3>
              <Button variant="outline" size="sm">
                <RotateCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
            <div className="divide-y">
              {lowStockItems.length > 0 ? (
                lowStockItems.map(item => (
                  <div key={item.id} className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <div className="text-sm text-muted-foreground">
                        <span>{item.category || 'Uncategorized'}</span>
                        <span className="mx-2">•</span>
                        <span>ID: {item.id}</span>
                        {item.cost && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Cost: ${item.cost.toLocaleString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => reorderItem(item)}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Reorder
                    </Button>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>All items have sufficient stock</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <Dialog open={newOrderDialog} onOpenChange={setNewOrderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="equipment-name">Equipment Name</Label>
              <Input
                id="equipment-name"
                value={newOrder.equipmentName}
                onChange={(e) => setNewOrder({...newOrder, equipmentName: e.target.value})}
                placeholder="Enter equipment name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={newOrder.quantity}
                onChange={(e) => setNewOrder({...newOrder, quantity: parseInt(e.target.value) || 1})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Select
                value={newOrder.vendor}
                onValueChange={(value) => setNewOrder({...newOrder, vendor: value})}
              >
                <SelectTrigger id="vendor">
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tool Supply Co.">Tool Supply Co.</SelectItem>
                  <SelectItem value="Safety First Ltd.">Safety First Ltd.</SelectItem>
                  <SelectItem value="Heavy Equipment Inc.">Heavy Equipment Inc.</SelectItem>
                  <SelectItem value="Electrical Supplies LLC">Electrical Supplies LLC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cost">Estimated Cost</Label>
              <Input
                id="cost"
                type="text"
                value={newOrder.estimatedCost}
                onChange={(e) => setNewOrder({...newOrder, estimatedCost: e.target.value})}
                placeholder="Enter estimated cost"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOrderDialog(false)}>Cancel</Button>
            <Button onClick={createPurchaseOrder}>Create Purchase Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
