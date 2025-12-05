import { useState, useEffect } from "react";
import { Link } from "wouter";
import { DashboardShell } from "@/components/DashboardShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { FileText, ExternalLink, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { TestResult, Job } from "@shared/schema";
import { agenciesApi } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";

interface SubmissionWithJob extends TestResult {
  job?: Job & { product?: { name: string }; msme?: { name: string } };
}

export default function AgencySubmissions() {
  const [submissions, setSubmissions] = useState<SubmissionWithJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchSubmissions = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      const data = await agenciesApi.getAgencySubmissions() as SubmissionWithJob[];
      setSubmissions(data);
    } catch (error: any) {
      toast({ 
        title: "Failed to fetch submissions", 
        description: error.message || "Please try again later",
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();

    // Auto-refresh submissions every 30 seconds
    const interval = setInterval(() => {
      fetchSubmissions(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchSubmissions(true);
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">My Submissions</h1>
            <p className="text-muted-foreground mt-1">
              View your submitted test results
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

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : submissions?.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>MSME</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Job Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id} data-testid={`submission-row-${submission.id}`}>
                      <TableCell className="font-medium">
                        {submission.job?.title || "-"}
                      </TableCell>
                      <TableCell>{submission.job?.product?.name || "-"}</TableCell>
                      <TableCell>{submission.job?.msme?.name || "-"}</TableCell>
                      <TableCell>
                        {submission.score !== null ? submission.score : "-"}
                      </TableCell>
                      <TableCell>
                        {submission.job && (
                          <StatusBadge status={submission.job.currentStatus} />
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(submission.submittedAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {submission.job && (
                          <Link href={`/agency/jobs/${submission.job.id}`}>
                            <Button variant="ghost" size="icon" data-testid={`button-view-${submission.id}`}>
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted mb-4">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium">No submissions yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your submitted test results will appear here
                </p>
                <Link href="/agency/jobs">
                  <Button className="mt-4" variant="outline">
                    View Available Jobs
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
