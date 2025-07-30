import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import BottomNavigation from "@/components/bottom-navigation";
import { 
  Settings, 
  Bell, 
  Moon, 
  Globe, 
  Shield, 
  Smartphone, 
  HelpCircle, 
  LogOut,
  User,
  MapPin,
  Database,
  Wifi
} from "lucide-react";
import { useEmployee } from "@/hooks/useEmployee";
import { useLocation } from "wouter";
import Logo from "@/components/logo";

export default function SettingsPage() {
  const { employee } = useEmployee();
  const [, setLocation] = useLocation();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  
  // Mock settings state - in real app this would be stored in backend
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: false,
    darkMode: false,
    language: "en",
    autoCheckIn: true,
    locationServices: true,
    offlineMode: false,
  });

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/employee/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        setLocation('/');
        window.location.reload();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  const settingsSections = [
    {
      title: "Account",
      items: [
        {
          icon: User,
          label: "Profile Information",
          description: "View and edit your profile",
          action: () => setLocation("/profile"),
          type: "navigate" as const
        },
        {
          icon: Shield,
          label: "Admin Panel",
          description: "Manage employees and system settings",
          action: () => setLocation("/admin"),
          type: "navigate" as const,
          badge: "Admin"
        }
      ]
    },
    {
      title: "Notifications",
      items: [
        {
          icon: Bell,
          label: "Push Notifications",
          description: "Receive notifications on your device",
          type: "toggle" as const,
          value: settings.pushNotifications,
          onChange: (value: boolean) => setSettings(prev => ({ ...prev, pushNotifications: value }))
        },
        {
          icon: Bell,
          label: "Email Notifications",
          description: "Receive notifications via email",
          type: "toggle" as const,
          value: settings.emailNotifications,
          onChange: (value: boolean) => setSettings(prev => ({ ...prev, emailNotifications: value }))
        }
      ]
    },
    {
      title: "Appearance",
      items: [
        {
          icon: Moon,
          label: "Dark Mode",
          description: "Switch to dark theme",
          type: "toggle" as const,
          value: settings.darkMode,
          onChange: (value: boolean) => setSettings(prev => ({ ...prev, darkMode: value }))
        },
        {
          icon: Globe,
          label: "Language",
          description: "Change app language",
          type: "select" as const,
          value: settings.language,
          options: [
            { value: "en", label: "English" },
            { value: "hi", label: "हिंदी (Hindi)" },
            { value: "mr", label: "मराठी (Marathi)" },
            { value: "gu", label: "ગુજરાતી (Gujarati)" }
          ],
          onChange: (value: string) => setSettings(prev => ({ ...prev, language: value }))
        }
      ]
    },
    {
      title: "Functionality",
      items: [
        {
          icon: MapPin,
          label: "Location Services",
          description: "Enable GPS for check-in features",
          type: "toggle" as const,
          value: settings.locationServices,
          onChange: (value: boolean) => setSettings(prev => ({ ...prev, locationServices: value }))
        },
        {
          icon: Smartphone,
          label: "Auto Check-in",
          description: "Automatically check-in at office locations",
          type: "toggle" as const,
          value: settings.autoCheckIn,
          onChange: (value: boolean) => setSettings(prev => ({ ...prev, autoCheckIn: value }))
        },
        {
          icon: Database,
          label: "Offline Mode",  
          description: "Store data locally when offline",
          type: "toggle" as const,
          value: settings.offlineMode,
          onChange: (value: boolean) => setSettings(prev => ({ ...prev, offlineMode: value }))
        }
      ]
    },
    {
      title: "Support",
      items: [
        {
          icon: HelpCircle,
          label: "Help & Support",
          description: "Get help with the app",
          type: "navigate" as const,
          action: () => alert("Contact support: support@bizloan.com")
        },
        {
          icon: Wifi,
          label: "App Version",
          description: "v1.0.0 - Latest",
          type: "info" as const
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6">
          <div className="flex justify-center mb-4">
            <Logo size="medium" />
          </div>
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold text-gray-800">Settings</h1>
          </div>
        </div>
      </div>

      {/* Employee Info Card */}
      <div className="px-4 py-6">
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{employee.employeeId}</h3>
                <p className="text-sm text-gray-500">{employee.role} • {employee.branch}</p>
                <p className="text-sm text-gray-500">{employee.mobileNumber}</p>
              </div>
              <Badge variant={employee.isActive ? "default" : "destructive"}>
                {employee.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Settings Sections */}
        <div className="space-y-6">
          {settingsSections.map((section) => (
            <Card key={section.title}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-800">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {section.items.map((item, index) => {
                  const Icon = item.icon;
                  
                  return (
                    <div key={index} className="flex items-center justify-between py-3 px-1">
                      <div className="flex items-center space-x-3 flex-1">
                        <Icon className="h-5 w-5 text-gray-500" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{item.label}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0">
                        {item.type === "toggle" && (
                          <Switch
                            checked={item.value as boolean}
                            onCheckedChange={item.onChange as (value: boolean) => void}
                          />
                        )}
                        
                        {item.type === "select" && (
                          <Select
                            value={item.value as string}
                            onValueChange={item.onChange as (value: string) => void}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(item as any).options?.map((option: any) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        
                        {item.type === "navigate" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(item as any).action}
                            className="text-primary"
                          >
                            Open
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Logout Section */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  size="lg"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Logout</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-gray-600">
                    Are you sure you want to logout? You'll need to login again to access the app.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowLogoutDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation currentPage="settings" />
    </div>
  );
}