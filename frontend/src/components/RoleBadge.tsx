import { Badge } from "@/components/ui/badge";
import { UserType } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Shield, Building2, FlaskConical } from "lucide-react";

interface RoleBadgeProps {
  role: UserType;
  className?: string;
}

const roleConfig: Record<UserType, { label: string; icon: React.ReactNode; className: string }> = {
  ADMIN: {
    label: "Admin",
    icon: <Shield className="h-3 w-3" />,
    className: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
  },
  MSME: {
    label: "MSME",
    icon: <Building2 className="h-3 w-3" />,
    className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  },
  AGENCY: {
    label: "Agency",
    icon: <FlaskConical className="h-3 w-3" />,
    className: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800",
  },
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const config = roleConfig[role];
  
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 font-medium border",
        config.className,
        className
      )}
      data-testid={`badge-role-${role.toLowerCase()}`}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
}
