import { useState, useEffect } from "react";
import { Link } from "wouter";
import { DashboardShell } from "@/components/DashboardShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Job } from "@shared/schema";
import JobsView from "@/components/JobsView";
import { msmeApi } from "@/lib/services";

interface JobWithRelations extends Job {
  product?: { name: string };
  assignedAgency?: { name: string };
}

export default function MSMEJobs() {
  const [jobs, setJobs] = useState<JobWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        const data = await msmeApi.getMSMEJobs() as JobWithRelations[];
        setJobs(data);
      } catch (error) {
        // Error fetching jobs
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">My Jobs</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">View and manage your testing jobs</p>
          </div>
          <Link href="/msme/jobs/new">
            <Button data-testid="button-create-job" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Job
            </Button>
          </Link>
        </div>

        <JobsView jobs={jobs} isLoading={isLoading} baseLink="/msme/jobs" />
      </div>
    </DashboardShell>
  );
}
