
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { InventoryItemFormFields } from './form/InventoryItemFormFields';
import { useInventoryItemForm } from './form/useInventoryItemForm';

interface NewInventoryItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewInventoryItemDialog: React.FC<NewInventoryItemDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const { form, onSubmit } = useInventoryItemForm(() => onOpenChange(false));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Inventory Item</DialogTitle>
          <DialogDescription>
            Enter the details of the new inventory item. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <InventoryItemFormFields form={form} />
            
            <DialogFooter className="pt-4">
              <Button type="submit">Add Item</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
