
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Equipment, Document } from '@/components/equipment/types';
import { FilePlus, FileText, Paperclip, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DocumentList } from '@/components/equipment/DocumentList';

interface DocumentAttachmentProps {
  equipment: Equipment;
  onAddDocument: (equipment: Equipment, document: Document) => void;
}

export const DocumentAttachment: React.FC<DocumentAttachmentProps> = ({
  equipment,
  onAddDocument
}) => {
  const [open, setOpen] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const [documentType, setDocumentType] = useState<string>("");
  const [fileSelected, setFileSelected] = useState(false);
  const { toast } = useToast();

  const documentTypes = [
    "Certification", 
    "Inspection Report", 
    "Maintenance Log", 
    "User Manual", 
    "Warranty", 
    "Compliance Report",
    "Safety Guidelines",
    "Technical Specifications"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documentName) {
      toast({
        title: "Missing information",
        description: "Please enter a document name",
        variant: "destructive",
      });
      return;
    }

    if (!documentType) {
      toast({
        title: "Missing information",
        description: "Please select a document type",
        variant: "destructive",
      });
      return;
    }

    if (!fileSelected) {
      toast({
        title: "Missing file",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    const newDocument: Document = {
      id: `doc-${Date.now()}`,
      name: documentName,
      type: documentType,
      size: "1.2 MB", // In a real app, this would be the actual file size
      uploadDate: new Date().toISOString(),
      uploadedBy: "Current User" // In a real app, this would be the current user's name
    };

    onAddDocument(equipment, newDocument);
    setOpen(false);
    
    toast({
      title: "Document Uploaded",
      description: `${documentName} has been attached to ${equipment.name}`,
    });
    
    // Reset form
    setDocumentName("");
    setDocumentType("");
    setFileSelected(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Paperclip className="mr-2 h-4 w-4" />
          Docs & Certs
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Equipment Documentation</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="border rounded-md p-4 bg-muted/50">
            <h3 className="font-medium mb-2">Existing Documents</h3>
            {equipment.documents && equipment.documents.length > 0 ? (
              <div className="space-y-2">
                {equipment.documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between text-sm bg-background p-2 rounded">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-blue-500" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.type} • {doc.size} • {new Date(doc.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No documents attached to this equipment</p>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="document-name">Document Name</Label>
              <Input
                id="document-name"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="Enter document name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="document-type">Document Type</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Upload File</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  type="file"
                  className="hidden"
                  id="document-file"
                  onChange={() => setFileSelected(true)}
                />
                <label htmlFor="document-file" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, DOC, XLS, JPG up to 10MB
                  </p>
                  {fileSelected && (
                    <p className="text-sm text-primary mt-2">File selected</p>
                  )}
                </label>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="submit" disabled={!documentName || !documentType || !fileSelected}>
                <FilePlus className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
