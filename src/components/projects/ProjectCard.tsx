
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { ProjectType } from '@/components/equipment/types';
import { Badge } from '@/components/ui/badge';
import { Buildings, Calendar, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProjectCardProps {
  project: ProjectType;
  getStatusColor: (status: ProjectType['status']) => string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, getStatusColor }) => {
  const navigate = useNavigate();
  
  const handleRowClick = () => {
    navigate(`/project/${project.id}`);
  };
  
  return (
    <TableRow 
      className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800" 
      onClick={handleRowClick}
    >
      <TableCell>
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-slate-100 p-2 dark:bg-slate-800">
            <Buildings className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </div>
          <div>
            <div className="font-medium">{project.name}</div>
            <div className="text-xs text-muted-foreground">ID: {project.id.slice(0, 8)}</div>
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        {project.site_address || 'No address'}
      </TableCell>
      
      <TableCell>
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>
            {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'} - 
            {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Not set'}
          </span>
        </div>
      </TableCell>
      
      <TableCell>
        <Badge className={getStatusColor(project.status)}>
          {project.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1) : 'Unknown'}
        </Badge>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center">
          <Zap className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{project.electrical_category || 'Unspecified'}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Permit: {project.permit_number || 'Not assigned'}
        </div>
      </TableCell>
      
      <TableCell>
        <div className="text-sm">
          <div className="flex items-center justify-between">
            <span>Equipment:</span>
            <span className="font-medium">{project.equipment_count || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Team:</span>
            <span className="font-medium">{project.team_size || 0}</span>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ProjectCard;
