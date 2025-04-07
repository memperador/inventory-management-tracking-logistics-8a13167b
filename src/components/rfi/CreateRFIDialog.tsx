
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

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
  const { form, onSubmit, isSubmitting, errors } = useRFIForm({
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

  // Check if there are any form-level errors (not tied to specific fields)
  const hasFormErrors = Object.keys(errors).length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {hasFormErrors && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please fix the validation errors before submitting.
                </AlertDescription>
              </Alert>
            )}
            
            <RequestFormFields form={form} requestType={requestType} />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : `Create ${requestType.toUpperCase()}`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRFIDialog;
