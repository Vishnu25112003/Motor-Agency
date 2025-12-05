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
      {/* Mobile-friendly filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
          <Input
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64"
          />

          <Select value={statusFilter ?? undefined} onValueChange={(v) => setStatusFilter(v === "all" ? null : v ?? null)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 justify-end">
          <Button 
            variant={layout === "list" ? "secondary" : "ghost"} 
            size="icon"
            onClick={() => setLayout("list")}
            title="List view"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button 
            variant={layout === "grid" ? "secondary" : "ghost"} 
            size="icon"
            onClick={() => setLayout("grid")}
            title="Grid view"
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {layout === "list" ? (
        <Card>
          <CardContent className="p-0">
            {filtered.length ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead className="hidden md:table-cell">Product</TableHead>
                      <TableHead className="hidden lg:table-cell">MSME</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((job) => {
                      const jobId = job.id || job._id || "";
                      return (
                        <TableRow key={jobId || Math.random().toString(36).slice(2)}>
                          <TableCell className="font-medium">
                            <div>
                              <div className="truncate max-w-[200px]">{job.title}</div>
                              <div className="text-sm text-muted-foreground md:hidden">
                                {job.product?.name && <div className="truncate">{job.product.name}</div>}
                                {job.msme?.name && <div className="truncate lg:hidden">{job.msme.name}</div>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{job.product?.name || "-"}</TableCell>
                          <TableCell className="hidden lg:table-cell">{job.msme?.name || "-"}</TableCell>
                          <TableCell>
                            <StatusBadge status={job.currentStatus} />
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">{format(new Date(job.createdAt), "MMM d, yyyy")}</TableCell>
                          <TableCell className="text-right">
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
              </div>
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
          {filtered.length ? (
            filtered.map((job) => {
              const jobId = job.id || job._id || "";
              return (
                <Card key={jobId || Math.random().toString(36).slice(2)}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-2">
                      <span className="font-medium text-base truncate">{job.title}</span>
                      {jobId && (
                        <Link href={`${baseLink}/${jobId}`}>
                          <Button variant="ghost" size="icon" className="flex-shrink-0">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1">
                      <div className="text-muted-foreground">
                        <span className="font-medium">Product:</span> {job.product?.name || "-"}
                      </div>
                      {job.msme?.name && (
                        <div className="text-muted-foreground">
                          <span className="font-medium">MSME:</span> {job.msme.name}
                        </div>
                      )}
                      <div className="pt-2">
                        <StatusBadge status={job.currentStatus} />
                      </div>
                      <div className="text-xs text-muted-foreground pt-1">
                        {format(new Date(job.createdAt), "MMM d, yyyy")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted mb-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium">No jobs</h3>
              <p className="text-sm text-muted-foreground mt-1">No jobs match your filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
