
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFileUploadWithPreview } from '@/hooks/useFileUploadWithPreview';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from '@/utils/uuid';
import { DocumentAttachment } from '../types/preConstructionTypes';
import FileDropzone from './components/FileDropzone';
import FilePreview from './components/FilePreview';

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDocumentAdded: (document: DocumentAttachment) => void;
  sectionTitle: string;
  itemTitle: string;
}

export const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({
  open,
  onOpenChange,
  onDocumentAdded,
  sectionTitle,
  itemTitle
}) => {
  const {
    files,
    handleFileChange,
    removeFile,
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    isUploading,
    uploadProgress
  } = useFileUploadWithPreview({
    maxFiles: 1,
    maxSizeInMB: 10,
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  });

  const [documentName, setDocumentName] = useState('');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!files.length) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    if (!documentName.trim()) {
      toast({
        title: "Missing document name",
        description: "Please provide a name for the document",
        variant: "destructive"
      });
      return;
    }

    const file = files[0];
    
    const newDocument: DocumentAttachment = {
      id: uuidv4(),
      name: documentName,
      fileType: file.type,
      uploadDate: new Date().toISOString(),
      uploadedBy: "Current User",
      fileSize: formatFileSize(file.size),
      fileUrl: URL.createObjectURL(file)
    };
    
    onDocumentAdded(newDocument);
    toast({
      title: "Document uploaded",
      description: `${documentName} has been added successfully`
    });
    
    setDocumentName('');
    onOpenChange(false);
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div>
            <div className="text-sm text-muted-foreground mb-4">
              Uploading document for: <span className="font-medium">{sectionTitle} &gt; {itemTitle}</span>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="documentName">Document Name</Label>
              <Input 
                id="documentName"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="Enter document name"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>File Upload</Label>
            <FileDropzone
              isDragging={isDragging}
              isUploading={isUploading}
              handleDragOver={handleDragOver}
              handleDragLeave={handleDragLeave}
              handleDrop={handleDrop}
              handleFileChange={handleFileChange}
            />
          </div>
          
          {files.length > 0 && (
            <FilePreview
              file={files[0]} 
              fileSize={formatFileSize(files[0].size)}
              removeFile={() => removeFile(0)}
              isUploading={isUploading}
            />
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            disabled={isUploading || !files.length}
          >
            Upload Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadDialog;
