
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { 
  Package2, AlertTriangle, Clock, CheckCircle, 
  BarChart3, FileText, Truck, DollarSign 
} from 'lucide-react';
import { equipmentData } from '@/components/equipment/EquipmentData';
import { INVENTORY_CATEGORIES } from '@/components/equipment/types';

export const InventoryDashboard = () => {
  // Calculate statistics for the dashboard
  const totalItems = equipmentData.length;
  const totalValue = equipmentData.reduce((sum, item) => sum + (item.cost || 0), 0);
  const requireMaintenance = equipmentData.filter(item => 
    item.status === 'Maintenance' || 
    (item.nextMaintenance && new Date(item.nextMaintenance) <= new Date())
  ).length;
  
  const categoryCounts = INVENTORY_CATEGORIES.map(category => ({
    name: category,
    value: equipmentData.filter(item => item.category === category).length
  })).filter(item => item.value > 0);
  
  const statusCounts = [
    { name: 'Operational', value: equipmentData.filter(item => item.status === 'Operational').length },
    { name: 'Maintenance', value: equipmentData.filter(item => item.status === 'Maintenance').length },
    { name: 'Out of Service', value: equipmentData.filter(item => item.status === 'Out of Service').length },
    { name: 'Testing', value: equipmentData.filter(item => item.status === 'Testing').length },
    { name: 'Certification Pending', value: equipmentData.filter(item => item.status === 'Certification Pending').length }
  ].filter(item => item.value > 0);

  // Color schemes
  const CATEGORY_COLORS = ['#4f46e5', '#0891b2', '#7c3aed', '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#6366f1'];
  const STATUS_COLORS = {
    'Operational': '#16a34a',
    'Maintenance': '#f59e0b',
    'Out of Service': '#dc2626',
    'Testing': '#2563eb',
    'Certification Pending': '#8b5cf6'
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              Across {categoryCounts.length} categories
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${new Intl.NumberFormat().format(totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Estimated inventory value
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Required</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${requireMaintenance > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requireMaintenance}</div>
            <p className="text-xs text-muted-foreground">
              Items needing attention
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Operational Items</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statusCounts.find(s => s.name === 'Operational')?.value || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for use
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Equipment by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryCounts}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={1}
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} items`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Equipment by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusCounts}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={1}
                    dataKey="value"
                  >
                    {statusCounts.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} items`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
