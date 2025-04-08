
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
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
import { NewOrderFormData } from '../types';

interface NewOrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: NewOrderFormData;
  setFormData: React.Dispatch<React.SetStateAction<NewOrderFormData>>;
  onSubmit: () => void;
}

export const NewOrderForm: React.FC<NewOrderFormProps> = ({
  open,
  onOpenChange,
  formData,
  setFormData,
  onSubmit
}) => {
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!formData.equipmentName || !formData.quantity || !formData.vendor) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }

    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="equipment-name">Equipment Name</Label>
            <Input
              id="equipment-name"
              value={formData.equipmentName}
              onChange={(e) => setFormData({...formData, equipmentName: e.target.value})}
              placeholder="Enter equipment name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vendor">Vendor</Label>
            <Select
              value={formData.vendor}
              onValueChange={(value) => setFormData({...formData, vendor: value})}
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
              value={formData.estimatedCost}
              onChange={(e) => setFormData({...formData, estimatedCost: e.target.value})}
              placeholder="Enter estimated cost"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Create Purchase Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
