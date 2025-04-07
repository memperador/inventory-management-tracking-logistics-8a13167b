
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const data = [
  { month: 'Jan', scheduled: 12, emergency: 3 },
  { month: 'Feb', scheduled: 15, emergency: 4 },
  { month: 'Mar', scheduled: 10, emergency: 2 },
  { month: 'Apr', scheduled: 18, emergency: 5 },
  { month: 'May', scheduled: 14, emergency: 3 },
  { month: 'Jun', scheduled: 20, emergency: 6 },
];

const config = {
  scheduled: {
    label: 'Scheduled Maintenance',
    color: '#3498db',
  },
  emergency: {
    label: 'Emergency Repairs',
    color: '#e74c3c',
  },
};

const MaintenanceForecastChart = () => {
  return (
    <ChartContainer
      config={config}
      className="h-full w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
          <XAxis dataKey="month" />
          <YAxis />
          <ChartTooltip
            content={
              <ChartTooltipContent />
            }
          />
          <Line
            type="monotone"
            dataKey="scheduled"
            stroke="var(--color-scheduled, #3498db)"
            strokeWidth={2}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="emergency"
            stroke="var(--color-emergency, #e74c3c)"
            strokeWidth={2}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default MaintenanceForecastChart;
