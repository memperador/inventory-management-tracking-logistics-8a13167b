
import React from 'react';
import { MapPin, Calendar, Users, Package, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { ProjectType } from '@/components/equipment/types';

interface ProjectCardProps {
  project: ProjectType;
  getStatusColor: (status: ProjectType['status']) => string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, getStatusColor }) => {
  return (
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
  );
};

export default ProjectCard;
