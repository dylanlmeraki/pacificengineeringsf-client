import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Bell, CheckCircle2, FileText, MessageSquare, AlertTriangle, Trash2, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export default function NotificationBell({ user }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['client-notifications', user?.email],
    queryFn: async () => {
      if (!user) return [];
      const notifs = await base44.entities.Notification.filter(
        { recipient_email: user.email },
        '-created_date',
        50
      );
      return notifs;
    },
    enabled: !!user,
    refetchInterval: 10000 // Poll every 10 seconds
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      return await base44.entities.Notification.update(notificationId, { read: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['client-notifications']);
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(n => base44.entities.Notification.update(n.id, { read: true }))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['client-notifications']);
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId) => {
      return await base44.entities.Notification.delete(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['client-notifications']);
    }
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'milestone_approval':
      case 'change_order':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'document_upload':
      case 'proposal':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-green-600" />;
      case 'project_update':
        return <CheckCircle2 className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'normal':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.notification-dropdown')) {
        setShowDropdown(false);
      }
    };
    
    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDropdown]);

  return (
    <div className="relative notification-dropdown">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-600 text-white text-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {showDropdown && (
        <Card className="absolute right-0 top-12 w-96 max-h-[600px] overflow-hidden border-0 shadow-2xl z-50">
          <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Notifications</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllAsReadMutation.mutate()}
                  className="text-white hover:bg-white/20"
                >
                  <CheckCheck className="w-4 h-4 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto max-h-[500px]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-600">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => {
                    if (!notification.read) {
                      markAsReadMutation.mutate(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {format(new Date(notification.created_date), 'MMM d, h:mm a')}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          {notification.priority && (
                            <Badge className={`text-xs ${getPriorityColor(notification.priority)}`}>
                              {notification.priority}
                            </Badge>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotificationMutation.mutate(notification.id);
                            }}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {notification.link && (
                        <Link
                          to={notification.link}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block"
                          onClick={() => setShowDropdown(false)}
                        >
                          View Details →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
}