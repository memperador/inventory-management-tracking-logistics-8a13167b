
import React from 'react';
import { CheckCircle2, AlertTriangle, ArrowUpCircle, ArrowDownCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type Activity = {
  id: string;
  type: 'maintenance' | 'movement' | 'alert' | 'update';
  message: string;
  timestamp: string;
  project?: string;
};

const activities: Activity[] = [
  {
    id: '1',
    type: 'maintenance',
    message: 'Excavator #EX-7823 scheduled for maintenance',
    timestamp: '2 hours ago',
    project: 'Downtown High-rise'
  },
  {
    id: '2',
    type: 'movement',
    message: 'Bulldozer #BD-1234 transferred to new site',
    timestamp: '5 hours ago',
    project: 'Highway Extension'
  },
  {
    id: '3',
    type: 'alert',
    message: 'Crane #CR-9876 requires immediate inspection',
    timestamp: '12 hours ago',
    project: 'Commercial Complex'
  },
  {
    id: '4',
    type: 'update',
    message: 'GPS tracking system updated to v3.2',
    timestamp: '1 day ago'
  },
  {
    id: '5',
    type: 'maintenance',
    message: 'Forklift #FL-3421 maintenance completed',
    timestamp: '1 day ago',
    project: 'Warehouse Project'
  },
];

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'maintenance':
      return <CheckCircle2 className="h-5 w-5 text-inventory-blue" />;
    case 'movement':
      return type === 'movement' ? 
        <ArrowUpCircle className="h-5 w-5 text-inventory-green" /> : 
        <ArrowDownCircle className="h-5 w-5 text-inventory-yellow" />;
    case 'alert':
      return <AlertTriangle className="h-5 w-5 text-inventory-red" />;
    default:
      return <Info className="h-5 w-5 text-inventory-blue" />;
  }
};

const RecentActivityList = () => {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div 
          key={activity.id}
          className="flex items-start p-4 rounded-lg border border-gray-100 bg-white"
        >
          <div className="mt-0.5 mr-4">
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{activity.message}</p>
            <div className="flex items-center mt-1 text-xs text-gray-500 space-x-2">
              <span>{activity.timestamp}</span>
              {activity.project && (
                <>
                  <span className="inline-block w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>{activity.project}</span>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentActivityList;
