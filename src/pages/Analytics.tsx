
import React, { useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import AnalyticsSummary from '@/components/dashboard/AnalyticsSummary';
import ProjectProgressTable from '@/components/dashboard/ProjectProgressTable';
import StatisticsCards from '@/components/dashboard/StatisticsCards';
import DepreciationChart from '@/components/dashboard/DepreciationChart';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CalendarDays, Download, RefreshCw } from "lucide-react";

const Analytics = () => {
  const [dateRange, setDateRange] = useState("30days");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <PageHeader 
        title="Analytics" 
        description="View comprehensive data analytics for your equipment and projects"
        actions={
          <>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm"
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Date Range
            </Button>
            <Button 
              variant="outline" 
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </>
        }
      />
      
      <div className="flex items-center justify-end space-x-2 mb-4">
        <div className="text-sm text-muted-foreground mr-2">Time period:</div>
        <Tabs defaultValue={dateRange} className="w-[400px]" onValueChange={setDateRange}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="7days">7 days</TabsTrigger>
            <TabsTrigger value="30days">30 days</TabsTrigger>
            <TabsTrigger value="quarter">Quarter</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <StatisticsCards dateRange={dateRange} />
      
      <div className="grid grid-cols-1 gap-6">
        <AnalyticsSummary />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          
          <Card>
            <CardHeader>
              <CardTitle>Depreciation by Equipment Type</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              <DepreciationChart />
            </CardContent>
          </Card>
        </div>
      </div>
      
      <ProjectProgressTable />
    </div>
  );
};

export default Analytics;
