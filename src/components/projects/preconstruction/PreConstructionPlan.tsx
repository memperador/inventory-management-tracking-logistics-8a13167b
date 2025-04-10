
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  ChecklistItem, 
  ChecklistItemStatus, 
  PreConstructionPlan, 
  PreConstructionSection,
  DocumentAttachment
} from '../types/preConstructionTypes';
import { v4 as uuidv4 } from '@/utils/uuid';
import PreConstructionChecklist from './PreConstructionChecklist';
import { supabase } from '@/integrations/supabase/client';
import { useFileUploadWithPreview } from '@/hooks/useFileUploadWithPreview';

interface PreConstructionPlanProps {
  projectId: string;
}

const defaultSections: PreConstructionSection[] = [
  {
    id: 'permits',
    title: 'Permits & Compliance',
    items: [
      {
        id: 'permit-1',
        title: 'Building Permit Application',
        description: 'Submit application for main building permit',
        status: 'pending',
        documents: []
      },
      {
        id: 'permit-2',
        title: 'Electrical Permit',
        description: 'Obtain specialized electrical work permits',
        status: 'pending',
        documents: []
      },
      {
        id: 'permit-3',
        title: 'Site Plan Approval',
        description: 'Get approval for site plans from local authority',
        status: 'pending',
        documents: []
      }
    ]
  },
  {
    id: 'site-prep',
    title: 'Site Preparation',
    items: [
      {
        id: 'site-1',
        title: 'Site Survey',
        description: 'Complete topographical and boundary survey',
        status: 'pending',
        documents: []
      },
      {
        id: 'site-2',
        title: 'Utility Locating',
        description: 'Mark underground utilities before excavation',
        status: 'pending',
        documents: []
      },
      {
        id: 'site-3',
        title: 'Environmental Assessment',
        description: 'Conduct required environmental tests',
        status: 'pending',
        documents: []
      }
    ]
  },
  {
    id: 'resource-planning',
    title: 'Resource Planning',
    items: [
      {
        id: 'resource-1',
        title: 'Equipment Requirements',
        description: 'Identify all equipment needed for project',
        status: 'pending',
        documents: []
      },
      {
        id: 'resource-2',
        title: 'Labor Planning',
        description: 'Determine labor requirements and scheduling',
        status: 'pending',
        documents: []
      },
      {
        id: 'resource-3',
        title: 'Material Procurement Plan',
        description: 'Create schedule for ordering and delivering materials',
        status: 'pending',
        documents: []
      }
    ]
  }
];

const PreConstructionPlanComponent: React.FC<PreConstructionPlanProps> = ({ projectId }) => {
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
    
    // In a real application, you would save this to the database
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium">Pre-Construction Checklist</CardTitle>
            <Button 
              onClick={savePlan} 
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Plan'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <PreConstructionChecklist 
            sections={sections}
            onUpdateItem={handleUpdateItem}
            onAddItem={handleAddItem}
            onAddDocument={handleAddDocument}
          />
        </CardContent>
      </Card>

      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={newItem.title || ''} 
                onChange={(e) => setNewItem({...newItem, title: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={newItem.description || ''} 
                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date (Optional)</Label>
              <Input 
                id="dueDate" 
                type="date" 
                value={newItem.dueDate || ''} 
                onChange={(e) => setNewItem({...newItem, dueDate: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddItemDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveNewItem}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PreConstructionPlanComponent;
