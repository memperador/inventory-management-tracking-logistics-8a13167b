import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import NewProjectModal from '@/components/projects/NewProjectModal';
import { ProjectType } from '@/components/equipment/types';
import ProjectFilters from '@/components/projects/ProjectFilters';
import ProjectList from '@/components/projects/ProjectList';
import PageHeader from '@/components/common/PageHeader';
import { getStatusColor, ELECTRICAL_CATEGORIES } from '@/components/projects/projectUtils';

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch projects with equipment counts
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*');

      if (projectsError) throw projectsError;

      // For each project, get equipment count
      const projectsWithCounts = await Promise.all(projectsData.map(async (project) => {
        // Get equipment count
        const { count: equipmentCount, error: countError } = await supabase
          .from('project_equipment')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', project.id)
          .is('removed_date', null);
        
        if (countError) console.error('Error counting equipment:', countError);
        
        // Transform data to match the Project type
        return {
          ...project,
          equipment_count: equipmentCount || 0,
          team_size: 0,
          electrical_category: project.electrical_category || 'Unspecified',
          permit_number: project.permit_number || 'Not assigned'
        };
      }));

      setProjects(projectsWithCounts);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error fetching projects",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const clearFilters = () => {
    setStatusFilter(null);
    setCategoryFilter(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage your project sites and their equipment"
        actions={
          <Button onClick={() => setShowNewProjectModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        }
      />
      
      <ProjectFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        clearFilters={clearFilters}
        ELECTRICAL_CATEGORIES={ELECTRICAL_CATEGORIES}
      />
      
      <ProjectList 
        projects={projects}
        isLoading={isLoading}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
        getStatusColor={getStatusColor}
      />

      <NewProjectModal 
        open={showNewProjectModal} 
        onClose={() => setShowNewProjectModal(false)}
        onSuccess={fetchProjects}
      />
    </div>
  );
};

export default Projects;
