
import { useNotificationContext } from '@/contexts/NotificationContext';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  onClick: () => void;
}

export const NotificationBadge = ({ onClick }: NotificationBadgeProps) => {
  const { unreadCount } = useNotificationContext();
  
  return (
    <Button 
      onClick={onClick} 
      variant="ghost" 
      size="sm" 
      className="relative p-2"
      aria-label={`Notifications (${unreadCount} unread)`}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className={cn(
          "absolute top-0 right-0 h-4 min-w-[1rem] flex items-center justify-center",
          "rounded-full bg-red-500 text-white text-[10px] font-medium",
          "px-[0.15rem] translate-x-1 -translate-y-1"
        )}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Button>
  );
};
