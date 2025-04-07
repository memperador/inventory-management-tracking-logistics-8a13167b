
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from 'react-router-dom';

const ApplicationDocumentation = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Application Documentation</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive documentation of features and functionality
        </p>
      </div>

      <Tabs defaultValue="inventory">
        <TabsList className="grid grid-cols-4 w-full mb-4">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="gps-integration">GPS Integration</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>
                Complete inventory tracking and management system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Overview</h3>
                <p>
                  The inventory management system allows users to track equipment, manage maintenance schedules,
                  and ensure compliance with industry standards.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Key Features</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Equipment tracking with detailed information</li>
                  <li>Multiple view modes (grid, list, compact)</li>
                  <li>Filtering by category, status, and search</li>
                  <li>Import/export functionality (JSON and CSV formats)</li>
                  <li>Vendor integration capabilities</li>
                  <li>New item creation with comprehensive form</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Interface Components</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>InventoryHeader</strong> - Contains import/export functions and vendor integration toggle</li>
                  <li><strong>InventoryFilters</strong> - Search, category, and status filters</li>
                  <li><strong>InventoryCategoryTabs</strong> - Quick category selection tabs</li>
                  <li><strong>InventoryViewSelector</strong> - Toggle between grid, list, and compact views</li>
                  <li><strong>Equipment Views</strong> - Three different ways to display equipment data</li>
                  <li><strong>EmptyInventoryState</strong> - Displayed when no items match current filters</li>
                  <li><strong>NewInventoryItemDialog</strong> - Form for adding new equipment items</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Management</CardTitle>
              <CardDescription>
                Track and manage compliance requirements for equipment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Compliance Alerts System</h3>
                <p>
                  The compliance alerts system tracks maintenance schedules, certification expirations, 
                  and inspection requirements to ensure equipment remains compliant with regulations.
                </p>
                
                <h4 className="font-medium mt-3">Alert Types</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Maintenance Alerts</strong> - For overdue or upcoming maintenance</li>
                  <li><strong>Certification Alerts</strong> - For expired or expiring certifications</li>
                  <li><strong>Inspection Alerts</strong> - For overdue or upcoming inspections</li>
                </ul>
                
                <h4 className="font-medium mt-3">Alert Management Flow</h4>
                <ol className="list-decimal pl-6 space-y-1">
                  <li>Alerts are automatically generated based on equipment data</li>
                  <li>Initial alerts have an "Open" status</li>
                  <li>Users can "Acknowledge" alerts to indicate they're being addressed</li>
                  <li>Users can "Resolve" alerts when the issue has been handled</li>
                  <li>Maintenance alerts are automatically resolved when maintenance is completed</li>
                </ol>
                
                <h4 className="font-medium mt-3">Data Persistence</h4>
                <p>
                  Alert status and history are stored in localStorage to maintain state between sessions.
                  When equipment data changes, the system automatically updates related alerts.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold">Maintenance Tracker</h3>
                <p>
                  The maintenance tracker monitors changes to equipment maintenance dates and automatically
                  records maintenance history.
                </p>
                
                <h4 className="font-medium mt-3">Features</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Tracks both scheduled and completed maintenance</li>
                  <li>Maintains a history of maintenance updates</li>
                  <li>Automatically resolves maintenance-related compliance alerts</li>
                  <li>Data persists between sessions using localStorage</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold">Compliance Reports</h3>
                <p>
                  Generate reports on different aspects of compliance across your equipment inventory.
                </p>
                
                <h4 className="font-medium mt-3">Report Types</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Maintenance Reports</strong> - Details on maintenance history and upcoming needs</li>
                  <li><strong>Certification Reports</strong> - Information on certification status and expiration</li>
                  <li><strong>Compliance Status Reports</strong> - Overall compliance statistics and summaries</li>
                </ul>
                
                <h4 className="font-medium mt-3">Export Options</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Download as JSON file</li>
                  <li>Print reports directly</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold">Compliance Status Dashboard</h3>
                <p>
                  Visual dashboard showing overall compliance status across equipment inventory.
                </p>
                
                <h4 className="font-medium mt-3">Dashboard Components</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Overall compliance score</li>
                  <li>Industry code compliance metrics</li>
                  <li>Maintenance compliance status</li>
                  <li>Certification status</li>
                  <li>Lists of equipment needing attention</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gps-integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>GPS Integration System</CardTitle>
              <CardDescription>
                Track GPS implementation progress and manage integration tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Checklist System</h3>
                <p>
                  The GPS Integration page provides a comprehensive checklist system to track and manage
                  the implementation of GPS features across your equipment.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Categories</h3>
                <p>Tasks are organized into the following categories:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Hardware</strong> - Physical GPS devices and installation</li>
                  <li><strong>Software</strong> - API integration and data processing</li>
                  <li><strong>Testing</strong> - Validation and quality assurance</li>
                  <li><strong>Deployment</strong> - Rollout and staff training</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Features</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Task Management</strong> - Add, complete, and delete checklist items</li>
                  <li><strong>Category Organization</strong> - Collapsible categories for better organization</li>
                  <li><strong>Progress Tracking</strong> - Visual indication of completed tasks</li>
                  <li><strong>Save Functionality</strong> - Save checklist state (currently mocked)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Components</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>AddTaskForm</strong> - Form to create new checklist items</li>
                  <li><strong>ChecklistCategory</strong> - Collapsible category container</li>
                  <li><strong>ChecklistItems</strong> - List of tasks within each category</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Data Storage</h3>
                <p>
                  Currently, checklist data is stored in memory and lost on page refresh.
                  Future enhancements will include persistent storage.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Application Features</CardTitle>
              <CardDescription>
                Common functionality across the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Authentication</h3>
                <p>
                  The application includes a role-based authentication system with the following roles:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Viewer</strong> - Basic access with limited permissions</li>
                  <li><strong>Operator</strong> - Standard operational permissions</li>
                  <li><strong>Manager</strong> - Enhanced permissions including reports</li>
                  <li><strong>Admin</strong> - Full access to all features</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Navigation</h3>
                <p>
                  The application uses a sidebar navigation system with role-based access control.
                  Different roles see different navigation options based on their permissions.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Theme Support</h3>
                <p>
                  The application supports light and dark themes, which can be toggled in the settings page.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">User Interface Components</h3>
                <p>
                  The application uses a component library built on Shadcn UI, providing consistent
                  design patterns across the application.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Data Management</h3>
                <p>
                  The application includes:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Form validation using Zod schemas</li>
                  <li>React Hook Form for form state management</li>
                  <li>React Query for data fetching (where applicable)</li>
                  <li>Local storage for persisting certain application states</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApplicationDocumentation;
