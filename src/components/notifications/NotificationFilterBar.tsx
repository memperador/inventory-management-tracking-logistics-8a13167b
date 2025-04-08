
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wrench, FileText, Calendar } from 'lucide-react';
import { NotificationType } from '@/components/types/notification';

interface NotificationFilterBarProps {
  activeTypeFilter: 'all' | NotificationType;
  setActiveTypeFilter: (filter: 'all' | NotificationType) => void;
}

export const NotificationFilterBar: React.FC<NotificationFilterBarProps> = ({
  activeTypeFilter,
  setActiveTypeFilter
}) => {
  return (
    <div className="flex gap-1 p-2 overflow-x-auto border-b">
      <Badge 
        variant={activeTypeFilter === 'all' ? 'default' : 'outline'} 
        className="cursor-pointer"
        onClick={() => setActiveTypeFilter('all')}
      >
        All
      </Badge>
      <Badge 
        variant={activeTypeFilter === 'maintenance_due' || activeTypeFilter === 'maintenance_overdue' ? 'default' : 'outline'} 
        className="cursor-pointer"
        onClick={() => setActiveTypeFilter(
          activeTypeFilter === 'maintenance_due' || activeTypeFilter === 'maintenance_overdue' 
            ? 'all' 
            : 'maintenance_due'
        )}
      >
        <Wrench className="h-3 w-3 mr-1" />
        Maintenance
      </Badge>
      <Badge 
        variant={activeTypeFilter === 'certification_expired' || activeTypeFilter === 'certification_expiring' ? 'default' : 'outline'} 
        className="cursor-pointer"
        onClick={() => setActiveTypeFilter(
          activeTypeFilter === 'certification_expired' || activeTypeFilter === 'certification_expiring' 
            ? 'all' 
            : 'certification_expired'
        )}
      >
        <FileText className="h-3 w-3 mr-1" />
        Certification
      </Badge>
      <Badge 
        variant={activeTypeFilter === 'inspection_due' || activeTypeFilter === 'inspection_overdue' ? 'default' : 'outline'} 
        className="cursor-pointer"
        onClick={() => setActiveTypeFilter(
          activeTypeFilter === 'inspection_due' || activeTypeFilter === 'inspection_overdue' 
            ? 'all' 
            : 'inspection_due'
        )}
      >
        <Calendar className="h-3 w-3 mr-1" />
        Inspection
      </Badge>
    </div>
  );
};
