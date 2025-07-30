import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, User, Edit, Bell, Shield, HelpCircle, LogOut } from "lucide-react";
import { useEmployee } from "@/hooks/useEmployee";
import Logo from "@/components/logo";

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { employee } = useEmployee();

  const { data: stats } = useQuery<Record<string, number>>({
    queryKey: ["/api/leads/statistics"],
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/employee/logout");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of Bizloan Sales Buddy",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6">
          <div className="flex justify-center mb-4">
            <Logo size="medium" />
          </div>
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setLocation("/")}
              className="text-primary"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-800">Profile</h1>
            <Button variant="ghost" size="icon" className="text-primary">
              <Edit className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="px-4 py-6">
        {/* Profile Info */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="text-gray-600 h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{employee.employeeId}</h2>
                <p className="text-primary font-medium">{employee.role}</p>
                <p className="text-sm text-gray-500">ID: {employee.employeeId}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Branch</span>
                <span className="text-sm text-gray-800">{employee.branch}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Mobile</span>
                <span className="text-sm text-gray-800">{employee.mobileNumber}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Status</span>
                <span className="text-sm text-gray-800">{employee.isActive ? "Active" : "Inactive"}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Joined</span>
                <span className="text-sm text-gray-800">{formatDate(employee.createdAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{stats?.total || 0}</p>
                <p className="text-sm text-gray-600">Total Leads</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success">{stats?.sanctioned || 0}</p>
                <p className="text-sm text-gray-600">Sanctioned</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">{stats?.disbursed || 0}</p>
                <p className="text-sm text-gray-600">Disbursed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-error">
                  {(stats?.total && stats.total > 0) ? Math.round(((stats?.sanctioned || 0) / stats.total) * 100) : 0}%
                </p>
                <p className="text-sm text-gray-600">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Settings</h3>
            <div className="space-y-4">
              <Button variant="ghost" className="w-full justify-between p-3 h-auto">
                <div className="flex items-center space-x-3">
                  <Bell className="text-gray-400 h-5 w-5" />
                  <span className="text-gray-700">Notifications</span>
                </div>
                <span className="text-gray-400">›</span>
              </Button>
              
              <Button variant="ghost" className="w-full justify-between p-3 h-auto">
                <div className="flex items-center space-x-3">
                  <Shield className="text-gray-400 h-5 w-5" />
                  <span className="text-gray-700">Privacy</span>
                </div>
                <span className="text-gray-400">›</span>
              </Button>
              
              <Button variant="ghost" className="w-full justify-between p-3 h-auto">
                <div className="flex items-center space-x-3">
                  <HelpCircle className="text-gray-400 h-5 w-5" />
                  <span className="text-gray-700">Help & Support</span>
                </div>
                <span className="text-gray-400">›</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-between p-3 h-auto text-error hover:text-error hover:bg-error/10"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <div className="flex items-center space-x-3">
                  <LogOut className="text-error h-5 w-5" />
                  <span className="text-error font-medium">
                    {logoutMutation.isPending ? "Logging out..." : "Logout"}
                  </span>
                </div>
                <span className="text-error">›</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
