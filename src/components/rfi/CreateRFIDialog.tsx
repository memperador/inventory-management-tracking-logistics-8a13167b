
import React from 'react';
import { RFI, RequestType } from './types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useRFIForm } from './hooks/useRFIForm';
import RequestFormFields from './form/RequestFormFields';

interface CreateRFIDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateRequest: (request: RFI) => void;
  requestType: RequestType;
}

const CreateRFIDialog: React.FC<CreateRFIDialogProps> = ({
  open,
  onOpenChange,
  onCreateRequest,
  requestType
}) => {
  const { form, onSubmit } = useRFIForm({
    onCreateRequest,
    requestType,
    onClose: () => onOpenChange(false)
  });
  
  const getDialogTitle = () => {
    switch (requestType) {
      case 'rfi': return 'Create New RFI';
      case 'rfq': return 'Create New RFQ';
      case 'rfp': return 'Create New RFP';
      default: return 'Create New Request';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <RequestFormFields form={form} requestType={requestType} />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create {requestType.toUpperCase()}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRFIDialog;
