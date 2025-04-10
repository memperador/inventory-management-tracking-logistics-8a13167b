
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Calendar, 
  PaperclipIcon, 
  File 
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent } from '@/components/ui/card';
import StatusBadge, { statusColors, statusIcons } from './StatusBadge';
import { ChecklistItem as ChecklistItemType, ChecklistItemStatus } from '../../types/preConstructionTypes';

interface ChecklistItemProps {
  item: ChecklistItemType;
  sectionId: string;
  sectionTitle: string;
  onUpdateItem: (sectionId: string, itemId: string, status: ChecklistItemStatus) => void;
  onOpenUploadDialog: (sectionId: string, itemId: string, itemTitle: string, sectionTitle: string) => void;
  onViewDocuments: (documents: ChecklistItemType['documents'], itemTitle: string) => void;
}

const ChecklistItemComponent: React.FC<ChecklistItemProps> = ({ 
  item, 
  sectionId, 
  sectionTitle,
  onUpdateItem, 
  onOpenUploadDialog,
  onViewDocuments 
}) => {
  return (
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
                  onClick={() => onViewDocuments(item.documents, item.title)}
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
                    onClick={() => onOpenUploadDialog(sectionId, item.id, item.title, sectionTitle)}
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
                  onClick={() => onUpdateItem(sectionId, item.id, 'pending')}
                >
                  {statusIcons['pending']}
                  <span className="ml-2">Pending</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={statusColors['in-progress']}
                  onClick={() => onUpdateItem(sectionId, item.id, 'in-progress')}
                >
                  {statusIcons['in-progress']}
                  <span className="ml-2">In Progress</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={statusColors['completed']}
                  onClick={() => onUpdateItem(sectionId, item.id, 'completed')}
                >
                  {statusIcons['completed']}
                  <span className="ml-2">Completed</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={statusColors['not-required']}
                  onClick={() => onUpdateItem(sectionId, item.id, 'not-required')}
                >
                  {statusIcons['not-required']}
                  <span className="ml-2">Not Required</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="mt-3 flex items-center">
          <StatusBadge status={item.status} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ChecklistItemComponent;
