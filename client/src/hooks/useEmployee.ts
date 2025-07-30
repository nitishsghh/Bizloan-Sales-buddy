import { useQuery } from "@tanstack/react-query";
import { Employee } from "@shared/schema";

export function useEmployee() {
  const { data: employee, isLoading, error } = useQuery<Employee>({
    queryKey: ["/api/auth/employee/current"],
    retry: false,
  });

  return {
    employee,
    isLoading,
    error,
    isAuthenticated: !!employee,
  };
}