import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from 'react-router-dom';
import AIAssistantDocumentation from '@/components/docs/AIAssistantDocumentation';

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
        <TabsList className="grid grid-cols-6 w-full mb-4">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="gps-integration">GPS Integration</TabsTrigger>
          <TabsTrigger value="asset-tracking">Asset Tracking</TabsTrigger>
          <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
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

        <TabsContent value="asset-tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset Tracking Technologies</CardTitle>
              <CardDescription>
                Comparison of RFID and QR Code/GPS tracking solutions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">RFID Technology</h3>
                <p className="mb-3">
                  Radio-frequency identification (RFID) uses electromagnetic fields to automatically identify and track 
                  tags attached to objects.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-lg text-amber-600">Active RFID</h4>
                    <p className="text-sm mb-2">Battery-powered tags with broadcasting capability (range up to 100m)</p>
                    <div className="mt-2">
                      <h5 className="font-medium">Advantages:</h5>
                      <ul className="list-disc ml-5 text-sm">
                        <li>Long read range (up to 100 meters)</li>
                        <li>Real-time location tracking</li>
                        <li>No line-of-sight required</li>
                        <li>Supports sensor integration (temperature, humidity)</li>
                      </ul>
                    </div>
                    <div className="mt-2">
                      <h5 className="font-medium">Disadvantages:</h5>
                      <ul className="list-disc ml-5 text-sm">
                        <li>Higher cost ($15-50 per tag)</li>
                        <li>Requires battery replacement</li>
                        <li>Larger tag size</li>
                      </ul>
                    </div>
                    <div className="mt-2">
                      <h5 className="font-medium">Best Used For:</h5>
                      <ul className="list-disc ml-5 text-sm">
                        <li>High-value equipment tracking</li>
                        <li>Items that move frequently between locations</li>
                        <li>When real-time location data is critical</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-lg text-amber-600">Passive RFID</h4>
                    <p className="text-sm mb-2">No battery needed, powered by reader's signal (range up to 10m)</p>
                    <div className="mt-2">
                      <h5 className="font-medium">Advantages:</h5>
                      <ul className="list-disc ml-5 text-sm">
                        <li>Lower cost ($0.10-$5 per tag)</li>
                        <li>No battery required (unlimited lifespan)</li>
                        <li>Smaller tag size, various form factors</li>
                        <li>Bulk scanning capability</li>
                      </ul>
                    </div>
                    <div className="mt-2">
                      <h5 className="font-medium">Disadvantages:</h5>
                      <ul className="list-disc ml-5 text-sm">
                        <li>Shorter read range (few centimeters to 10 meters)</li>
                        <li>Not suitable for real-time tracking</li>
                        <li>Signal interference with metals and liquids</li>
                      </ul>
                    </div>
                    <div className="mt-2">
                      <h5 className="font-medium">Best Used For:</h5>
                      <ul className="list-disc ml-5 text-sm">
                        <li>Inventory counts and audits</li>
                        <li>Access control systems</li>
                        <li>Tool tracking in controlled environments</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold">QR Codes & GPS Tracking</h3>
                <p className="mb-3">
                  Alternative tracking methods that can be used alone or in combination with RFID.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-lg text-amber-600">QR Codes</h4>
                    <p className="text-sm mb-2">Machine-readable optical labels that contain information about the item</p>
                    <div className="mt-2">
                      <h5 className="font-medium">Advantages:</h5>
                      <ul className="list-disc ml-5 text-sm">
                        <li>Extremely low cost (cents to print)</li>
                        <li>Easily generated and replaced</li>
                        <li>Scannable with standard smartphones</li>
                        <li>Can store substantial information</li>
                      </ul>
                    </div>
                    <div className="mt-2">
                      <h5 className="font-medium">Disadvantages:</h5>
                      <ul className="list-disc ml-5 text-sm">
                        <li>Requires line-of-sight for scanning</li>
                        <li>Vulnerable to physical damage</li>
                        <li>Manual scanning process (one at a time)</li>
                        <li>No automated tracking capability</li>
                      </ul>
                    </div>
                    <div className="mt-2">
                      <h5 className="font-medium">Best Used For:</h5>
                      <ul className="list-disc ml-5 text-sm">
                        <li>Low-cost tracking solution</li>
                        <li>When smartphone scanning is preferred</li>
                        <li>Items in clean, controlled environments</li>
                        <li>When detailed information needs to be embedded</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-lg text-amber-600">GPS Tracking</h4>
                    <p className="text-sm mb-2">Global Positioning System for worldwide location tracking</p>
                    <div className="mt-2">
                      <h5 className="font-medium">Advantages:</h5>
                      <ul className="list-disc ml-5 text-sm">
                        <li>Precise location data (within meters)</li>
                        <li>Global coverage outdoors</li>
                        <li>Real-time tracking capabilities</li>
                        <li>Movement alerts and geofencing</li>
                      </ul>
                    </div>
                    <div className="mt-2">
                      <h5 className="font-medium">Disadvantages:</h5>
                      <ul className="list-disc ml-5 text-sm">
                        <li>Higher cost ($50-500 per tracker)</li>
                        <li>Requires power source (battery)</li>
                        <li>Limited functionality indoors</li>
                        <li>Ongoing cellular data costs</li>
                      </ul>
                    </div>
                    <div className="mt-2">
                      <h5 className="font-medium">Best Used For:</h5>
                      <ul className="list-disc ml-5 text-sm">
                        <li>Vehicles and heavy equipment</li>
                        <li>High-value assets used outdoors</li>
                        <li>Theft prevention and recovery</li>
                        <li>Equipment deployed in remote locations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold">Hybrid Tracking Strategy</h3>
                <p className="mb-3">
                  Many organizations achieve optimal results by implementing a tiered tracking approach.
                </p>
                
                <div className="border rounded-lg p-4 mb-4">
                  <h4 className="font-medium">Recommended Implementation</h4>
                  <p className="mb-2 text-sm">
                    For construction equipment management, we recommend a multi-tiered approach:
                  </p>
                  
                  <div className="grid md:grid-cols-3 gap-4 mb-2">
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md">
                      <h5 className="font-medium text-amber-700 dark:text-amber-400">Tier 1: GPS Tracking</h5>
                      <p className="text-xs mb-1">For high-value assets ($25,000+)</p>
                      <ul className="list-disc ml-4 text-xs">
                        <li>Heavy machinery</li>
                        <li>Vehicles</li>
                        <li>Generators</li>
                        <li>Mobile offices</li>
                      </ul>
                    </div>
                    
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md">
                      <h5 className="font-medium text-amber-700 dark:text-amber-400">Tier 2: Active RFID</h5>
                      <p className="text-xs mb-1">For mid-value assets ($1,000-$25,000)</p>
                      <ul className="list-disc ml-4 text-xs">
                        <li>Power tools</li>
                        <li>Specialized equipment</li>
                        <li>IT equipment</li>
                        <li>Testing devices</li>
                      </ul>
                    </div>
                    
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md">
                      <h5 className="font-medium text-amber-700 dark:text-amber-400">Tier 3: Passive RFID/QR</h5>
                      <p className="text-xs mb-1">For lower-value assets (Under $1,000)</p>
                      <ul className="list-disc ml-4 text-xs">
                        <li>Hand tools</li>
                        <li>Safety equipment</li>
                        <li>Consumable inventory</li>
                        <li>Office equipment</li>
                      </ul>
                    </div>
                  </div>
                  
                  <p className="text-sm mt-3">
                    This system optimizes tracking investments by matching technology cost with asset value and 
                    criticality, while providing a comprehensive inventory management solution.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium">System Integration</h4>
                  <p className="text-sm mb-2">
                    The FleetTrack platform supports all tracking technologies through:
                  </p>
                  <ul className="list-disc ml-5 text-sm">
                    <li>API integrations with major GPS providers</li>
                    <li>RFID reader compatibility and data import</li>
                    <li>Mobile app for QR code scanning (coming soon)</li>
                    <li>Unified dashboard showing all asset locations regardless of tracking method</li>
                    <li>Automated alerts for movement, maintenance, and compliance across all tracking technologies</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-assistant" className="space-y-4">
          <ScrollArea className="h-[750px] pr-4">
            <AIAssistantDocumentation />
          </ScrollArea>
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
