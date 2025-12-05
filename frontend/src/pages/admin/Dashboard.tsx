import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Building2, FlaskConical, Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { Job, JobStatus } from "@shared/schema";
import { analyticsApi } from "@/lib/services";

interface DashboardStats {
  totalJobs: number;
  pendingReviews: number;
  completedTests: number;
  activeMsmes: number;
  activeAgencies: number;
  totalProducts: number;
  recentJobs: (Job & { product?: { name: string }; msme?: { name: string } })[];
  statusBreakdown: Record<JobStatus, number>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        const data = await analyticsApi.getAdminStats() as DashboardStats;
        setStats(data);
      } catch (error) {
        // Error fetching stats
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your testing management system
          </p>
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
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold text-amber-600" data-testid="stat-pending-reviews">
                  {stats?.pendingReviews ?? 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <CardTitle className="text-sm font-medium">Active MSMEs</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold" data-testid="stat-active-msmes">
                  {stats?.activeMsmes ?? 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <CardTitle className="text-sm font-medium">Testing Agencies</CardTitle>
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold" data-testid="stat-active-agencies">
                  {stats?.activeAgencies ?? 0}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
              <CardTitle className="text-lg">Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {(["UNDER_TESTING", "UNDER_REVIEW", "APPROVED", "REJECTED"] as JobStatus[]).map((status) => (
                    <div key={status} className="flex items-center justify-between gap-2 flex-wrap">
                      <StatusBadge status={status} />
                      <span className="font-medium text-lg" data-testid={`stat-status-${status.toLowerCase()}`}>
                        {stats?.statusBreakdown?.[status] ?? 0}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
              <CardTitle className="text-lg">Recent Jobs</CardTitle>
              <Link href="/admin/jobs">
                <Button variant="ghost" size="sm" data-testid="link-view-all-jobs">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : stats?.recentJobs?.length ? (
                <div className="space-y-3">
                  {stats.recentJobs.slice(0, 5).map((job) => {
                    const jobId = getEntityId(job);
                    return (
                      <Link key={jobId} href={`/admin/jobs/${jobId}`}>
                        <div
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg border hover-elevate cursor-pointer"
                          data-testid={`job-row-${jobId}`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{job.title}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {job.product?.name} • {job.msme?.name}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <StatusBadge status={job.currentStatus} />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No jobs yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/products">
            <Card className="hover-elevate cursor-pointer">
              <CardContent className="flex items-center gap-4 p-4 sm:p-6">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">Products</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {stats?.totalProducts ?? 0} registered
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/msmes">
            <Card className="hover-elevate cursor-pointer">
              <CardContent className="flex items-center gap-4 p-4 sm:p-6">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-blue-500/10 flex-shrink-0">
                  <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">MSMEs</p>
                  <p className="text-sm text-muted-foreground truncate">
                    Manage enterprises
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/agencies">
            <Card className="hover-elevate cursor-pointer">
              <CardContent className="flex items-center gap-4 p-4 sm:p-6">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-teal-500/10 flex-shrink-0">
                  <FlaskConical className="h-5 w-5 sm:h-6 sm:w-6 text-teal-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">Agencies</p>
                  <p className="text-sm text-muted-foreground truncate">
                    Manage testing agencies
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}
