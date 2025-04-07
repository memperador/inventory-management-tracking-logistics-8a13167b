
import React, { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Calendar, Users, Package, Filter, ChevronDown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import NewProjectModal from '@/components/projects/NewProjectModal';
import { Json } from '@/integrations/supabase/types';
import { ProjectType } from '@/components/equipment/types';

const getStatusColor = (status: ProjectType['status']) => {
  switch (status) {
    case 'active':
      return 'bg-inventory-green-light text-inventory-green border-inventory-green';
    case 'completed':
      return 'bg-inventory-blue-light text-inventory-blue border-inventory-blue';
    case 'planned':
      return 'bg-inventory-yellow-light text-inventory-yellow border-inventory-yellow';
    default:
      return '';
  }
};

const ELECTRICAL_CATEGORIES = ['Residential', 'Commercial', 'Industrial', 'Maintenance', 'Emergency'];

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch projects
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*');

      if (error) throw error;

      // Transform data to match the Project type
      const transformedData: ProjectType[] = data.map(project => ({
        ...project,
        equipment_count: 0, // These would be calculated or fetched in a real app
        team_size: 0,
        electrical_category: project.electrical_category || 'Unspecified',
        permit_number: project.permit_number || 'Not assigned'
      }));

      setProjects(transformedData);
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

  const clearFilters = () => {
    setStatusFilter(null);
    setCategoryFilter(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-gray-500 mt-1">Manage your project sites</p>
        </div>
        <Button onClick={() => setShowNewProjectModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search projects by name, location, or permit #..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Filter className="h-4 w-4" />
                Status
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('planned')}>
                Planned
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
                Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Zap className="h-4 w-4" />
                Category
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {ELECTRICAL_CATEGORIES.map(category => (
                <DropdownMenuItem 
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {(statusFilter || categoryFilter) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <p>Loading projects...</p>
        </div>
      ) : (
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
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-gray-500">{project.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{project.site_address || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span>
                          {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'} - 
                          {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(project.status)} capitalize`}
                      >
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center">
                          <Zap className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm">{project.electrical_category || 'Unspecified'}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Permit: {project.permit_number || 'Not assigned'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 text-gray-400 mr-1" />
                          <span>{project.equipment_count}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-gray-400 mr-1" />
                          <span>{project.team_size}</span>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
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
      )}

      <NewProjectModal 
        open={showNewProjectModal} 
        onClose={() => setShowNewProjectModal(false)}
        onSuccess={fetchProjects}
      />
    </div>
  );
};

export default Projects;
