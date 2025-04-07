
import React from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Check, Circle, AlertCircle } from 'lucide-react';

interface FeatureStatus {
  name: string;
  status: 'completed' | 'in-progress' | 'planned';
  description: string;
}

const implementationStatus: Record<string, FeatureStatus[]> = {
  'Core Features': [
    {
      name: 'Authentication',
      status: 'completed',
      description: 'User login, registration, and password reset functionality'
    },
    {
      name: 'Role-based Access Control',
      status: 'completed',
      description: 'Different permission levels for admin, manager, operator, and viewer roles'
    },
    {
      name: 'Multi-tenant Support',
      status: 'completed',
      description: 'Support for multiple organizations with isolated data'
    },
    {
      name: 'Settings Management',
      status: 'completed',
      description: 'User interface for managing application settings and preferences'
    }
  ],
  'Equipment Management': [
    {
      name: 'Equipment List & Details',
      status: 'completed',
      description: 'View and manage equipment inventory'
    },
    {
      name: 'Maintenance Tracking',
      status: 'in-progress',
      description: 'Schedule and track maintenance activities for equipment'
    },
    {
      name: 'Equipment Documents',
      status: 'in-progress',
      description: 'Store and manage documents related to equipment'
    }
  ],
  'Project Management': [
    {
      name: 'Project List & Details',
      status: 'completed',
      description: 'View and manage construction projects'
    },
    {
      name: 'Equipment Assignment',
      status: 'in-progress',
      description: 'Assign and track equipment usage on projects'
    }
  ],
  'GPS Integration': [
    {
      name: 'Equipment Location Tracking',
      status: 'in-progress',
      description: 'Real-time GPS tracking of equipment location'
    },
    {
      name: 'Geofencing',
      status: 'planned',
      description: 'Create virtual boundaries for equipment movement alerts'
    },
    {
      name: 'Route Optimization',
      status: 'planned',
      description: 'Optimize equipment movement between job sites'
    }
  ],
  'Analytics & Reporting': [
    {
      name: 'Dashboard',
      status: 'completed',
      description: 'Overview of key metrics and status indicators'
    },
    {
      name: 'Custom Reports',
      status: 'planned',
      description: 'Generate custom reports on equipment usage and project status'
    },
    {
      name: 'Data Export',
      status: 'planned',
      description: 'Export data in various formats (CSV, PDF)'
    }
  ],
  'User Experience': [
    {
      name: 'Theme Customization',
      status: 'completed',
      description: 'Customize application appearance with different themes'
    },
    {
      name: 'Feature Toggles',
      status: 'completed',
      description: 'Enable or disable features based on business needs'
    },
    {
      name: 'Mobile Responsiveness',
      status: 'in-progress',
      description: 'Optimized experience on mobile devices'
    }
  ]
};

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'completed':
      return <Check className="h-5 w-5 text-green-500" />;
    case 'in-progress':
      return <Circle className="h-5 w-5 text-amber-500" />;
    case 'planned':
      return <AlertCircle className="h-5 w-5 text-gray-400" />;
    default:
      return null;
  }
};

const ImplementationStatus = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Implementation Status</h3>
        <p className="text-sm text-muted-foreground">
          Overview of implemented features and upcoming development plans
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-8 text-sm pb-2 border-b">
          <div className="flex items-center">
            <Check className="h-4 w-4 text-green-500 mr-1.5" />
            <span>Completed</span>
          </div>
          <div className="flex items-center">
            <Circle className="h-4 w-4 text-amber-500 mr-1.5" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-gray-400 mr-1.5" />
            <span>Planned</span>
          </div>
        </div>

        <Accordion type="multiple" className="w-full">
          {Object.entries(implementationStatus).map(([category, features]) => (
            <AccordionItem value={category} key={category}>
              <AccordionTrigger className="text-base font-medium">
                {category}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  {features.map((feature) => (
                    <div key={feature.name} className="flex items-start">
                      <div className="mt-0.5 mr-3">
                        <StatusIcon status={feature.status} />
                      </div>
                      <div>
                        <h4 className="font-medium">{feature.name}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default ImplementationStatus;
