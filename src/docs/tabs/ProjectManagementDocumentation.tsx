
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Briefcase, 
  Clipboard, 
  Clock, 
  Users, 
  FileText, 
  TrendingUp, 
  Truck,
  Calendar,
  Tags
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ProjectManagementDocumentation: React.FC = () => {
  return (
    <div className="space-y-6 pb-4">
      <div className="flex items-center gap-2">
        <Briefcase className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Project Management</h2>
      </div>
      
      <p className="text-muted-foreground">
        The Project Management module provides comprehensive tools for planning, tracking, and managing 
        construction and trade projects, with robust asset tracking capabilities.
      </p>
      
      <Card>
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
          <CardDescription>
            Create and manage projects with detailed information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Clipboard className="h-5 w-5 text-amber-600" />
                <h3 className="font-medium">Project Creation</h3>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Define project name, description, and location</li>
                <li>Set project timeline with start/end dates</li>
                <li>Add client information and contacts</li>
                <li>Assign project managers and team members</li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium">Team Management</h3>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Assign team members to specific projects</li>
                <li>Define role-based responsibilities</li>
                <li>Track individual and team performance</li>
                <li>Manage contact information and availability</li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-green-600" />
                <h3 className="font-medium">Timeline Planning</h3>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Create detailed project schedules</li>
                <li>Set milestones and track progress</li>
                <li>Configure automated deadline reminders</li>
                <li>Visualize timelines with Gantt charts</li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <h3 className="font-medium">Documentation</h3>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Store project plans and specifications</li>
                <li>Manage permits and compliance documents</li>
                <li>Maintain inspection records</li>
                <li>Generate project reports and analytics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Asset Management</CardTitle>
          <CardDescription>
            Track and manage all equipment and materials assigned to projects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            The asset management system allows you to assign, track, and monitor all equipment and materials 
            used across your projects, with comprehensive allocation and status tracking capabilities.
          </p>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="asset-assignment">
              <AccordionTrigger>Asset Assignment</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    Easily assign assets from your inventory to specific projects while maintaining 
                    complete visibility of equipment location and availability.
                  </p>
                  <div className="rounded-md bg-muted p-3 text-sm">
                    <p className="font-medium mb-1">Key Features:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Drag-and-drop asset assignment interface</li>
                      <li>Bulk assignment capabilities for equipment groups</li>
                      <li>Timeline visualization of equipment allocation</li>
                      <li>Availability conflicts detection and resolution</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="asset-tracking">
              <AccordionTrigger>Real-time Tracking</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    Monitor the location, status, and condition of all assets in real-time with 
                    comprehensive tracking capabilities.
                  </p>
                  <div className="rounded-md bg-muted p-3 text-sm">
                    <p className="font-medium mb-1">Tracking Technologies:</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="outline">GPS Tracking</Badge>
                      <Badge variant="outline">QR Code Scanning</Badge>
                      <Badge variant="outline">RFID Integration</Badge>
                      <Badge variant="outline">Bluetooth Beacons</Badge>
                    </div>
                    <p className="italic text-muted-foreground">
                      "Asset tracking provides real-time visibility into equipment location and status, 
                      reducing search time by 74% and helping prevent loss and theft."
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="asset-maintenance">
              <AccordionTrigger>Maintenance Scheduling</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    Schedule and track maintenance activities for assets assigned to projects to 
                    minimize downtime and extend equipment lifespan.
                  </p>
                  <div className="rounded-md bg-muted p-3 text-sm">
                    <p className="font-medium mb-1">Maintenance Features:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Automated maintenance schedule based on usage</li>
                      <li>Service history tracking for all equipment</li>
                      <li>Integration with maintenance provider calendars</li>
                      <li>Parts and supplies inventory management</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <Separator className="my-4" />
          
          <div>
            <h3 className="font-medium mb-2">Asset Status Tracking</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 border rounded-md">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Available</span>
                  <Badge className="bg-green-500">Ready</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Assets ready for assignment</p>
              </div>
              
              <div className="p-3 border rounded-md">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">In Use</span>
                  <Badge className="bg-blue-500">Active</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Currently assigned assets</p>
              </div>
              
              <div className="p-3 border rounded-md">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">In Transit</span>
                  <Badge className="bg-amber-500">Moving</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Assets being transported</p>
              </div>
              
              <div className="p-3 border rounded-md">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Maintenance</span>
                  <Badge className="bg-red-500">Service</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Under repair or service</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Project Analytics</CardTitle>
          <CardDescription>
            Gain insights into project performance and resource utilization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4 flex-col md:flex-row">
              <div className="flex-1 border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-medium">Performance Tracking</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Monitor project progress against timeline and budget targets with real-time
                  analytics and deviation alerts.
                </p>
              </div>
              
              <div className="flex-1 border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                  <h3 className="font-medium">Resource Utilization</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Analyze equipment and personnel utilization to identify optimization 
                  opportunities and reduce idle resources.
                </p>
              </div>
              
              <div className="flex-1 border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <h3 className="font-medium">Timeline Analysis</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Identify scheduling bottlenecks and critical path dependencies to
                  optimize project timelines and resource allocation.
                </p>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div>
              <h3 className="font-medium mb-2">Report Types</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                <div className="p-3 border rounded-md flex flex-col items-center text-center">
                  <Tags className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm font-medium">Asset Utilization</span>
                </div>
                
                <div className="p-3 border rounded-md flex flex-col items-center text-center">
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm font-medium">Team Performance</span>
                </div>
                
                <div className="p-3 border rounded-md flex flex-col items-center text-center">
                  <TrendingUp className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm font-medium">Progress Reports</span>
                </div>
                
                <div className="p-3 border rounded-md flex flex-col items-center text-center">
                  <Clock className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm font-medium">Timeline Variance</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex justify-center">
            <Link to="/projects">
              <Button className="gap-2">
                <Briefcase size={16} />
                <span>View Projects</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectManagementDocumentation;
