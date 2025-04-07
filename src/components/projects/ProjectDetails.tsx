
import React from 'react';
import { ProjectType } from '@/components/equipment/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Calendar, FileText, Zap, MapPin } from 'lucide-react';
import { getStatusColor } from './projectUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectAssets from './ProjectAssets';

interface ProjectDetailsProps {
  project: ProjectType;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{project.name}</CardTitle>
              <div className="text-sm text-muted-foreground mt-1 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {project.site_address || 'No address provided'}
              </div>
            </div>
            <Badge className={getStatusColor(project.status)}>
              {project.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1) : 'Unknown'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Project Timeline</div>
                <div className="text-sm text-muted-foreground">
                  {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'} - 
                  {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Not set'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Zap className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Electrical Category</div>
                <div className="text-sm text-muted-foreground">
                  {project.electrical_category || 'Not specified'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Permit Number</div>
                <div className="text-sm text-muted-foreground">
                  {project.permit_number || 'Not assigned'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="assets" className="w-full">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="details">Additional Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="assets">
          <Card>
            <CardContent className="py-4">
              <ProjectAssets projectId={project.id} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="details">
          <Card>
            <CardContent className="py-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Project Description</h3>
                  <p className="text-sm text-muted-foreground">
                    No description available.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Location Details</h3>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {project.site_address || 'No address provided'}
                    </div>
                    <div className="mt-2">
                      No geofence coordinates available.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetails;
