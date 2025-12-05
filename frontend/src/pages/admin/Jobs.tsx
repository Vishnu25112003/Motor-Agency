import { useState, useEffect } from "react";
import { Link } from "wouter";
import { DashboardShell } from "@/components/DashboardShell";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Job } from "@shared/schema";
import JobsView from "@/components/JobsView";
import { jobsApi } from "@/lib/services";

interface JobWithRelations extends Job {
  product?: { name: string };
  msme?: { name: string };
  assignedAgency?: { name: string };
}

export default function AdminJobs() {
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

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">All Jobs</h1>
          <p className="text-muted-foreground mt-1">View and manage all testing jobs</p>
        </div>

        <JobsView jobs={jobs} isLoading={isLoading} baseLink="/admin/jobs" />
      </div>
    </DashboardShell>
  );
}
