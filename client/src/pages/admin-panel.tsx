import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Plus, Eye, EyeOff, Edit, Trash2, Shield } from "lucide-react";
import { Employee } from "@shared/schema";
import Logo from "@/components/logo";

const createEmployeeSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  mobileNumber: z.string().min(10, "Valid mobile number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().min(1, "Role is required"),
  branch: z.string().min(1, "Branch is required"),
});

type CreateEmployeeForm = z.infer<typeof createEmployeeSchema>;

export default function AdminPanelPage() {
  const [, setLocation] = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordFor, setShowPasswordFor] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateEmployeeForm>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      employeeId: "",
      mobileNumber: "",
      password: "",
      role: "Executive",
      branch: "",
    },
  });

  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ["/api/admin/employees"],
  });

  const createEmployeeMutation = useMutation({
    mutationFn: async (data: CreateEmployeeForm) => {
      const response = await apiRequest("POST", "/api/admin/employees", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Employee created successfully",
        description: "The new employee account has been created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/employees"] });
      setShowCreateModal(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to create employee",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (employeeId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/employees/${employeeId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Employee deleted successfully",
        description: "The employee account has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/employees"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete employee",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateEmployeeForm) => {
    createEmployeeMutation.mutate(data);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      deleteEmployeeMutation.mutate(employeeId);
    }
  };

  const togglePasswordVisibility = (employeeId: string) => {
    setShowPasswordFor(showPasswordFor === employeeId ? null : employeeId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
        <div className="text-white text-lg">Loading admin panel...</div>
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
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setLocation("/")}
              className="text-primary"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold text-gray-800">Admin Panel</h1>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary hover:bg-primary/90"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Employee
            </Button>
          </div>
        </div>
      </div>

      {/* Employee Management */}
      <div className="px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Employee Management</span>
              <Badge variant="outline">{employees.length} Total</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employees.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No employees found.</p>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 bg-primary hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create First Employee
                  </Button>
                </div>
              ) : (
                employees.map((employee) => (
                  <Card key={employee.id} className="border-l-4 border-primary">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Employee ID</p>
                              <p className="text-gray-800">{employee.employeeId}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Mobile</p>
                              <p className="text-gray-800">{employee.mobileNumber}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Role</p>
                              <Badge variant="secondary">{employee.role}</Badge>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Branch</p>
                              <p className="text-gray-800">{employee.branch}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Password</p>
                              <div className="flex items-center space-x-2">
                                <p className="text-gray-800">
                                  {showPasswordFor === employee.id ? "password123" : "••••••••"}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => togglePasswordVisibility(employee.id)}
                                >
                                  {showPasswordFor === employee.id ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Status</p>
                              <Badge variant={employee.isActive ? "default" : "destructive"}>
                                {employee.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteEmployee(employee.id)}
                            disabled={deleteEmployeeMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Employee Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md" aria-describedby="create-employee-description">
          <DialogHeader>
            <DialogTitle>Create New Employee</DialogTitle>
            <p id="create-employee-description" className="text-sm text-gray-600 mt-2">
              Fill in the details to create a new employee account
            </p>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter employee ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Enter mobile number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Executive">Executive</SelectItem>
                        <SelectItem value="Senior Executive">Senior Executive</SelectItem>
                        <SelectItem value="Team Lead">Team Lead</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter branch name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCreateModal(false)}
                  disabled={createEmployeeMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={createEmployeeMutation.isPending}
                >
                  {createEmployeeMutation.isPending ? "Creating..." : "Create Employee"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}