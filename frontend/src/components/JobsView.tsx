import React, { useMemo, useState } from "react";
import { Job } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Link } from "wouter";
import { StatusBadge } from "@/components/StatusBadge";
import { FileText, Grid, List } from "lucide-react";
import { format } from "date-fns";

interface JobsViewProps {
  jobs?: (Job & any)[];
  isLoading?: boolean;
  baseLink?: string; // e.g. "/admin/jobs"
}

export default function JobsView({ jobs = [], isLoading, baseLink = "/" }: JobsViewProps) {
  const [layout, setLayout] = useState<"list" | "grid">("list");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");

  const statuses = useMemo(() => {
    const s = new Set<string>();
    jobs.forEach((j) => s.add(j.currentStatus));
    return Array.from(s);
  }, [jobs]);

  const filtered = useMemo(() => {
    return (jobs || []).filter((job) => {
      if (statusFilter && job.currentStatus !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !(job.title?.toLowerCase().includes(q) || job.product?.name?.toLowerCase()?.includes(q) || job.msme?.name?.toLowerCase()?.includes(q))
        ) {
          return false;
        }
      }
      return true;
    });
  }, [jobs, statusFilter, search]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 w-full bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search jobs, product, msme..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />

          <Select value={statusFilter ?? undefined} onValueChange={(v) => setStatusFilter(v === "all" ? null : v ?? null)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant={layout === "list" ? "secondary" : "ghost"} onClick={() => setLayout("list")}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant={layout === "grid" ? "secondary" : "ghost"} onClick={() => setLayout("grid")}>
            <Grid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {layout === "list" ? (
        <Card>
          <CardContent className="p-0">
            {filtered.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>MSME</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((job) => {
                    const jobId = job.id || job._id || "";
                    return (
                      <TableRow key={jobId || Math.random().toString(36).slice(2)}>
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell>{job.product?.name || "-"}</TableCell>
                        <TableCell>{job.msme?.name || "-"}</TableCell>
                        <TableCell>
                          <StatusBadge status={job.currentStatus} />
                        </TableCell>
                        <TableCell>{format(new Date(job.createdAt), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          {jobId ? (
                            <Link href={`${baseLink}/${jobId}`}>
                              <Button variant="ghost" size="icon">
                                <FileText className="h-4 w-4" />
                              </Button>
                            </Link>
                          ) : (
                            <Button variant="ghost" size="icon" disabled>
                              <FileText className="h-4 w-4 opacity-30" />
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
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium">No jobs</h3>
                <p className="text-sm text-muted-foreground mt-1">No jobs match your filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="font-medium">{job.title}</span>
                  <Link href={`${baseLink}/${job.id}`}>
                    <Button variant="ghost" size="icon">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <div>Product: {job.product?.name || "-"}</div>
                  <div>MSME: {job.msme?.name || "-"}</div>
                  <div className="mt-2">
                    <StatusBadge status={job.currentStatus} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
