
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Wrench, Calendar, AlertTriangle, DollarSign } from "lucide-react";
import { useEquipmentStats } from '@/hooks/useEquipmentStats';
import { formatCurrency } from '@/utils/depreciationUtils';

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

const StatCard = ({ title, value, description, icon }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="h-4 w-4 text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

interface StatisticsCardsProps {
  dateRange?: string;
}

const StatisticsCards = ({ dateRange = '30days' }: StatisticsCardsProps) => {
  const { 
    maintenanceDue, 
    totalEquipment, 
    utilizationRate, 
    criticalAlerts,
    totalOriginalCost,
    totalDepreciatedValue,
    depreciationPercentage
  } = useEquipmentStats();
  
  const periodText = {
    '7days': 'Last 7 days',
    '30days': 'Last 30 days',
    'quarter': 'Last quarter',
    'year': 'Last year'
  }[dateRange] || 'Last 30 days';
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatCard 
        title="Total Equipment" 
        value={totalEquipment.toString()} 
        description="Active in your fleet" 
        icon={<Truck className="h-4 w-4" />} 
      />
      <StatCard 
        title="Utilization Rate" 
        value={`${utilizationRate}%`} 
        description={periodText}
        icon={<Calendar className="h-4 w-4" />} 
      />
      <StatCard 
        title="Maintenance Due" 
        value={maintenanceDue.toString()} 
        description="Next 30 days" 
        icon={<Wrench className="h-4 w-4" />} 
      />
      <StatCard 
        title="Critical Alerts" 
        value={criticalAlerts.toString()} 
        description="Require attention" 
        icon={<AlertTriangle className="h-4 w-4" />} 
      />
      <StatCard 
        title="Fleet Value" 
        value={formatCurrency(totalDepreciatedValue)} 
        description={`${depreciationPercentage}% depreciated`}
        icon={<DollarSign className="h-4 w-4" />} 
      />
    </div>
  );
};

export default StatisticsCards;
