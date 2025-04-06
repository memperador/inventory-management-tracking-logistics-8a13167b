
import React from 'react';
import { Search, Plus, MapPin, Calendar, Users, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type Project = {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'planned';
  equipmentCount: number;
  teamSize: number;
};

const projectsData: Project[] = [
  {
    id: 'PRJ-001',
    name: 'Downtown High-rise Construction',
    location: '123 Main St, Metropolis',
    startDate: '2024-01-15',
    endDate: '2025-06-30',
    status: 'active',
    equipmentCount: 24,
    teamSize: 85
  },
  {
    id: 'PRJ-002',
    name: 'Highway Extension Phase 2',
    location: 'Route 66, Westside',
    startDate: '2024-02-01',
    endDate: '2024-11-15',
    status: 'active',
    equipmentCount: 38,
    teamSize: 120
  },
  {
    id: 'PRJ-003',
    name: 'Commercial Complex',
    location: '45 Business Park Ave',
    startDate: '2024-03-10',
    endDate: '2025-05-20',
    status: 'active',
    equipmentCount: 17,
    teamSize: 65
  },
  {
    id: 'PRJ-004',
    name: 'Warehouse Renovation',
    location: '89 Industrial Lane',
    startDate: '2024-02-15',
    endDate: '2024-07-10',
    status: 'active',
    equipmentCount: 12,
    teamSize: 30
  },
  {
    id: 'PRJ-005',
    name: 'Bridge Maintenance',
    location: 'Riverside Ave',
    startDate: '2024-01-05',
    endDate: '2024-03-20',
    status: 'completed',
    equipmentCount: 8,
    teamSize: 25
  },
  {
    id: 'PRJ-006',
    name: 'Solar Farm Installation',
    location: 'Rural Route 7',
    startDate: '2024-05-01',
    endDate: '2024-12-15',
    status: 'planned',
    equipmentCount: 15,
    teamSize: 45
  }
];

const getStatusColor = (status: Project['status']) => {
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

const Projects = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-gray-500 mt-1">Manage your project sites</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input 
          placeholder="Search projects..." 
          className="pl-9 mb-6"
        />
      </div>
      
      <div className="border rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Timeline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Resources</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectsData.map((project) => (
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
                    <span>{project.location}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span>
                      {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
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
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Package className="h-4 w-4 text-gray-400 mr-1" />
                      <span>{project.equipmentCount}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-1" />
                      <span>{project.teamSize}</span>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Projects;
