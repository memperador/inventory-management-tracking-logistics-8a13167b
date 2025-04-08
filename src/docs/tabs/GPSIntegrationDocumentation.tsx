
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const GPSIntegrationDocumentation: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>GPS Integration System</CardTitle>
        <CardDescription>
          Track GPS implementation progress, visualize equipment locations, and leverage AI insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="map">Map Visualization</TabsTrigger>
            <TabsTrigger value="checklist">Checklist System</TabsTrigger>
            <TabsTrigger value="intelligence">AI Intelligence</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="pt-4 space-y-4">
            <div>
              <h3 className="text-lg font-semibold">GPS Integration Platform</h3>
              <p className="mt-2">
                The GPS Integration platform provides comprehensive tools for tracking equipment location, 
                managing implementation tasks, and gaining insights through AI analysis. The system is divided
                into three main components:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Map Visualization</strong> - View real-time equipment locations on an interactive map</li>
                <li><strong>Implementation Checklist</strong> - Track and manage GPS integration tasks</li>
                <li><strong>AI Intelligence</strong> - Get insights and optimization recommendations through AI</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">Key Benefits</h3>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Real-time Tracking</strong> - Monitor equipment location across all job sites</li>
                <li><strong>Implementation Management</strong> - Organized checklist to track integration progress</li>
                <li><strong>AI-powered Insights</strong> - Optimize equipment usage based on GPS data analysis</li>
                <li><strong>Geofencing</strong> - Set boundaries and receive alerts when equipment leaves designated areas</li>
                <li><strong>Maintenance Prediction</strong> - Use movement patterns to predict maintenance needs</li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="map" className="pt-4 space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Map Visualization</h3>
              <p className="mt-2">
                The map visualization component shows real-time locations of all GPS-equipped machinery
                and vehicles across your job sites.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">Features</h3>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Real-time Tracking</strong> - See equipment positions updated every 15 minutes</li>
                <li><strong>Equipment Status</strong> - Visual indicators for active, idle, and inactive equipment</li>
                <li><strong>Search Functionality</strong> - Quickly find specific equipment by name or ID</li>
                <li><strong>Equipment Details</strong> - View last update time and status for each item</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">Implementation Notes</h3>
              <p className="mt-2">
                For production use, you'll need to provide a map provider API key. The system currently
                supports integration with popular mapping services. GPS data is stored securely in your
                Supabase database and updated via the API.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="checklist" className="pt-4 space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Checklist System</h3>
              <p className="mt-2">
                The GPS Integration checklist provides a comprehensive system to track and manage
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
          </TabsContent>
          
          <TabsContent value="intelligence" className="pt-4 space-y-4">
            <div>
              <h3 className="text-lg font-semibold">AI Intelligence</h3>
              <p className="mt-2">
                The GPS Intelligence system uses AI to analyze GPS data and provide insights and
                recommendations for optimizing equipment usage and maintenance.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">Features</h3>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Movement Pattern Analysis</strong> - Identify inefficient routes and usage patterns</li>
                <li><strong>Maintenance Prediction</strong> - Predict maintenance needs based on abnormal movement</li>
                <li><strong>Idle Time Detection</strong> - Identify underutilized equipment</li>
                <li><strong>Route Optimization</strong> - Get recommendations for more efficient equipment routing</li>
                <li><strong>Natural Language Interface</strong> - Ask questions about your GPS data in plain English</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">AI Integration</h3>
              <p className="mt-2">
                The system can connect to AI services like Perplexity or your own Large Language Model (LLM)
                through API integration. For production use, securely store your API keys in Supabase environment
                variables rather than in the frontend application.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div>
          <h3 className="text-lg font-semibold">Data Storage</h3>
          <p className="mt-2">
            Currently, GPS and checklist data is stored in memory and lost on page refresh.
            For production use, the system will integrate with your Supabase database to provide
            persistent storage of all GPS data, tracking history, and implementation progress.
          </p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold">Next Steps</h3>
          <p className="mt-2">
            To fully implement this system in production:
          </p>
          <ol className="list-decimal pl-6 space-y-2 mt-2">
            <li>Set up a Supabase table structure for GPS data and checklist items</li>
            <li>Configure secure storage for map provider and AI service API keys</li>
            <li>Implement real-time data synchronization between devices</li>
            <li>Set up alert notifications for geofence violations or inactive equipment</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default GPSIntegrationDocumentation;
