import { Card, CardContent } from "@/components/ui/card";
import { 
  Phone, 
  Filter, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  Users, 
  Handshake, 
  X 
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number;
  icon: string;
  borderColor: string;
  iconColor: string;
}

const iconMap = {
  phone: Phone,
  filter: Filter,
  warning: AlertTriangle,
  "x-circle": XCircle,
  "help-circle": HelpCircle,
  users: Users,
  handshake: Handshake,
  x: X,
};

export default function MetricCard({ title, value, icon, borderColor, iconColor }: MetricCardProps) {
  const IconComponent = iconMap[icon as keyof typeof iconMap] || Users;

  return (
    <Card className={`bg-white shadow-sm border-l-4 ${borderColor} hover:shadow-md transition-shadow`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value.toLocaleString()}</p>
          </div>
          <IconComponent className={`h-5 w-5 ${iconColor}`} />
        </div>
      </CardContent>
    </Card>
  );
}
