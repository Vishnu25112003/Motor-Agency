import { useState, useCallback, useEffect } from "react";
import { useParams, Link } from "wouter";
import { DashboardShell } from "@/components/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { FileText } from "lucide-react";
import { format } from "date-fns";
import { Job, TestResult, JobAudit, TestingAgency } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle, XCircle, Loader2, ExternalLink, Building2, FlaskConical, Package } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AuditTrail } from "@/components/AuditTrail";
import { jobsApi, agenciesApi } from "@/lib/services";

interface JobDetail extends Job {
  product?: { id?: string; name: string; category?: string };
  msme?: { id?: string; name: string; email?: string };
  detailsFile?: { id: number; secureUrl?: string; filename?: string };
  assignedAgency?: { name: string };
  testResults?: (TestResult & { agency?: { name: string }; resultFile?: { secureUrl?: string; filename?: string } })[];
  audits?: JobAudit[];
}

export default function AdminJobDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const [job, setJob] = useState<JobDetail | null>(null);
  const [agencies, setAgencies] = useState<TestingAgency[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewAction, setReviewAction] = useState<"approve" | "reject">("approve");
  const [isReviewing, setIsReviewing] = useState(false);

  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [filePreviewType, setFilePreviewType] = useState<string | null>(null);

  const idMissing = !id || id.trim() === "";

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

  const loadAgencies = useCallback(async () => {
    try {
      const data = await agenciesApi.getAgencies() as TestingAgency[];
      setAgencies(data);
    } catch (err) {
      setAgencies(null);
    }
  }, []);

  useEffect(() => {
    if (idMissing) return;
    let mounted = true;
    (async () => {
      const j = await loadJob(id as string);
      if (!mounted) return;
      await loadAgencies();

      // preview details file if available
      if ((j as any)?.detailsFile?.secureUrl) {
        try {
          const res = await fetch((j as any).detailsFile.secureUrl, { mode: "cors" });
          const ct = res.headers.get("content-type") || "";
          setFilePreviewType(ct);
          if (ct.startsWith("text/") || ct.includes("json") || ct.includes("xml")) {
            const txt = await res.text();
            if (mounted) setFilePreview(txt);
          } else {
            if (mounted) setFilePreview(null);
          }
        } catch (e) {
          if (mounted) {
            setFilePreview(null);
            setFilePreviewType(null);
          }
        }
      }
    })();
    return () => { mounted = false; };
  }, [id, idMissing, loadJob, loadAgencies]);

  if (idMissing) {
    return (
      <DashboardShell>
        <div className="text-center py-12">
          <h2 className="text-xl font-medium">Job not found</h2>
          <Link href="/admin/jobs">
            <Button variant="ghost" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>
      </DashboardShell>
    );
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
          <Link href="/admin/jobs">
            <Button variant="ghost" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const canAssign = job.currentStatus === "UNDER_TESTING" && !job.assignedAgencyId;
  const canReview = job.currentStatus === "UNDER_REVIEW";

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <Link href="/admin/jobs">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
          <h1 className="text-3xl font-semibold">Job Details</h1>
          <p className="text-muted-foreground mt-1">
            Review and manage testing job information
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
                <CardTitle>Assigned Agency</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Agency:</strong> {job.assignedAgency?.name || "Not assigned"}</p>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Current Status</CardTitle>
              </CardHeader>
              <CardContent>
                <StatusBadge status={job.currentStatus} />
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Created</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{format(new Date(job.createdAt), "MMM d, yyyy")}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex gap-4">
          {canAssign && (
            <Button onClick={() => setAssignDialogOpen(true)} className="w-full">
              <Building2 className="h-4 w-4" />
              Assign Agency
            </Button>
          )}

          {canReview && (
            <Button onClick={() => setReviewDialogOpen(true)} className="w-full">
              <FileText className="h-4 w-4" />
              Review Job
            </Button>
          )}
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              {job.testResults?.length ? (
                <div className="space-y-4">
                  {job.testResults.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{result.agency?.name || "Unknown Agency"}</p>
                          <p className="text-sm text-muted-foreground">
                            Score: <span className="font-bold">{result.score || "N/A"}</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Submitted: {format(new Date(result.submittedAt), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div>
                        {result.resultFile && (
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground">
                              <strong>Result File:</strong>
                              <a
                                href={result.resultFile.secureUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                              >
                                View Result File
                              </a>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No test results submitted yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
            </CardHeader>
            <CardContent>
              <AuditTrail audits={job.audits || []} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Assign Agency Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={(open) => !open && setAssignDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Testing Agency</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <label className="text-sm font-medium">Select Agency</label>
            <Select value={selectedAgency} onValueChange={(val) => setSelectedAgency(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select an agency" />
              </SelectTrigger>
              <SelectContent>
                {agencies?.map((agency) => {
                  const agencyId = agency.id || agency._id;
                  return (
                    <SelectItem key={agencyId} value={agencyId?.toString() || ''}>
                      {agency.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={async () => {
                if (selectedAgency) {
                  try {
                    setIsAssigning(true);
                    const jobId = (job as any).id || (job as any)._id;
                    await jobsApi.assignJob(jobId, selectedAgency);
                    toast({ title: "Agency assigned successfully" });
                    setAssignDialogOpen(false);
                    setSelectedAgency("");
                    await loadJob(jobId);
                  } catch (error: any) {
                    const message = error.response?.data?.message || error.message || "Failed to assign agency";
                    toast({ title: "Failed to assign agency", description: message, variant: "destructive" });
                  } finally {
                    setIsAssigning(false);
                  }
                }
              }}
              disabled={!selectedAgency || isAssigning}
            >
              {isAssigning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Building2 className="h-4 w-4" />
                  Assign Agency
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={(open) => !open && setReviewDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Job</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Review Action</label>
              <RadioGroup value={reviewAction} onValueChange={(value) => setReviewAction(value as "approve" | "reject")} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="approve" id="approve" />
                  <Label htmlFor="approve" className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Approve Job
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="reject" id="reject" />
                  <Label htmlFor="reject" className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    Reject Job
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <label className="text-sm font-medium">
                Review Notes <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={reviewAction === "approve" ? "Enter approval notes..." : "Enter rejection reason..."}
                rows={4}
                className="w-full mt-2"
              />
              {reviewNotes.trim() === "" && (
                <p className="text-sm text-red-500 mt-1">Review notes are required</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={async () => {
                if (!reviewNotes.trim()) {
                  toast({ 
                    title: "Review notes required", 
                    description: "Please enter review notes before submitting",
                    variant: "destructive" 
                  });
                  return;
                }
                
                try {
                  setIsReviewing(true);
                  const jobId = (job as any).id || (job as any)._id;
                  await jobsApi.approveJob(jobId, reviewAction === "approve", reviewNotes);
                  toast({ title: `Job ${reviewAction === "approve" ? "approved" : "rejected"} successfully` });
                  setReviewDialogOpen(false);
                  setReviewNotes("");
                  await loadJob(jobId);
                } catch (error: any) {
                  const message = error.response?.data?.message || error.message || "Failed to review job";
                  toast({ title: "Failed to review job", description: message, variant: "destructive" });
                } finally {
                  setIsReviewing(false);
                }
              }}
              disabled={isReviewing || !reviewNotes.trim()}
            >
              {isReviewing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {reviewAction === "approve" ? "Approving..." : "Rejecting..."}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  {reviewAction === "approve" ? "Approve" : "Reject"}
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}