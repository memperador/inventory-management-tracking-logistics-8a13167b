
import { Wrench, FileText, CalendarClock, Bell } from 'lucide-react';

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Critical': return 'bg-red-500 text-white';
    case 'High': return 'bg-orange-500 text-white';
    case 'Medium': return 'bg-yellow-500 text-black';
    case 'Low': return 'bg-blue-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

export const getAlertIcon = (alertType: string) => {
  switch (alertType) {
    case 'Maintenance': return Wrench;
    case 'Certification': return FileText;
    case 'Inspection': return CalendarClock;
    default: return Bell;
  }
};
