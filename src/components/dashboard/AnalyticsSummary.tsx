
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EquipmentStatusChart from './EquipmentStatusChart';
import EquipmentUtilizationChart from './EquipmentUtilizationChart';
import MaintenanceForecastChart from './MaintenanceForecastChart';

const AnalyticsSummary = () => {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Analytics Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="status" className="space-y-4">
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
  );
};

export default AnalyticsSummary;
