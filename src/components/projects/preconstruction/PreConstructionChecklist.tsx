import React, { useState } from 'react';
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  MoreHorizontal, 
  Plus,
  FileText,
  Calendar,
  Paperclip as PaperclipIcon,
  File
} from 'lucide-react';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { 
  ChecklistItem, 
  ChecklistItemStatus, 
  PreConstructionSection,
  DocumentAttachment
} from '../types/preConstructionTypes';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import DocumentUploadDialog from './DocumentUploadDialog';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

interface PreConstructionChecklistProps {
  sections: PreConstructionSection[];
  onUpdateItem: (sectionId: string, itemId: string, status: ChecklistItemStatus) => void;
  onAddItem: (sectionId: string) => void;
  onAddDocument?: (sectionId: string, itemId: string, document: DocumentAttachment) => void;
}

const statusIcons = {
  'pending': <Clock className="h-4 w-4 text-yellow-500" />,
  'in-progress': <AlertCircle className="h-4 w-4 text-blue-500" />,
  'completed': <CheckSquare className="h-4 w-4 text-green-500" />,
  'not-required': <FileText className="h-4 w-4 text-gray-500" />
};

const statusLabels: Record<ChecklistItemStatus, string> = {
  'pending': 'Pending',
  'in-progress': 'In Progress',
  'completed': 'Completed',
  'not-required': 'Not Required'
};

const statusColors: Record<ChecklistItemStatus, string> = {
  'pending': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  'in-progress': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  'completed': 'bg-green-100 text-green-800 hover:bg-green-200',
  'not-required': 'bg-gray-100 text-gray-800 hover:bg-gray-200'
};

const PreConstructionChecklist: React.FC<PreConstructionChecklistProps> = ({ 
  sections, 
  onUpdateItem,
  onAddItem,
  onAddDocument
}) => {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<{sectionId: string, itemId: string, title: string, sectionTitle: string}>({
    sectionId: '',
    itemId: '',
    title: '',
    sectionTitle: ''
  });
  const [viewingDocuments, setViewingDocuments] = useState<{
    open: boolean,
    documents: DocumentAttachment[],
    itemTitle: string
  }>({
    open: false,
    documents: [],
    itemTitle: ''
  });

  const handleOpenUploadDialog = (sectionId: string, itemId: string, itemTitle: string, sectionTitle: string) => {
    setCurrentItem({
      sectionId,
      itemId,
      title: itemTitle,
      sectionTitle
    });
    setIsUploadDialogOpen(true);
  };

  const handleDocumentAdded = (document: DocumentAttachment) => {
    if (onAddDocument) {
      onAddDocument(currentItem.sectionId, currentItem.itemId, document);
    }
  };

  const handleViewDocuments = (documents: DocumentAttachment[] | undefined, itemTitle: string) => {
    setViewingDocuments({
      open: true,
      documents: documents || [],
      itemTitle
    });
  };

  const getItemById = (sectionId: string, itemId: string): ChecklistItem | undefined => {
    const section = sections.find(s => s.id === sectionId);
    return section?.items.find(i => i.id === itemId);
  };

  return (
    <div className="space-y-6">
      <Accordion type="multiple" className="w-full">
        {sections.map((section) => (
          <AccordionItem key={section.id} value={section.id}>
            <AccordionTrigger className="px-4 py-2 bg-muted/40 hover:bg-muted rounded-lg">
              <div className="flex items-center">
                <span>{section.title}</span>
                <Badge variant="outline" className="ml-2">
                  {section.items.filter(item => item.status === 'completed').length}/{section.items.length}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-2 px-1">
              <div className="space-y-3">
                {section.items.map((item) => (
                  <Card key={item.id} className="border-l-4" 
                    style={{ borderLeftColor: item.status === 'completed' ? '#10b981' : 
                              item.status === 'in-progress' ? '#3b82f6' : 
                              item.status === 'not-required' ? '#9ca3af' : '#f59e0b' }}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          
                          {item.dueDate && (
                            <div className="flex items-center text-xs text-muted-foreground mt-2">
                              <Calendar className="h-3 w-3 mr-1" />
                              Due: {new Date(item.dueDate).toLocaleDateString()}
                            </div>
                          )}
                          
                          {item.documents && item.documents.length > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-xs px-2 py-1"
                                onClick={() => handleViewDocuments(item.documents, item.title)}
                              >
                                <File className="h-3 w-3 mr-1" />
                                {item.documents.length} document{item.documents.length !== 1 ? 's' : ''}
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleOpenUploadDialog(section.id, item.id, item.title, section.title)}
                                >
                                  <PaperclipIcon className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Upload Document</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className={statusColors['pending']}
                                onClick={() => onUpdateItem(section.id, item.id, 'pending')}
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                Pending
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className={statusColors['in-progress']}
                                onClick={() => onUpdateItem(section.id, item.id, 'in-progress')}
                              >
                                <AlertCircle className="h-4 w-4 mr-2" />
                                In Progress
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className={statusColors['completed']}
                                onClick={() => onUpdateItem(section.id, item.id, 'completed')}
                              >
                                <CheckSquare className="h-4 w-4 mr-2" />
                                Completed
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className={statusColors['not-required']}
                                onClick={() => onUpdateItem(section.id, item.id, 'not-required')}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Not Required
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center">
                        <Badge variant="outline" className="flex items-center gap-1">
                          {statusIcons[item.status]}
                          {statusLabels[item.status]}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full border border-dashed mt-2"
                  onClick={() => onAddItem(section.id)}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Task
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <DocumentUploadDialog 
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onDocumentAdded={handleDocumentAdded}
        sectionTitle={currentItem.sectionTitle}
        itemTitle={currentItem.title}
      />

      <Dialog open={viewingDocuments.open} onOpenChange={(open) => setViewingDocuments(prev => ({...prev, open}))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Documents for {viewingDocuments.itemTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {viewingDocuments.documents.length > 0 ? (
              <div className="divide-y">
                {viewingDocuments.documents.map(doc => (
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
            <Button onClick={() => setViewingDocuments(prev => ({...prev, open: false}))}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PreConstructionChecklist;
