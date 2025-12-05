import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { FileText, CheckCircle, Clock, XCircle, TrendingUp, Building2, FlaskConical } from "lucide-react";
import { JobStatus } from "@shared/schema";
import { analyticsApi } from "@/lib/services";

interface AnalyticsData {
  totalJobs: number;
  pendingReviews: number;
  approvedJobs: number;
  rejectedJobs: number;
  activeMsmes: number;
  activeAgencies: number;
  statusBreakdown: Record<JobStatus, number>;
  monthlyJobs: { month: string; count: number }[];
  agencyPerformance: { name: string; completed: number }[];
}

const STATUS_COLORS: Record<JobStatus, string> = {
  DRAFT: "hsl(var(--muted))",
  UNDER_TESTING: "hsl(45, 93%, 47%)",
  UNDER_REVIEW: "hsl(217, 91%, 60%)",
  APPROVED: "hsl(142, 71%, 45%)",
  REJECTED: "hsl(0, 84%, 60%)",
};

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const data = await analyticsApi.getAdminAnalytics() as AnalyticsData;
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const pieData = analytics?.statusBreakdown
    ? Object.entries(analytics.statusBreakdown)
        .filter(([_, count]) => count > 0)
        .map(([status, count]) => ({
          name: status.replace(/_/g, " "),
          value: count,
          color: STATUS_COLORS[status as JobStatus],
        }))
    : [];

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Insights and metrics for your testing operations
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
                <div className="text-3xl font-bold" data-testid="analytics-total-jobs">
                  {analytics?.totalJobs ?? 0}
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
                <div className="text-3xl font-bold text-green-600" data-testid="analytics-approved">
                  {analytics?.approvedJobs ?? 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold text-amber-600" data-testid="analytics-pending">
                  {analytics?.pendingReviews ?? 0}
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
                <div className="text-3xl font-bold text-red-600" data-testid="analytics-rejected">
                  {analytics?.rejectedJobs ?? 0}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Job Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Job Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : analytics?.monthlyJobs?.length ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.monthlyJobs}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle>Active MSMEs</CardTitle>
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold" data-testid="analytics-msmes">
                    {analytics?.activeMsmes ?? 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Registered enterprises using the platform
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle>Testing Agencies</CardTitle>
              <FlaskConical className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold" data-testid="analytics-agencies">
                    {analytics?.activeAgencies ?? 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Certified agencies conducting tests
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {analytics?.agencyPerformance && analytics.agencyPerformance.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Agency Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.agencyPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" width={150} className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="completed" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
