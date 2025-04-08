
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Equipment } from '@/components/equipment/types';
import { BarChart, LineChart, PieChart, Pie, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface EnhancedDashboardProps {
  equipmentData: Equipment[];
}

export const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({ equipmentData }) => {
  // Calculate equipment status distribution
  const statusCounts = equipmentData.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Calculate equipment by category
  const categoryCounts = equipmentData.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

  // Generate maintenance forecast data
  const today = new Date();
  const next30Days = [...Array(30)].map((_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  const maintenanceForecast = next30Days.map(date => {
    const count = equipmentData.filter(eq => eq.nextMaintenance === date).length;
    return {
      date,
      count
    };
  });

  // Calculate utilization data (using random data for demo)
  const utilizationData = [
    { name: 'Week 1', utilization: Math.floor(Math.random() * 100) },
    { name: 'Week 2', utilization: Math.floor(Math.random() * 100) },
    { name: 'Week 3', utilization: Math.floor(Math.random() * 100) },
    { name: 'Week 4', utilization: Math.floor(Math.random() * 100) }
  ];

  // Calculate maintenance cost data (using random data for demo)
  const maintenanceCostData = [
    { name: 'Jan', planned: 1200, unplanned: 400 },
    { name: 'Feb', planned: 900, unplanned: 300 },
    { name: 'Mar', planned: 1500, unplanned: 200 },
    { name: 'Apr', planned: 800, unplanned: 700 }
  ];

  // Identify equipment needing attention
  const expiredCertifications = equipmentData.filter(eq => {
    if (eq.certificationRequired && eq.certificationExpiry) {
      const expiryDate = new Date(eq.certificationExpiry);
      return expiryDate < today;
    }
    return false;
  });

  const upcomingMaintenance = equipmentData.filter(eq => {
    if (eq.nextMaintenance) {
      const maintenanceDate = new Date(eq.nextMaintenance);
      const twoWeeksFromNow = new Date();
      twoWeeksFromNow.setDate(today.getDate() + 14);
      return maintenanceDate <= twoWeeksFromNow && maintenanceDate >= today;
    }
    return false;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Equipment Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Equipment by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Equipment Utilization</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="utilization" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Maintenance Costs</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maintenanceCostData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="planned" fill="#8884d8" />
                <Bar dataKey="unplanned" fill="#ff8042" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Upcoming Maintenance</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={maintenanceForecast.filter(d => d.count > 0)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
              Expired Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expiredCertifications.length > 0 ? (
              <ul className="space-y-2">
                {expiredCertifications.slice(0, 5).map(eq => (
                  <li key={eq.id} className="flex justify-between border-b pb-1">
                    <span>{eq.name}</span>
                    <span className="text-red-500">
                      Expired: {new Date(eq.certificationExpiry!).toLocaleDateString()}
                    </span>
                  </li>
                ))}
                {expiredCertifications.length > 5 && (
                  <li className="text-sm text-muted-foreground">
                    +{expiredCertifications.length - 5} more...
                  </li>
                )}
              </ul>
            ) : (
              <div className="flex items-center text-green-500">
                <CheckCircle className="mr-2 h-5 w-5" />
                No expired certifications
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-amber-500" />
              Upcoming Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingMaintenance.length > 0 ? (
              <ul className="space-y-2">
                {upcomingMaintenance.slice(0, 5).map(eq => (
                  <li key={eq.id} className="flex justify-between border-b pb-1">
                    <span>{eq.name}</span>
                    <span className="text-amber-500">
                      Due: {new Date(eq.nextMaintenance!).toLocaleDateString()}
                    </span>
                  </li>
                ))}
                {upcomingMaintenance.length > 5 && (
                  <li className="text-sm text-muted-foreground">
                    +{upcomingMaintenance.length - 5} more...
                  </li>
                )}
              </ul>
            ) : (
              <div className="flex items-center text-green-500">
                <CheckCircle className="mr-2 h-5 w-5" />
                No upcoming maintenance
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
