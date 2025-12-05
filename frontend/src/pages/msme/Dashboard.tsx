import { useState, useEffect } from "react";
import { Link } from "wouter";
import { DashboardShell } from "@/components/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { Job, JobStatus } from "@shared/schema";
import { msmeApi } from "@/lib/services";

interface MSMEStats {
  totalJobs: number;
  pendingJobs: number;
  approvedJobs: number;
  rejectedJobs: number;
  recentJobs: (Job & { product?: { name: string } })[];
}

export default function MSMEDashboard() {
  const [stats, setStats] = useState<MSMEStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Safely extract an id string from various possible shapes returned by the backend
  const getEntityId = (entity: any): string => {
    if (!entity) return "";
    if (typeof entity.id === "string" && entity.id) return entity.id;
    const raw = (entity as any)._id;
    if (!raw) return "";
    if (typeof raw === "string") return raw;
    if (typeof raw.toString === "function") return raw.toString();
    if (raw.$oid) return raw.$oid;
    if (raw.$id) return raw.$id;
    return "";
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await msmeApi.getMSMEStats() as MSMEStats;
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch MSME stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Overview of your testing jobs
            </p>
          </div>
          <Link href="/msme/jobs/new">
            <Button data-testid="button-create-job">
              <Plus className="h-4 w-4 mr-2" />
              Create New Job
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold" data-testid="stat-total-jobs">
                  {stats?.totalJobs ?? 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold text-amber-600" data-testid="stat-pending-jobs">
                  {stats?.pendingJobs ?? 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold text-green-600" data-testid="stat-approved-jobs">
                  {stats?.approvedJobs ?? 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold text-red-600" data-testid="stat-rejected-jobs">
                  {stats?.rejectedJobs ?? 0}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Recent Jobs</CardTitle>
            <Link href="/msme/jobs">
              <Button variant="ghost" size="sm" data-testid="link-view-all-jobs">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : stats?.recentJobs?.length ? (
              <div className="space-y-3">
                {stats.recentJobs.slice(0, 5).map((job) => {
                  const jobId = getEntityId(job);
                  return (
                    <Link key={jobId} href={`/msme/jobs/${jobId}`}>
                      <div
                        className="flex items-center justify-between p-4 rounded-lg border hover:elevate cursor-pointer"
                        data-testid={`job-row-${jobId}`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{job.title}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <span>{job.product?.name}</span>
                            <span>•</span>
                            <span>{format(new Date(job.createdAt), "MMM d, yyyy")}</span>
                          </div>
                        </div>
                        <StatusBadge status={job.currentStatus} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted mb-4">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium">No jobs yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first testing job to get started
                </p>
                <Link href="/msme/jobs/new">
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Job
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
