
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const data = [
  { name: 'Excavators', utilization: 85, color: '#3498db' },
  { name: 'Bulldozers', utilization: 72, color: '#2ecc71' },
  { name: 'Cranes', utilization: 65, color: '#e74c3c' },
  { name: 'Trucks', utilization: 90, color: '#f1c40f' },
  { name: 'Loaders', utilization: 78, color: '#9b59b6' },
  { name: 'Generators', utilization: 56, color: '#34495e' },
];

const config = {
  utilization: {
    label: 'Utilization Rate (%)',
    color: '#3498db',
  },
};

const EquipmentUtilizationChart = () => {
  return (
    <ChartContainer
      config={config}
      className="h-full w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
          <XAxis dataKey="name" />
          <YAxis />
          <ChartTooltip
            content={
              <ChartTooltipContent 
                labelFormatter={(label) => `Equipment Type: ${label}`}
              />
            }
          />
          <Bar
            dataKey="utilization"
            fill="var(--color-utilization, #3498db)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default EquipmentUtilizationChart;
