
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProjectType } from '@/components/equipment/types';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import PageHeader from '@/components/common/PageHeader';
import ProjectDetails from '@/components/projects/ProjectDetails';

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          console.error('Error fetching project:', error);
          throw error;
        }
        
        setProject(data);
      } catch (error) {
        console.error('Error fetching project details:', error);
        toast({
          title: "Error",
          description: "Failed to load project details",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProject();
  }, [id]);

  const handleBack = () => {
    navigate('/projects');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={project ? project.name : 'Project Details'}
        description={project?.site_address || 'Loading project details...'}
        actions={
          <Button variant="outline" onClick={handleBack} size="sm">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Projects
          </Button>
        }
      />
      
      {isLoading ? (
        <Card className="p-8 flex justify-center">
          Loading project details...
        </Card>
      ) : project ? (
        <ProjectDetails project={project} />
      ) : (
        <Card className="p-8 flex justify-center">
          Project not found
        </Card>
      )}
    </div>
  );
};

export default ProjectDetailPage;
