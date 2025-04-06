
import React from 'react';
import { 
  Package, 
  Map, 
  Users, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EquipmentStatusChart from '@/components/dashboard/EquipmentStatusChart';
import RecentActivityList from '@/components/dashboard/RecentActivityList';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-500 mt-2">Welcome back! Here's an overview of your inventory.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Equipment</CardDescription>
            <CardTitle className="text-2xl flex items-center justify-between">
              184
              <Package className="h-5 w-5 text-inventory-blue" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={65} className="h-2" />
            <p className="text-xs text-gray-500 mt-2">65% in active use</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Projects</CardDescription>
            <CardTitle className="text-2xl flex items-center justify-between">
              12
              <Map className="h-5 w-5 text-inventory-green" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={80} className="h-2 bg-gray-100">
              <div className="bg-inventory-green h-full w-[80%]" />
            </Progress>
            <p className="text-xs text-gray-500 mt-2">80% on schedule</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Maintenance Alerts</CardDescription>
            <CardTitle className="text-2xl flex items-center justify-between">
              7
              <AlertTriangle className="h-5 w-5 text-inventory-yellow" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={25} className="h-2 bg-gray-100">
              <div className="bg-inventory-yellow h-full w-[25%]" />
            </Progress>
            <p className="text-xs text-gray-500 mt-2">25% critical</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Users</CardDescription>
            <CardTitle className="text-2xl flex items-center justify-between">
              28
              <Users className="h-5 w-5 text-inventory-blue-dark" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={95} className="h-2" />
            <p className="text-xs text-gray-500 mt-2">95% compliance rate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="equipment" className="space-y-6">
        <TabsList>
          <TabsTrigger value="equipment">Equipment Status</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="equipment" className="space-y-6">
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Equipment Status Overview</CardTitle>
              <CardDescription>
                Current status breakdown of all equipment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <EquipmentStatusChart />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-inventory-green mr-2"></div>
                  <span>Operational (120)</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-inventory-yellow mr-2"></div>
                  <span>Maintenance (43)</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-inventory-red mr-2"></div>
                  <span>Out of Service (21)</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest events across all projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivityList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
