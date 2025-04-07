
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProjectType } from '@/components/equipment/types';
import ProjectCard from './ProjectCard';

interface ProjectListProps {
  projects: ProjectType[];
  isLoading: boolean;
  searchQuery: string;
  statusFilter: string | null;
  categoryFilter: string | null;
  getStatusColor: (status: ProjectType['status']) => string;
}

const ProjectList: React.FC<ProjectListProps> = ({ 
  projects, 
  isLoading, 
  searchQuery, 
  statusFilter, 
  categoryFilter,
  getStatusColor 
}) => {
  // Filter projects based on search query and filters
  const filteredProjects = projects.filter(
    project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.site_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.permit_number?.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesStatus = !statusFilter || project.status === statusFilter;
      const matchesCategory = !categoryFilter || project.electrical_category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Timeline</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Electrical Info</TableHead>
            <TableHead>Resources</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                getStatusColor={getStatusColor} 
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                No projects found. {searchQuery || statusFilter || categoryFilter ? 'Try removing some filters.' : 'Create your first project!'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProjectList;
