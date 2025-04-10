
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  AccordionItem, 
  AccordionTrigger, 
  AccordionContent 
} from '@/components/ui/accordion';
import ChecklistItemComponent from './ChecklistItem';
import { PreConstructionSection, ChecklistItemStatus } from '../../types/preConstructionTypes';

interface ChecklistSectionProps {
  section: PreConstructionSection;
  onUpdateItem: (sectionId: string, itemId: string, status: ChecklistItemStatus) => void;
  onAddItem: (sectionId: string) => void;
  onOpenUploadDialog: (sectionId: string, itemId: string, itemTitle: string, sectionTitle: string) => void;
  onViewDocuments: (documents: any[], itemTitle: string) => void;
  statusFilter: ChecklistItemStatus | 'all';
}

const ChecklistSection: React.FC<ChecklistSectionProps> = ({ 
  section, 
  onUpdateItem, 
  onAddItem,
  onOpenUploadDialog,
  onViewDocuments,
  statusFilter
}) => {
  // Filter items based on selected status
  const filteredItems = statusFilter === 'all'
    ? section.items
    : section.items.filter(item => item.status === statusFilter);
  
  const completedCount = section.items.filter(item => item.status === 'completed').length;
  const totalItemsCount = section.items.length;
  const filteredItemsCount = filteredItems.length;
  
  // Don't show empty sections when filtering
  if (statusFilter !== 'all' && filteredItemsCount === 0) {
    return null;
  }
  
  return (
    <AccordionItem key={section.id} value={section.id}>
      <AccordionTrigger className="px-4 py-2 bg-muted/40 hover:bg-muted rounded-lg">
        <div className="flex items-center">
          <span>{section.title}</span>
          <div className="ml-2 flex items-center gap-2">
            <Badge variant="outline">
              {completedCount}/{totalItemsCount}
            </Badge>
            {statusFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Showing {filteredItemsCount} items
              </Badge>
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-4 pb-2 px-1">
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <ChecklistItemComponent
              key={item.id}
              item={item}
              sectionId={section.id}
              sectionTitle={section.title}
              onUpdateItem={onUpdateItem}
              onOpenUploadDialog={onOpenUploadDialog}
              onViewDocuments={onViewDocuments}
            />
          ))}
          {statusFilter === 'all' && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full border border-dashed mt-2"
              onClick={() => onAddItem(section.id)}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Task
            </Button>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ChecklistSection;
