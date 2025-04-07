
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/hooks/useTenantContext';
import ProjectForm, { ProjectFormData } from './ProjectForm';

interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ 
  open, 
  onClose,
  onSuccess
}) => {
  const { toast } = useToast();
  const { currentTenant } = useTenantContext();
  
  const handleSubmit = async (data: ProjectFormData) => {
    try {
      const { error } = await supabase
        .from('projects')
        .insert({
          name: data.name,
          site_address: data.location,
          start_date: new Date(data.startDate).toISOString(),
          end_date: new Date(data.endDate).toISOString(),
          status: 'planned',
          tenant_id: currentTenant?.id || '',
          electrical_category: data.electricalCategory,
          permit_number: data.permitNumber || null
        });
      
      if (error) throw error;
      
      toast({
        title: "Project created",
        description: "New project has been successfully created"
      });
      
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        
        <ProjectForm 
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default NewProjectModal;
