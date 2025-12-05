import { useState, useCallback, useEffect } from "react";
import { useParams, Link } from "wouter";
import { DashboardShell } from "@/components/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { AuditTrail } from "@/components/AuditTrail";
import { ArrowLeft, FileText, ExternalLink, Package, FlaskConical } from "lucide-react";
import { Job, TestResult, JobAudit } from "@shared/schema";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { jobsApi } from "@/lib/services";

interface JobDetail extends Job {
  product?: { id: number; name: string; category?: string };
  detailsFile?: { id: number; secureUrl?: string; filename?: string };
  assignedAgency?: { id: number; name: string };
  testResults?: (TestResult & { agency?: { name: string }; resultFile?: { secureUrl?: string; filename?: string } })[];
  audits?: JobAudit[];
}

export default function MSMEJobDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const [job, setJob] = useState<JobDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadJob = useCallback(async (jobId: string) => {
    try {
      setIsLoading(true);
      const data = await jobsApi.getJob(jobId) as JobDetail;
      setJob(data);
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to load job";
      toast({ title: "Failed to load job", description: message, variant: "destructive" });
      setJob(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!id || id.trim() === "") return;
    loadJob(id as string);
  }, [id, loadJob]);


  if (isLoading) {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardShell>
    );
  }

  if (!job) {
    return (
      <DashboardShell>
        <div className="text-center py-12">
          <h2 className="text-xl font-medium">Job not found</h2>
          <Link href="/msme/jobs">
            <Button variant="ghost" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <Link href="/msme/jobs">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
          <h1 className="text-3xl font-semibold">{job.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <StatusBadge status={job.currentStatus} />
            <span className="text-muted-foreground">
              Created {format(new Date(job.createdAt), "MMM d, yyyy")}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.description && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="mt-1">{job.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Product</label>
                    <p className="mt-1 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      {job.product?.name}
                      {job.product?.category && (
                        <span className="text-muted-foreground">({job.product.category})</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Assigned Agency</label>
                    <p className="mt-1 flex items-center gap-2">
                      <FlaskConical className="h-4 w-4" />
                      {job.assignedAgency?.name || "Not yet assigned"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status Updated</label>
                    <p className="mt-1">
                      {format(new Date(job.statusUpdatedAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {job.detailsFile && (
              <Card>
                <CardHeader>
                  <CardTitle>Attached Document</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{job.detailsFile.filename || "Document"}</p>
                      <p className="text-sm text-muted-foreground">PDF Document</p>
                    </div>
                    {job.detailsFile.secureUrl && (
                      <a href={job.detailsFile.secureUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" data-testid="button-view-document">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {job.testResults && job.testResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Test Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {job.testResults.map((result) => (
                    <div key={result.id} className="p-4 rounded-lg border space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          Submitted by {result.agency?.name || "Testing Agency"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(result.submittedAt), "MMM d, yyyy")}
                        </span>
                      </div>
                      {result.score !== null && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Score</label>
                          <p className="text-2xl font-bold">{result.score}</p>
                        </div>
                      )}
                      {result.comments && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Comments</label>
                          <p className="mt-1">{result.comments}</p>
                        </div>
                      )}
                      {result.resultFile && result.resultFile.secureUrl && (
                        <a href={result.resultFile.secureUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            View Result File
                          </Button>
                        </a>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Status History</CardTitle>
              </CardHeader>
              <CardContent>
                <AuditTrail audits={job.audits || []} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
