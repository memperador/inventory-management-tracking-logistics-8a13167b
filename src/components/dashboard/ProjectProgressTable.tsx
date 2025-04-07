
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const projectData = [
  {
    id: '1',
    name: 'Highway Expansion',
    progress: 72,
    status: 'active',
    equipment: 18
  },
  {
    id: '2',
    name: 'Commercial Complex',
    progress: 45,
    status: 'active',
    equipment: 12
  },
  {
    id: '3',
    name: 'Bridge Maintenance',
    progress: 90,
    status: 'completing',
    equipment: 7
  },
  {
    id: '4',
    name: 'Residential Towers',
    progress: 30,
    status: 'active',
    equipment: 14
  }
];

const statusColors = {
  active: "bg-green-100 text-green-800",
  completing: "bg-blue-100 text-blue-800",
  planning: "bg-yellow-100 text-yellow-800",
  delayed: "bg-red-100 text-red-800"
};

const ProjectProgressTable = () => {
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
              <TableHead className="text-right">Equipment Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectData.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.name}</TableCell>
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
                <TableCell className="text-right">{project.equipment}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ProjectProgressTable;
