
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { DocumentAttachment } from '../../types/preConstructionTypes';

interface DocumentViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: DocumentAttachment[];
  itemTitle: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  open,
  onOpenChange,
  documents,
  itemTitle
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Documents for {itemTitle}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {documents.length > 0 ? (
            <div className="divide-y">
              {documents.map(doc => (
                <div key={doc.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-muted rounded-md">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.fileSize} • {new Date(doc.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" download>
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/60" />
              <p>No documents available</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
