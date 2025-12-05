import { Link } from "wouter";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { CheckSquare, ExternalLink, FileText, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { Job, TestResult } from "@shared/schema";
import { jobsApi } from "@/lib/services";

interface JobWithRelations extends Job {
  product?: { name: string };
  msme?: { name: string };
  assignedAgency?: { name: string };
  testResults?: (TestResult & { agency?: { name: string }; resultFile?: { secureUrl?: string; filename?: string } })[];
}

export default function AdminReviews() {
  const [jobs, setJobs] = useState<JobWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        const data = await jobsApi.getJobs() as JobWithRelations[];
        setJobs(data);
      } catch (error) {
        // Error fetching jobs
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const pendingJobs = jobs?.filter(j => j.currentStatus === "UNDER_REVIEW") || [];

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Job Reviews</h1>
          <p className="text-muted-foreground mt-1">
            Review and approve/reject jobs that have completed testing
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Pending Reviews ({pendingJobs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : pendingJobs.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>MSME</TableHead>
                    <TableHead>Testing Agency</TableHead>
                    <TableHead>Test Results</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingJobs.map((job) => {
                    const jobId = (job as any).id ?? (job as any)._id ?? "";
                    const hasTestResults = job.testResults && job.testResults.length > 0;
                    const latestResult = hasTestResults && job.testResults ? job.testResults[job.testResults.length - 1] : null;
                    
                    return (
                      <TableRow key={jobId || Math.random().toString(36).slice(2)} data-testid={`review-row-${jobId}`}>
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell>{job.product?.name || "-"}</TableCell>
                        <TableCell>{job.msme?.name || "-"}</TableCell>
                        <TableCell>{job.assignedAgency?.name || "-"}</TableCell>
                        <TableCell>
                          {hasTestResults ? (
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <span className="text-sm">
                                Score: <span className="font-bold">{latestResult?.score || "N/A"}</span>
                              </span>
                              {latestResult?.resultFile && (
                                <a
                                  href={latestResult.resultFile.secureUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 underline text-sm"
                                >
                                  View File
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">No results</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={job.currentStatus} />
                        </TableCell>
                        <TableCell>
                          {format(new Date(job.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          {jobId ? (
                            <Link href={`/admin/jobs/${jobId}`}>
                              <Button variant="default" size="sm" data-testid={`button-review-${jobId}`}>
                                Review
                              </Button>
                            </Link>
                          ) : (
                            <Button variant="default" size="sm" disabled>
                              Review
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted mb-4">
                  <CheckSquare className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium">No pending reviews</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Jobs awaiting review will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
