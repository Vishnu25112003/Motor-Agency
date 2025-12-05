import { useState, useCallback, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { DashboardShell } from "@/components/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { StatusBadge } from "@/components/StatusBadge";
import { FileUploader } from "@/components/FileUploader";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, FileText, ExternalLink, Package, Building2, Loader2 } from "lucide-react";
import { jobsApi, filesApi } from "@/lib/services";
import { Job, TestResult } from "@shared/schema";
import { format } from "date-fns";

const testResultSchema = z.object({
  score: z.string().min(1, "Test score is required"),
  notes: z.string().min(1, "Test notes are required"),
  resultFileId: z.string().min(1, "Result file is required"),
});

type TestResultForm = z.infer<typeof testResultSchema>;

interface JobDetail extends Job {
  product?: { id?: string; name: string; category?: string };
  msme?: { id?: string; name: string; email?: string };
  detailsFile?: { id: number; secureUrl?: string; filename?: string };
  assignedAgency?: { name: string };
  testResults?: (TestResult & { agency?: { name: string }; resultFile?: { secureUrl?: string; filename?: string } })[];
}

export default function AgencyJobDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [job, setJob] = useState<JobDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);

  const form = useForm<TestResultForm>({
    resolver: zodResolver(testResultSchema),
    defaultValues: {
      score: "",
      notes: "",
      resultFileId: "",
    },
  });

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
    if (!id) return;
    loadJob(id);
  }, [id, loadJob]);

  function handleFileUploaded(fileId: string, filename: string) {
    setUploadedFileId(fileId);
    form.setValue("resultFileId", fileId);
    form.clearErrors("resultFileId");
  }

  async function onSubmit(data: TestResultForm) {
    if (!job) return;
    
    if (!uploadedFileId) {
      form.setError("resultFileId", { message: "Result file is required" });
      return;
    }
    
    try {
      setIsSubmitting(true);
      await jobsApi.submitTestResult(job.id, {
        score: Number(data.score),
        comments: data.notes,
        resultFileId: uploadedFileId,
      });
      
      toast({ title: "Test result submitted successfully" });
      setLocation("/agency/jobs");
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to submit test result";
      toast({ title: "Failed to submit test result", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (!job) {
    return (
      <DashboardShell>
        <div className="text-center py-12">
          <h2 className="text-xl font-medium">Job not found</h2>
          <Link href="/agency/jobs">
            <Button variant="ghost" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const canSubmitResult = job.currentStatus === "ASSIGNED" && job.assignedAgencyId;

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-4xl">
        <div>
          <Link href="/agency/jobs">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
          <h1 className="text-3xl font-semibold">Job Details</h1>
          <p className="text-muted-foreground mt-1">
            Review job information and submit test results
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Product:</strong> {job.product?.name || "-"}</p>
                <p><strong>Category:</strong> {job.product?.category || "-"}</p>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>MSME Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>MSME:</strong> {job.msme?.name || "-"}</p>
                <p><strong>Email:</strong> {job.msme?.email || "-"}</p>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Title:</strong> {job.title}</p>
                <p><strong>Description:</strong> {job.description || "-"}</p>
                <p><strong>Created:</strong> {format(new Date(job.createdAt), "MMM d, yyyy")}</p>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <StatusBadge status={job.currentStatus} />
                {job.assignedAgencyId && (
                  <p className="text-sm text-muted-foreground mt-2">
                    This job is assigned to your agency
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {job.detailsFile && (
          <Card>
            <CardHeader>
              <CardTitle>Supporting Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href={job.detailsFile.secureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 underline"
              >
                <FileText className="h-4 w-4" />
                View Job Details Document
                <ExternalLink className="h-3 w-3" />
              </a>
            </CardContent>
          </Card>
        )}

        {canSubmitResult && (
          <Card>
            <CardHeader>
              <CardTitle>Submit Test Result</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="score"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Test Score <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter test score"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Test Notes <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter detailed test results and observations"
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="resultFileId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Result File (PDF) <span className="text-red-500">*</span></FormLabel>
                        <p className="text-sm text-muted-foreground mb-2">
                          Upload the official test result document
                        </p>
                        <FileUploader
                          onFileUploaded={handleFileUploaded}
                          accept=".pdf"
                          maxSize={10 * 1024 * 1024}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Link href="/agency/jobs">
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </Link>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Submit Result
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {job.testResults && job.testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Previous Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {job.testResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{result.agency?.name || "Unknown Agency"}</p>
                        <p className="text-sm text-muted-foreground">
                          Score: <span className="font-bold">{result.score || "N/A"}</span>
                        </p>
                        {(result as any).notes && (
                          <p className="text-sm mt-2">{(result as any).notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Submitted: {format(new Date(result.submittedAt), "MMM d, yyyy")}
                        </p>
                        {result.resultFile && (
                          <a
                            href={result.resultFile.secureUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline text-sm"
                          >
                            View Result File
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}