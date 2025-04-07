
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useEquipmentStats } from '@/hooks/useEquipmentStats';
import { equipmentData } from '@/components/equipment/EquipmentData';
import { calculateDepreciation } from '@/utils/depreciationUtils';

const DepreciationChart = () => {
  const data = React.useMemo(() => {
    // Group equipment by type
    const equipmentByType = equipmentData.reduce((acc, equipment) => {
      const type = equipment.type || 'Other';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(equipment);
      return acc;
    }, {} as Record<string, typeof equipmentData>);

    // Calculate original and current value for each type
    return Object.entries(equipmentByType).map(([type, items]) => {
      const originalValue = items.reduce((sum, item) => sum + (item.cost || 0), 0);
      const currentValue = items.reduce((sum, item) => sum + calculateDepreciation(item), 0);
      
      return {
        type,
        originalValue,
        currentValue,
        depreciationPercent: originalValue > 0 
          ? Math.round(((originalValue - currentValue) / originalValue) * 100)
          : 0
      };
    }).sort((a, b) => b.originalValue - a.originalValue).slice(0, 5); // Top 5 by value
  }, []);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="type" />
        <YAxis />
        <Tooltip 
          formatter={(value) => `$${value.toLocaleString()}`}
          labelFormatter={(label) => `Equipment Type: ${label}`}
        />
        <Legend />
        <Bar name="Original Value" dataKey="originalValue" fill="#8884d8" />
        <Bar name="Current Value" dataKey="currentValue" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DepreciationChart;
