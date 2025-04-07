
import React, { useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CalendarDays, Download, RefreshCw } from "lucide-react";
import DepreciationChart from '@/components/dashboard/DepreciationChart';
import EquipmentStatusChart from '@/components/dashboard/EquipmentStatusChart';
import EquipmentUtilizationChart from '@/components/dashboard/EquipmentUtilizationChart';
import MaintenanceForecastChart from '@/components/dashboard/MaintenanceForecastChart';

const Analytics = () => {
  const [dateRange, setDateRange] = useState("30days");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("status");

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

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="status">Equipment Status</TabsTrigger>
              <TabsTrigger value="utilization">Equipment Utilization</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance Forecast</TabsTrigger>
            </TabsList>
            <TabsContent value="status" className="h-[300px]">
              <EquipmentStatusChart />
            </TabsContent>
            <TabsContent value="utilization" className="h-[300px]">
              <EquipmentUtilizationChart />
            </TabsContent>
            <TabsContent value="maintenance" className="h-[300px]">
              <MaintenanceForecastChart />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <Button variant="ghost" size="sm">View all</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Sample activity items */}
            <div className="flex items-start gap-4 border-b pb-4">
              <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                <span className="text-xs">✓</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Excavator #EX-7823 scheduled for maintenance</p>
                <p className="text-xs text-muted-foreground">2 hours ago · Downtown High-rise</p>
              </div>
            </div>
            <div className="flex items-start gap-4 border-b pb-4">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <span className="text-xs">↗</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Bulldozer #BD-1234 transferred to new site</p>
                <p className="text-xs text-muted-foreground">5 hours ago · Highway Extension</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center text-white">
                <span className="text-xs">!</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Crane #CR-5678 maintenance overdue</p>
                <p className="text-xs text-muted-foreground">1 day ago · Harbor Project</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
