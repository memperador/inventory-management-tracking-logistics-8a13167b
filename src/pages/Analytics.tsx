
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
    <div className="container mx-auto p-2 md:p-4 space-y-4 md:space-y-6 mobile-pb">
      <PageHeader 
        title="Analytics" 
        description="View comprehensive data analytics for your equipment and projects"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-9 px-2 md:h-10 md:px-4"
            >
              <RefreshCw className={`h-4 w-4 md:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Refresh</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="h-9 px-2 md:h-10 md:px-4"
            >
              <CalendarDays className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Date Range</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="h-9 px-2 md:h-10 md:px-4"
            >
              <Download className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Export</span>
            </Button>
          </div>
        }
      />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end space-y-2 sm:space-y-0 space-x-0 sm:space-x-2 mb-4">
        <div className="text-sm text-muted-foreground mr-2">Time period:</div>
        <Tabs defaultValue={dateRange} className="w-full sm:w-[400px]" onValueChange={setDateRange}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="7days">7d</TabsTrigger>
            <TabsTrigger value="30days">30d</TabsTrigger>
            <TabsTrigger value="quarter">Qtr</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="utilization">Utilization</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>
            <TabsContent value="status" className="h-[250px] md:h-[300px]">
              <EquipmentStatusChart />
            </TabsContent>
            <TabsContent value="utilization" className="h-[250px] md:h-[300px]">
              <EquipmentUtilizationChart />
            </TabsContent>
            <TabsContent value="maintenance" className="h-[250px] md:h-[300px]">
              <MaintenanceForecastChart />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="text-lg md:text-xl">Equipment Depreciation Overview</CardTitle>
          </CardHeader>
          <CardContent className="text-xs md:text-sm text-muted-foreground p-4">
            <p>The equipment depreciation is calculated using industry-specific rates:</p>
            <ul className="list-disc pl-4 md:pl-6 mt-2 space-y-0.5 md:space-y-1">
              <li>Construction equipment: 12-20% per year</li>
              <li>Electrical equipment: 15-25% per year</li>
              <li>Plumbing equipment: 15-18% per year</li>
              <li>HVAC equipment: 12-15% per year</li>
            </ul>
            <p className="mt-2">Salvage values range from 10-20% of original cost depending on equipment type.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="text-lg md:text-xl">Depreciation by Equipment Type</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] md:h-[250px] p-2 sm:p-4">
            <DepreciationChart />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 md:pb-4">
          <CardTitle className="text-lg md:text-xl">Recent Activity</CardTitle>
          <Button variant="ghost" size="sm">View all</Button>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="space-y-3 md:space-y-4">
            {/* Sample activity items */}
            <div className="flex items-start gap-3 md:gap-4 border-b pb-3 md:pb-4">
              <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white flex-shrink-0">
                <span className="text-xs">✓</span>
              </div>
              <div className="space-y-0.5 md:space-y-1 min-w-0">
                <p className="text-sm font-medium line-clamp-2">Excavator #EX-7823 scheduled for maintenance</p>
                <p className="text-xs text-muted-foreground">2 hours ago · Downtown High-rise</p>
              </div>
            </div>
            <div className="flex items-start gap-3 md:gap-4 border-b pb-3 md:pb-4">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
                <span className="text-xs">↗</span>
              </div>
              <div className="space-y-0.5 md:space-y-1 min-w-0">
                <p className="text-sm font-medium line-clamp-2">Bulldozer #BD-1234 transferred to new site</p>
                <p className="text-xs text-muted-foreground">5 hours ago · Highway Extension</p>
              </div>
            </div>
            <div className="flex items-start gap-3 md:gap-4">
              <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center text-white flex-shrink-0">
                <span className="text-xs">!</span>
              </div>
              <div className="space-y-0.5 md:space-y-1 min-w-0">
                <p className="text-sm font-medium line-clamp-2">Crane #CR-5678 maintenance overdue</p>
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
