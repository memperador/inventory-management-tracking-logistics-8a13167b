
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileUpload } from './FileUpload';
import { DocumentList } from './DocumentList';
import { FilePlus } from 'lucide-react';

interface DocumentDialogProps {
  equipmentId: string;
  equipmentName: string;
  tenantId: string;
}

export function DocumentDialog({ equipmentId, equipmentName, tenantId }: DocumentDialogProps) {
  const [open, setOpen] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);

  const refreshFiles = () => {
    setRefreshFlag(prev => prev + 1);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <FilePlus className="h-4 w-4" />
          <span>Docs</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Documentation for {equipmentName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 my-4">
          <FileUpload equipmentId={equipmentId} onFileUploaded={refreshFiles} />
          
          <div className="border rounded-md p-4">
            <DocumentList 
              key={refreshFlag}
              equipmentId={equipmentId} 
              tenantId={tenantId} 
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
