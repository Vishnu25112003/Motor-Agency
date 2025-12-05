import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import JobsView from "@/components/JobsView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Job } from "@shared/schema";
import { agenciesApi, jobsApi } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Hand, RefreshCw } from "lucide-react";

interface JobWithRelations extends Job {
  product?: { name: string };
  msme?: { name: string };
}

interface AgencyJobsResponse {
  assigned: JobWithRelations[];
  available: JobWithRelations[];
}

export default function AgencyJobs() {
  const [jobsData, setJobsData] = useState<AgencyJobsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [claimingJob, setClaimingJob] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchJobs = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      const data = await agenciesApi.getAgencyJobs() as AgencyJobsResponse;
      setJobsData(data);
    } catch (error) {
      console.error('Failed to fetch agency jobs:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();

    // Auto-refresh jobs every 30 seconds
    const interval = setInterval(() => {
      fetchJobs(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleClaimJob = async (jobId: string) => {
    try {
      setClaimingJob(jobId);
      await jobsApi.claimJob(jobId);
      toast({ title: "Job claimed successfully" });
      
      // Refresh jobs data
      await fetchJobs(true);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to claim job";
      toast({ title: "Failed to claim job", description: message, variant: "destructive" });
    } finally {
      setClaimingJob(null);
    }
  };

  const handleRefresh = () => {
    fetchJobs(true);
  };

  const assignedJobs = jobsData?.assigned || [];
  const availableJobs = jobsData?.available || [];

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Header with Refresh Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            <h1 className="text-3xl font-semibold">Jobs</h1>
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

        {/* Assigned Jobs Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="h-5 w-5" />
            <h2 className="text-2xl font-semibold">My Assigned Jobs</h2>
            <Badge variant="secondary">{assignedJobs.length}</Badge>
          </div>
          <p className="text-muted-foreground">Jobs currently assigned to you for testing</p>
          
          <div className="mt-4">
            <JobsView jobs={assignedJobs} isLoading={isLoading} baseLink="/agency/jobs" />
          </div>
        </div>

        {/* Available Jobs Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Hand className="h-5 w-5" />
            <h2 className="text-2xl font-semibold">Available Jobs</h2>
            <Badge variant="outline">{availableJobs.length}</Badge>
          </div>
          <p className="text-muted-foreground">Unassigned jobs that you can claim for testing</p>
          
          <div className="mt-4">
            {availableJobs.length > 0 ? (
              <div className="grid gap-4">
                {availableJobs.map((job) => {
                  const jobId = (job as any).id || (job as any)._id;
                  return (
                    <Card key={jobId}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{job.title}</h3>
                            <p className="text-muted-foreground mt-1">{job.description}</p>
                            <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                              <span><strong>Product:</strong> {job.product?.name || "-"}</span>
                              <span><strong>MSME:</strong> {job.msme?.name || "-"}</span>
                            </div>
                          </div>
                          <Button 
                            onClick={() => handleClaimJob(jobId)}
                            disabled={claimingJob === jobId}
                            className="ml-4"
                          >
                            {claimingJob === jobId ? "Claiming..." : "Claim Job"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Hand className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium">No available jobs</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Check back later for new testing opportunities
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
