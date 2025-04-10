
import React, { useState } from 'react';
import { Accordion } from '@/components/ui/accordion';
import { PreConstructionSection, ChecklistItemStatus, DocumentAttachment } from '../types/preConstructionTypes';
import DocumentUploadDialog from './DocumentUploadDialog';
import DocumentViewer from './components/DocumentViewer';
import ChecklistSection from './components/ChecklistSection';

interface PreConstructionChecklistProps {
  sections: PreConstructionSection[];
  onUpdateItem: (sectionId: string, itemId: string, status: ChecklistItemStatus) => void;
  onAddItem: (sectionId: string) => void;
  onAddDocument?: (sectionId: string, itemId: string, document: DocumentAttachment) => void;
}

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

  return (
    <div className="space-y-6">
      <Accordion type="multiple" className="w-full">
        {sections.map((section) => (
          <ChecklistSection
            key={section.id}
            section={section}
            onUpdateItem={onUpdateItem}
            onAddItem={onAddItem}
            onOpenUploadDialog={handleOpenUploadDialog}
            onViewDocuments={handleViewDocuments}
          />
        ))}
      </Accordion>

      <DocumentUploadDialog 
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onDocumentAdded={handleDocumentAdded}
        sectionTitle={currentItem.sectionTitle}
        itemTitle={currentItem.title}
      />

      <DocumentViewer
        open={viewingDocuments.open}
        onOpenChange={(open) => setViewingDocuments(prev => ({...prev, open}))}
        documents={viewingDocuments.documents}
        itemTitle={viewingDocuments.itemTitle}
      />
    </div>
  );
};

export default PreConstructionChecklist;
