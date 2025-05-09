
import React, { useState } from 'react';
import { Accordion } from '@/components/ui/accordion';
import { PreConstructionSection, ChecklistItemStatus, DocumentAttachment } from '../types/preConstructionTypes';
import DocumentUploadDialog from './DocumentUploadDialog';
import DocumentViewer from './components/DocumentViewer';
import ChecklistSection from './components/ChecklistSection';
import StatusFilter from './components/StatusFilter';

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
  
  // Add state for status filtering
  const [statusFilter, setStatusFilter] = useState<ChecklistItemStatus | 'all'>('all');

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

  // Calculate overall progress
  const totalTasks = sections.reduce((sum, section) => sum + section.items.length, 0);
  const completedTasks = sections.reduce((sum, section) => 
    sum + section.items.filter(item => item.status === 'completed').length, 0);
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Add progress summary */}
      <div className="flex items-center justify-between mb-4">
        <div className="bg-muted p-3 rounded-md flex items-center gap-4 w-full">
          <div className="text-sm font-medium">
            Overall Progress: {completedTasks}/{totalTasks} tasks completed ({progressPercentage}%)
          </div>
          <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>
      </div>

      {/* Add status filter */}
      <StatusFilter selectedStatus={statusFilter} onStatusChange={setStatusFilter} />

      <Accordion type="multiple" className="w-full">
        {sections.map((section) => (
          <ChecklistSection
            key={section.id}
            section={section}
            onUpdateItem={onUpdateItem}
            onAddItem={onAddItem}
            onOpenUploadDialog={handleOpenUploadDialog}
            onViewDocuments={handleViewDocuments}
            statusFilter={statusFilter}
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
