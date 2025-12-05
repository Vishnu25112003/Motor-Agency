import { Badge } from "@/components/ui/badge";
import { JobStatus } from "@shared/schema";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, FileSearch, XCircle, FileEdit, UserCheck } from "lucide-react";

interface StatusBadgeProps {
  status: JobStatus;
  className?: string;
}

const statusConfig: Record<JobStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode; className: string }> = {
  DRAFT: {
    label: "Draft",
    variant: "secondary",
    icon: <FileEdit className="h-3 w-3" />,
    className: "bg-muted text-muted-foreground",
  },
  UNDER_TESTING: {
    label: "Under Testing",
    variant: "outline",
    icon: <Clock className="h-3 w-3" />,
    className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  },
  ASSIGNED: {
    label: "Assigned",
    variant: "outline",
    icon: <UserCheck className="h-3 w-3" />,
    className: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    variant: "outline",
    icon: <FileSearch className="h-3 w-3" />,
    className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  },
  APPROVED: {
    label: "Approved",
    variant: "default",
    icon: <CheckCircle className="h-3 w-3" />,
    className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
  },
  REJECTED: {
    label: "Rejected",
    variant: "destructive",
    icon: <XCircle className="h-3 w-3" />,
    className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 font-medium border",
        config.className,
        className
      )}
      data-testid={`badge-status-${status.toLowerCase()}`}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
}
