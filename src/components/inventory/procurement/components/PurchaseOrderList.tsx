
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Truck, ClipboardEdit, CheckCircle } from 'lucide-react';
import { PurchaseOrder } from '../types';
import { useToast } from '@/hooks/use-toast';

interface PurchaseOrderListProps {
  purchaseOrders: PurchaseOrder[];
  updateOrderStatus: (id: string, status: PurchaseOrder['status']) => void;
}

export const PurchaseOrderList: React.FC<PurchaseOrderListProps> = ({
  purchaseOrders,
  updateOrderStatus
}) => {
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

  if (purchaseOrders.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No purchase orders found</p>
        <p className="text-sm">Create a new purchase order to get started</p>
      </div>
    );
  }

  return (
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
    </div>
  );
};
