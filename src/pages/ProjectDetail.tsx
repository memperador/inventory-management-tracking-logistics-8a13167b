
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
import { AlertCircle } from 'lucide-react';

const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<ProjectType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setError("No project ID provided");
        setIsLoading(false);
        return;
      }
      
      try {
        console.log('Fetching project with ID:', projectId);
        
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();
        
        if (error) {
          console.error('Error fetching project:', error);
          throw error;
        }
        
        if (!data) {
          setError("Project not found");
        } else {
          console.log('Project data retrieved:', data);
          setProject(data);
        }
      } catch (error) {
        console.error('Error fetching project details:', error);
        setError("Failed to load project details");
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
  }, [projectId, toast]);

  const handleBack = () => {
    navigate('/projects');
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader
          title="Loading Project..."
          description="Please wait while we load the project details"
          actions={
            <Button variant="outline" onClick={handleBack} size="sm">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Projects
            </Button>
          }
        />
        <Card className="p-8 flex justify-center">
          Loading project details...
        </Card>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader
          title="Project Not Found"
          description="The requested project could not be found"
          actions={
            <Button variant="outline" onClick={handleBack} size="sm">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Projects
            </Button>
          }
        />
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Project Not Available</h2>
            <p className="text-muted-foreground mb-6">
              {error || "The project you're looking for doesn't exist or has been removed."}
            </p>
            <Button onClick={handleBack}>
              Return to Projects List
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={project.name}
        description={project.site_address || 'No address provided'}
        actions={
          <Button variant="outline" onClick={handleBack} size="sm">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Projects
          </Button>
        }
      />
      
      <ProjectDetails project={project} />
    </div>
  );
};

export default ProjectDetailPage;
