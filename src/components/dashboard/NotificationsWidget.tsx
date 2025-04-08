
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";
import { formatDistanceToNow, parseISO } from "date-fns";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NotificationType } from "@/components/types/notification";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getNotificationIcon, getNotificationColor } from "@/components/notifications/notificationUtils";

export const NotificationsWidget = () => {
  const { notifications, unreadCount, markAsRead } = useNotificationContext();
  
  const recentNotifications = notifications
    .filter(notification => !notification.read)
    .slice(0, 5);
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-500">High</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return null;
    }
  };

  if (recentNotifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Recent Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center py-6">
            <Bell className="h-12 w-12 text-gray-300 mb-2" />
            <p className="text-sm text-muted-foreground">All caught up!</p>
            <p className="text-xs text-muted-foreground mt-1">
              You have no unread notifications
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Recent Notifications
          </CardTitle>
          <Badge variant="outline">{unreadCount} unread</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {recentNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border rounded-lg hover:bg-gray-50 transition-colors ${getNotificationColor(notification.priority)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{notification.title}</p>
                      {getPriorityBadge(notification.priority)}
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(parseISO(notification.timestamp), { addSuffix: true })}
                      </span>
                      {notification.actionUrl && (
                        <Link 
                          to={notification.actionUrl}
                          className="text-xs text-blue-600 hover:underline"
                          onClick={() => markAsRead(notification.id)}
                        >
                          View details
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="mt-3 text-center">
          <Link
            to="/notifications"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            View all notifications
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
