import { JobAudit, JobStatus } from "@shared/schema";
import { StatusBadge } from "./StatusBadge";
import { ArrowRight, Clock } from "lucide-react";
import { format } from "date-fns";

interface AuditTrailProps {
  audits: JobAudit[];
}

function getActorLabel(type: string, id: string | number | null | undefined): string {
  if (!id) return "System";
  return `${type} #${id}`;
}

export function AuditTrail({ audits }: AuditTrailProps) {
  if (audits.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground" data-testid="empty-audit-trail">
        No audit history available
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="audit-trail">
      {audits.map((audit, index) => (
        <div
          key={audit.id || `audit-${index}`}
          className="relative pl-6 pb-4 last:pb-0"
          data-testid={`audit-entry-${audit.id || index}`}
        >
          {index < audits.length - 1 && (
            <div className="absolute left-[9px] top-6 bottom-0 w-px bg-border" />
          )}
          
          <div className="absolute left-0 top-1.5 h-[18px] w-[18px] rounded-full border-2 border-primary bg-background flex items-center justify-center">
            <Clock className="h-2.5 w-2.5 text-primary" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {audit.previousStatus && (
                <>
                  <StatusBadge status={audit.previousStatus as JobStatus} />
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </>
              )}
              <StatusBadge status={audit.newStatus as JobStatus} />
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                Changed by: {getActorLabel(audit.changedByType, audit.changedById)}
              </span>
              <span>
                {format(new Date(audit.changedAt), "MMM d, yyyy 'at' h:mm a")}
              </span>
            </div>
            
            {audit.notes && (
              <p className="text-sm text-foreground bg-muted/50 rounded-md p-2 mt-2">
                {audit.notes}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
