
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { equipmentData } from '@/components/equipment/EquipmentData';
import { calculateDepreciation, formatCurrency } from '@/utils/depreciationUtils';

const projectData = [
  {
    id: '1',
    name: 'Highway Expansion',
    progress: 72,
    status: 'active',
    equipment: ['EQ-1234', 'EQ-5678', 'EQ-1122']
  },
  {
    id: '2',
    name: 'Commercial Complex',
    progress: 45,
    status: 'active',
    equipment: ['EQ-9012', 'EQ-3456']
  },
  {
    id: '3',
    name: 'Bridge Maintenance',
    progress: 90,
    status: 'completing',
    equipment: ['EQ-7890']
  },
  {
    id: '4',
    name: 'Residential Towers',
    progress: 30,
    status: 'active',
    equipment: ['EQ-3456', 'EQ-1122']
  }
];

const statusColors = {
  active: "bg-green-100 text-green-800",
  completing: "bg-blue-100 text-blue-800",
  planning: "bg-yellow-100 text-yellow-800",
  delayed: "bg-red-100 text-red-800"
};

const ProjectProgressTable = () => {
  // Calculate equipment count and cost for each project
  const projectsWithEquipmentData = projectData.map(project => {
    const projectEquipment = equipmentData.filter(eq => 
      project.equipment.includes(eq.id)
    );
    
    const equipmentCount = projectEquipment.length;
    const totalOriginalCost = projectEquipment.reduce((sum, eq) => sum + (eq.cost || 0), 0);
    const totalDepreciatedCost = projectEquipment.reduce((sum, eq) => sum + calculateDepreciation(eq), 0);
    
    return {
      ...project,
      equipmentCount,
      equipmentCost: totalOriginalCost,
      depreciatedCost: totalDepreciatedCost,
      depreciationPercentage: totalOriginalCost > 0 
        ? Math.round(((totalOriginalCost - totalDepreciatedCost) / totalOriginalCost) * 100)
        : 0
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Projects</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Equipment</TableHead>
              <TableHead className="text-right">Original Value</TableHead>
              <TableHead className="text-right">Current Value</TableHead>
              <TableHead className="text-right">Depreciation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectsWithEquipmentData.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">
                  <Link 
                    to={`/projects?id=${project.id}`} 
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {project.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">{project.progress}%</span>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[project.status] || "bg-gray-100 text-gray-800"} variant="outline">
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{project.equipmentCount} units</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(project.equipmentCost)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(project.depreciatedCost)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className="bg-amber-100 text-amber-800">
                    {project.depreciationPercentage}%
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ProjectProgressTable;
