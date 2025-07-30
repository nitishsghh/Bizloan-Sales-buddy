import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import BottomNavigation from "@/components/bottom-navigation";
import MetricCard from "@/components/metric-card";
import CheckInModal from "@/components/check-in-modal";
import { useState } from "react";
import { User, Clock, Shield } from "lucide-react";
import { useEmployee } from "@/hooks/useEmployee";
import { CheckIn } from "@shared/schema";
import Logo from "@/components/logo";

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const [showCheckInModal, setShowCheckInModal] = useState(false);

  const { employee } = useEmployee();

  const { data: activeCheckIn } = useQuery<CheckIn>({
    queryKey: ["/api/checkins/active"],
  });

  const { data: stats } = useQuery<Record<string, number>>({
    queryKey: ["/api/leads/statistics"],
  });

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  const formatTime = (date: string | Date | null | undefined) => {
    if (!date) return "/-/-";
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <Logo size="medium" />
          </div>
          {/* User Profile Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="text-gray-600 h-6 w-6" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">{employee.employeeId}</h2>
                <p className="text-sm text-primary">{employee.role}</p>
                <p className="text-xs text-gray-500">Branch - {employee.branch}</p>
              </div>
            </div>
            <Button
              onClick={() => setShowCheckInModal(true)}
              variant="outline"
              className="border-2 border-primary text-primary hover:bg-primary hover:text-white"
            >
              Check In
            </Button>
          </div>

          {/* Check In/Out Status */}
          <div className="flex items-center justify-center space-x-8 mb-6 bg-gray-50 rounded-lg p-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-full mb-2">
                <Clock className="text-white h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-gray-700">Check in</p>
              <p className="text-xs text-gray-500">{formatTime(activeCheckIn?.checkInTime)}</p>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-300 rounded-full mb-2">
                <Clock className="text-gray-600 h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-gray-700">Check out</p>
              <p className="text-xs text-gray-500">{formatTime(activeCheckIn?.checkOutTime)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leads Statistics */}
      <div className="px-4 py-6">
        <h3 className="text-lg font-semibold text-white mb-4">Leads Statistics</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <MetricCard
            title="Follow Up Leads"
            value={stats?.followUp || 0}
            icon="phone"
            borderColor="border-success"
            iconColor="text-success"
          />
          <MetricCard
            title="Green Leads"
            value={stats?.green || 0}
            icon="filter"
            borderColor="border-success"
            iconColor="text-success"
          />
          <MetricCard
            title="Amber Leads"
            value={stats?.amber || 0}
            icon="warning"
            borderColor="border-warning"
            iconColor="text-warning"
          />
          <MetricCard
            title="Red Leads"
            value={stats?.red || 0}
            icon="x-circle"
            borderColor="border-error"
            iconColor="text-error"
          />
          <MetricCard
            title="Query Leads"
            value={stats?.query || 0}
            icon="help-circle"
            borderColor="border-success"
            iconColor="text-success"
          />
          <MetricCard
            title="Leads In LOS"
            value={stats?.los || 0}
            icon="users"
            borderColor="border-primary"
            iconColor="text-primary"
          />
          <MetricCard
            title="Leads Sanctioned"
            value={stats?.sanctioned || 0}
            icon="handshake"
            borderColor="border-success"
            iconColor="text-success"
          />
          <MetricCard
            title="Leads Disbursed"
            value={stats?.disbursed || 0}
            icon="handshake"
            borderColor="border-success"
            iconColor="text-success"
          />
          <MetricCard
            title="Total Leads"
            value={stats?.total || 0}
            icon="users"
            borderColor="border-primary"
            iconColor="text-primary"
          />
          <MetricCard
            title="Leads Rejected"
            value={stats?.rejected || 0}
            icon="x"
            borderColor="border-error"
            iconColor="text-error"
          />
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => setLocation("/client-form")}
            className="w-full bg-white text-primary hover:bg-gray-50 shadow-sm"
            size="lg"
          >
            <span className="mr-2">+</span>
            Add New Client
          </Button>
          <Button
            onClick={() => setLocation("/leads")}
            className="w-full bg-white text-primary hover:bg-gray-50 shadow-sm"
            size="lg"
          >
            View All Leads
          </Button>
          <Button
            onClick={() => setLocation("/admin")}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
            size="lg"
          >
            <Shield className="h-4 w-4 mr-2" />
            Admin Panel
          </Button>
        </div>
      </div>

      <BottomNavigation currentPage="home" />
      <CheckInModal 
        isOpen={showCheckInModal} 
        onClose={() => setShowCheckInModal(false)} 
      />
    </div>
  );
}
