import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEmployee } from "@/hooks/useEmployee";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import ClientFormPage from "@/pages/client-form";
import LeadsListPage from "@/pages/leads-list";
import ProfilePage from "@/pages/profile";
import AdminPanelPage from "@/pages/admin-panel";
import NotificationsPage from "@/pages/notifications";
import SettingsPage from "@/pages/settings";

function Router() {
  const { isAuthenticated, isLoading } = useEmployee();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={LoginPage} />
      ) : (
        <>
          <Route path="/" component={DashboardPage} />
          <Route path="/client-form" component={ClientFormPage} />
          <Route path="/leads" component={LeadsListPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/admin" component={AdminPanelPage} />
          <Route path="/notifications" component={NotificationsPage} />
          <Route path="/settings" component={SettingsPage} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
