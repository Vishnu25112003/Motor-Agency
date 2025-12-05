import { useState, useEffect } from "react";
import { Link } from "wouter";
import { DashboardShell } from "@/components/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { ClipboardList, CheckCircle, Clock, FileText, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { Job } from "@shared/schema";
import { agenciesApi } from "@/lib/services";

interface AgencyStats {
  availableJobs: number;
  completedTests: number;
  pendingSubmissions: number;
  recentJobs: (Job & { product?: { name: string }; msme?: { name: string } })[];
}

export default function AgencyDashboard() {
  const [stats, setStats] = useState<AgencyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const fetchStats = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      const data = await agenciesApi.getAgencyStats() as AgencyStats;
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch agency stats:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Auto-refresh stats every 30 seconds to keep data up-to-date
    const interval = setInterval(() => {
      fetchStats(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchStats(true);
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Overview of your testing assignments
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <CardTitle className="text-sm font-medium">Available Jobs</CardTitle>
              <ClipboardList className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold text-amber-600" data-testid="stat-available-jobs">
                  {stats?.availableJobs ?? 0}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Awaiting your test results</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <CardTitle className="text-sm font-medium">Completed Tests</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold text-green-600" data-testid="stat-completed-tests">
                  {stats?.completedTests ?? 0}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Tests submitted this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold text-blue-600" data-testid="stat-pending-submissions">
                  {stats?.pendingSubmissions ?? 0}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Awaiting admin approval</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Jobs Assigned to You</CardTitle>
            <Link href="/agency/jobs">
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
                  <Link key={jobId} href={`/agency/jobs/${jobId}`}>
                    <div
                      className="flex items-center justify-between p-4 rounded-lg border hover-elevate cursor-pointer"
                      data-testid={`job-row-${jobId}`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{job.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span>{job.product?.name}</span>
                          <span>•</span>
                          <span>{job.msme?.name}</span>
                        </div>
                      </div>
                      <StatusBadge status={job.currentStatus} />
                    </div>
                  </Link>
                )})}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted mb-4">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium">No jobs assigned</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Jobs assigned to you will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
