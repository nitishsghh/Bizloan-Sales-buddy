import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/bottom-navigation";
import { Bell, CheckCircle, AlertCircle, Clock, User } from "lucide-react";
import { useEmployee } from "@/hooks/useEmployee";
import Logo from "@/components/logo";

export default function NotificationsPage() {
  const { employee } = useEmployee();

  // Mock notifications data - in real app this would come from API
  const mockNotifications = [
    {
      id: "1",
      type: "lead_update",
      title: "Lead Status Updated",
      message: "Client Rajesh Kumar's application has been approved",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
      priority: "high"
    },
    {
      id: "2", 
      type: "new_client",
      title: "New Client Assigned",
      message: "You have been assigned a new client: Priya Sharma",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
      priority: "medium"
    },
    {
      id: "3",
      type: "reminder",
      title: "Follow-up Reminder",
      message: "Follow up with Amit Singh regarding his loan application",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      read: true,
      priority: "medium"
    },
    {
      id: "4",
      type: "system",
      title: "System Update",
      message: "New features have been added to the client form",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
      priority: "low"
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "lead_update":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "new_client":
        return <User className="h-5 w-5 text-blue-500" />;
      case "reminder":
        return <Clock className="h-5 w-5 text-orange-500" />;
      case "system":
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const unreadCount = mockNotifications.filter(n => !n.read).length;

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6">
          <div className="flex justify-center mb-4">
            <Logo size="medium" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold text-gray-800">Notifications</h1>
            </div>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="px-2 py-1">
                {unreadCount} new
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="px-4 py-6 space-y-4">
        {mockNotifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">No notifications yet</p>
              <p className="text-sm text-gray-400 text-center mt-2">
                You'll see updates about your leads and clients here
              </p>
            </CardContent>
          </Card>
        ) : (
          mockNotifications.map((notification) => (
            <Card key={notification.id} className={`${!notification.read ? 'border-l-4 border-l-primary bg-blue-50' : 'bg-white'}`}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        <p className={`text-sm mt-1 ${!notification.read ? 'text-gray-700' : 'text-gray-500'}`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs text-gray-400">
                            {formatTime(notification.timestamp)}
                          </span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPriorityColor(notification.priority)}`}
                          >
                            {notification.priority}
                          </Badge>
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Action Buttons */}
      {unreadCount > 0 && (
        <div className="px-4 pb-4">
          <Button 
            variant="outline" 
            className="w-full bg-white"
            onClick={() => {
              // In real app, this would call API to mark all as read
              console.log('Mark all as read');
            }}
          >
            Mark All as Read
          </Button>
        </div>
      )}

      <BottomNavigation currentPage="notifications" />
    </div>
  );
}