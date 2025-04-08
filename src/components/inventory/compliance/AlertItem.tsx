
import React from 'react';
import { format } from 'date-fns';
import { ComplianceAlert } from '@/components/equipment/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, CalendarClock } from 'lucide-react';
import { getPriorityColor, getAlertIcon } from './utils/alertUtils';

interface AlertItemProps {
  alert: ComplianceAlert;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}

export const AlertItem: React.FC<AlertItemProps> = ({ 
  alert,
  onAcknowledge,
  onResolve
}) => {
  const AlertIcon = getAlertIcon(alert.alertType);
  const priorityColorClass = getPriorityColor(alert.priority);

  return (
    <div className="flex items-start justify-between border-b pb-3">
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-full ${priorityColorClass}`}>
          <AlertIcon className="h-4 w-4" />
        </div>
        <div>
          <h4 className="font-medium">{alert.equipmentName}</h4>
          <p className="text-sm text-muted-foreground">{alert.description}</p>
          <div className="flex items-center mt-1">
            <CalendarClock className="h-3 w-3 mr-1" />
            <span className="text-xs">
              Due: {format(new Date(alert.dueDate), 'MMM dd, yyyy')}
            </span>
            <Badge variant="outline" className="ml-2 text-xs">
              {alert.alertType}
            </Badge>
            {alert.status === 'Acknowledged' && (
              <Badge variant="outline" className="ml-2 text-xs bg-yellow-50">
                Acknowledged
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex space-x-2">
        {alert.status === 'Open' && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onAcknowledge(alert.id)}
          >
            Acknowledge
          </Button>
        )}
        <Button 
          size="sm" 
          onClick={() => onResolve(alert.id)}
        >
          <Check className="h-4 w-4 mr-1" />
          Resolve
        </Button>
      </div>
    </div>
  );
};
