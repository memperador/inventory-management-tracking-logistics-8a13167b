
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePreConstructionPlan } from './hooks/usePreConstructionPlan';
import PreConstructionChecklist from './PreConstructionChecklist';
import AddItemDialog from './components/AddItemDialog';

interface PreConstructionPlanProps {
  projectId: string;
}

const PreConstructionPlanComponent: React.FC<PreConstructionPlanProps> = ({ projectId }) => {
  const {
    sections,
    isLoading,
    isAddItemDialogOpen,
    setIsAddItemDialogOpen,
    newItem,
    setNewItem,
    handleUpdateItem,
    handleAddItem,
    handleAddDocument,
    handleSaveNewItem,
    savePlan
  } = usePreConstructionPlan({ projectId });

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

      <AddItemDialog
        open={isAddItemDialogOpen}
        onOpenChange={setIsAddItemDialogOpen}
        onSave={handleSaveNewItem}
        newItem={newItem}
        setNewItem={setNewItem}
      />
    </div>
  );
};

export default PreConstructionPlanComponent;
