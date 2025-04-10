
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from '@/utils/uuid';
import { 
  ChecklistItem, 
  ChecklistItemStatus, 
  PreConstructionSection,
  DocumentAttachment
} from '../../types/preConstructionTypes';
import { defaultSections } from '../data/defaultSections';

interface UsePreConstructionPlanProps {
  projectId: string;
}

export const usePreConstructionPlan = ({ projectId }: UsePreConstructionPlanProps) => {
  const [sections, setSections] = useState<PreConstructionSection[]>(defaultSections);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<ChecklistItem>>({
    title: '',
    description: '',
    status: 'pending',
    documents: []
  });
  const [activeSectionId, setActiveSectionId] = useState('');
  const { toast } = useToast();

  const handleUpdateItem = (sectionId: string, itemId: string, status: ChecklistItemStatus) => {
    setSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? {
              ...section,
              items: section.items.map(item => 
                item.id === itemId 
                  ? { ...item, status } 
                  : item
              )
            }
          : section
      )
    );
    
    toast({
      title: "Task updated",
      description: `Task status changed to ${status}`
    });
  };

  const handleAddItem = (sectionId: string) => {
    setActiveSectionId(sectionId);
    setNewItem({
      title: '',
      description: '',
      status: 'pending',
      documents: []
    });
    setIsAddItemDialogOpen(true);
  };

  const handleAddDocument = (sectionId: string, itemId: string, document: DocumentAttachment) => {
    setSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? {
              ...section,
              items: section.items.map(item => 
                item.id === itemId 
                  ? { 
                      ...item, 
                      documents: [...(item.documents || []), document]
                    } 
                  : item
              )
            }
          : section
      )
    );
  };

  const handleSaveNewItem = () => {
    if (!newItem.title) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive"
      });
      return;
    }

    const item: ChecklistItem = {
      id: uuidv4(),
      title: newItem.title || '',
      description: newItem.description || '',
      status: newItem.status as ChecklistItemStatus || 'pending',
      dueDate: newItem.dueDate,
      documents: []
    };

    setSections(prev => 
      prev.map(section => 
        section.id === activeSectionId 
          ? {
              ...section,
              items: [...section.items, item]
            }
          : section
      )
    );

    setIsAddItemDialogOpen(false);
    toast({
      title: "Task added",
      description: "New pre-construction task has been added"
    });
  };

  const savePlan = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, you would save to Supabase here
      toast({
        title: "Plan saved",
        description: "Pre-construction plan has been saved successfully"
      });
    } catch (error) {
      console.error("Error saving plan:", error);
      toast({
        title: "Error",
        description: "Failed to save pre-construction plan",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sections,
    isLoading,
    isAddItemDialogOpen,
    setIsAddItemDialogOpen,
    newItem,
    setNewItem,
    activeSectionId,
    handleUpdateItem,
    handleAddItem,
    handleAddDocument,
    handleSaveNewItem,
    savePlan
  };
};
