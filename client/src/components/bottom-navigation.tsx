import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, User, Plus, Bell, Settings } from "lucide-react";

interface BottomNavigationProps {
  currentPage: string;
}

export default function BottomNavigation({ currentPage }: BottomNavigationProps) {
  const [, setLocation] = useLocation();

  const navigationItems = [
    { id: "home", icon: Home, label: "Home", path: "/" },
    { id: "profile", icon: User, label: "Profile", path: "/profile" },
    { id: "add", icon: Plus, label: "Add", path: "/client-form", special: true },
    { id: "notifications", icon: Bell, label: "Notifications", path: "/notifications" },
    { id: "settings", icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t">
      <div className="flex items-center justify-around py-3">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          if (item.special) {
            return (
              <Button
                key={item.id}
                onClick={() => setLocation(item.path)}
                className="w-12 h-12 bg-primary hover:bg-primary/90 rounded-full p-0"
              >
                <Icon className="text-white h-6 w-6" />
              </Button>
            );
          }

          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center space-y-1 h-auto py-2 px-3 ${
                isActive ? "text-primary" : "text-gray-400"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
