import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: employee, isLoading } = useQuery({
    queryKey: ["/api/auth/employee/current"],
    retry: false,
  });

  return {
    user: employee,
    employee,
    isLoading,
    isAuthenticated: !!employee,
  };
}
