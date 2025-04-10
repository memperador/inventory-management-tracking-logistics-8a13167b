import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, File, X } from 'lucide-react';
import { useFileUploadWithPreview } from '@/hooks/useFileUploadWithPreview';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from '@/utils/uuid';
import { DocumentAttachment } from '../types/preConstructionTypes';

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
            <div
              className={`border-2 border-dashed rounded-md p-6 ${
                isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center space-y-2 text-center">
                <Upload className="h-10 w-10 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Drag files or click to upload</p>
                  <p className="text-xs text-muted-foreground">
                    Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                  </p>
                </div>
                
                <Input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Select File'}
                </Button>
              </div>
            </div>
          </div>
          
          {files.length > 0 && (
            <div className="space-y-2">
              <Label>Selected File</Label>
              <div className="bg-muted/50 p-2 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                      <File className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium truncate max-w-[200px]">{files[0].name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(files[0].size)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(0)}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
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
