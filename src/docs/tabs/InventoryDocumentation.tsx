
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const InventoryDocumentation: React.FC = () => {
  return (
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
  );
};

export default InventoryDocumentation;
