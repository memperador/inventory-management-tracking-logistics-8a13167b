
import React from 'react';
import PageHeader from '@/components/common/PageHeader';
import AnalyticsSummary from '@/components/dashboard/AnalyticsSummary';
import ProjectProgressTable from '@/components/dashboard/ProjectProgressTable';
import StatisticsCards from '@/components/dashboard/StatisticsCards';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Analytics = () => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <PageHeader 
        title="Analytics" 
        description="View comprehensive data analytics for your equipment and projects"
      />
      
      <StatisticsCards />
      
      <div className="grid grid-cols-1 gap-6">
        <AnalyticsSummary />
        
        <Card>
          <CardHeader>
            <CardTitle>Equipment Depreciation Overview</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>The equipment depreciation is calculated using industry-specific rates:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Construction equipment: 12-20% per year</li>
              <li>Electrical equipment: 15-25% per year</li>
              <li>Plumbing equipment: 15-18% per year</li>
              <li>HVAC equipment: 12-15% per year</li>
            </ul>
            <p className="mt-2">Salvage values range from 10-20% of original cost depending on equipment type.</p>
          </CardContent>
        </Card>
      </div>
      
      <ProjectProgressTable />
    </div>
  );
};

export default Analytics;
