
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const GeneralDocumentation: React.FC = () => {
  return (
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
  );
};

export default GeneralDocumentation;
