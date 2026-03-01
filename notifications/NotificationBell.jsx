import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";

export default function NotificationBell() {
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const { data: notifications = [] } = useQuery({
    queryKey: ['my-notifications', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      try {
        return await base44.entities.Notification.filter({ recipient_email: user.email, read: false }, '-created_date', 50);
      } catch {
        return [];
      }
    },
    enabled: !!user?.email
  });

  const unread = notifications.length;

  return (
    <div className="relative">
      <Button variant="outline" size="icon" className="relative">
        <Bell className="w-5 h-5" />
      </Button>
      {unread > 0 && (
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-red-600 text-white h-5 min-w-5 px-1 flex items-center justify-center">{unread}</Badge>
        </div>
      )}
    </div>
  );
}