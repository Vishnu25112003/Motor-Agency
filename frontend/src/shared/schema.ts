export type JobStatus =
  | "DRAFT"
  | "UNDER_TESTING"
  | "ASSIGNED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED";

export type UserType = "ADMIN" | "MSME" | "AGENCY";

export type ChangerType = "MSME" | "AGENCY" | "ADMIN";

export interface User {
  id: string;
  email: string;
  type: UserType;
}

export interface MSME {
  id: string;
  associationId?: string | null;
  name: string;
  governmentApprovalId?: string | null;
  productCategory?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  addedById?: string | null;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestingAgency {
  id: string;
  name: string;
  approvalId: string;
  approvalCertificateFileId?: string | null;
  location?: string | null;
  agencyType?: string | null;
  addedById?: string | null;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  category?: string | null;
  description?: string | null;
  addedById?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  productId: string;
  msmeId: string;
  title: string;
  description?: string | null;
  detailsFileId?: string | null;
  currentStatus: JobStatus;
  statusUpdatedAt: string;
  assignedAgencyId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobAudit {
  id: string;
  jobId: string;
  previousStatus?: string | null;
  newStatus: string;
  changedByType: ChangerType;
  changedById?: string | null;
  notes?: string | null;
  changedAt: string;
  createdAt: string;
}

export interface TestResult {
  id: string;
  jobId: string;
  agencyId: string;
  score?: number | null;
  resultFileId?: string | null;
  comments?: string | null;
  verified: boolean;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface File {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedById?: string | null;
  createdAt: string;
  updatedAt: string;
}