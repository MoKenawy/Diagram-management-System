

// ── Enums ──────────────────────────────────────────────────
export type Role = 'ENGINEER' | 'DC' | 'MANAGER' | 'ADMIN';
export type FileFormat = 'PDF' | 'JPEG' | 'PNG' | 'SVG' | 'DWG';
export type AccessLevel = 'VIEW' | 'EDIT' | 'ADMIN';
export type AccessPolicy = 'ALLOW' | 'DENY';
export type TargetType = 'USER' | 'DEPARTMENT';
export type BackupStatus = 'RUNNING' | 'SUCCESS' | 'FAILED';
export type SyncStatus = 'SUCCESS' | 'FAILED' | 'NEVER';

// ── User ──────────────────────────────────────────────────
export interface User {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  departmentId?: string | null;
  email?: string | null;
  isActive?: boolean;
  lastLogin?: string | null;
  createdAt?: string;
  updatedAt?: string;
  department?: DepartmentBasic | null;
}

export interface UserBrief {
  id: string;
  username: string;
  fullName: string;
}

// ── Department ────────────────────────────────────────────
export interface DepartmentBasic {
  id: string;
  nameAr: string;
  nameEn: string;
  code: string;
}

// ── Reports ───────────────────────────────────────────────
export interface ReportSummary {
  totalActiveDiagrams: number;
  totalVersions: number;
  uploadsThisMonth: number;
  downloadsThisMonth: number;
  activeUsersThisMonth: number;
  storageUsedBytes: string;
}

export interface TimeSeriesPoint {
  period: string;
  count: number;
}





export interface DepartmentAccessStats {
  departmentId: string;
  nameAr: string;
  nameEn: string;
  diagramCount: number;
  downloadCount: number;
}

// ── Audit Logs ────────────────────────────────────────────
export interface AuditLogEntry {
  id: string;
  userId?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  ipAddress?: string | null;
  metadata: Record<string, unknown>;
  occurredAt: string;
  user?: UserBrief | null;
}


// ── Pagination ────────────────────────────────────────────
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}


export interface AuditLogPaginatedResponse {
  data: AuditLogEntry[];
  pagination: PaginationMeta;
}



// ── Backups ───────────────────────────────────────────────
export interface BackupRecord {
  id: string;
  filePath: string;
  sizeBytes: string;
  status: BackupStatus;
  startedAt: string;
  completedAt?: string | null;
  triggeredById?: string | null;
  triggeredBy?: UserBrief | null;
}

// ── Replication ───────────────────────────────────────────
export interface ReplicationTarget {
  id: string;
  host: string;
  port: number;
  label: string;
  sshUsername: string;
  isActive: boolean;
  lastSyncAt?: string | null;
  lastSyncStatus: SyncStatus;
  createdAt: string;
}

// ── Config ────────────────────────────────────────────────
export type ConfigMap = Record<string, string>;






// ── Diagram ───────────────────────────────────────────────
export interface DiagramVersionSummary {
  id: string;
  versionNumber: number;
  revisionLabel: string;
  changeSummary: string;
  fileFormat: FileFormat;
  fileSizeBytes: string;
  originalFilename: string;
  thumbnailPath?: string | null;
  uploadedAt: string;
  uploadedBy: UserBrief;
}
export interface DiagramSummary {
  id: string;
  title: string;
  description?: string | null;
  format: FileFormat;
  departmentId: string;
  department: DepartmentBasic;
  currentVersionId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  versionCount: number;
  currentVersion?: DiagramVersionSummary | null;
}

export interface DiagramPaginatedResponse {
  data: DiagramSummary[];
  pagination: PaginationMeta;
}

// ── Access Rules ──────────────────────────────────────────
export interface DiagramAccessRule {
  id: string;
  diagramId: string;
  targetType: TargetType;
  targetId: string;
  targetName?: string | null;
  accessLevel: AccessLevel;
  policy: AccessPolicy;
  grantedAt: string;
  grantedBy: UserBrief;
}


export interface DiagramDownloadCount {
  diagramId: string;
  title: string;
  downloadCount: number;
}




export interface DiagramVersion {
  id: string;
  versionNumber: number;
  revisionLabel: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: {
    id: string;
    name: string;
  };
  thumbnailUrl?: string;
}

// export interface DiagramSummary {
//   id: string;
//   title: string;
//   format: DiagramFormat;
//   department: {
//     id: string;
//     name: string;
//   };
//   currentVersion: DiagramVersion;
//   currentVersionId: string;
//   createdAt: string;
//   updatedAt: string;
//   isActive: boolean;
// }

export interface DiagramsResponse {
  data: DiagramSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}


export interface DiagramFiltersParams {
  search?: string;
  formats?: FileFormat[];
  dateFrom?: string;
  dateTo?: string;
  departmentIds?: string[];
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Department {
  id: string;
  name: string;
  nameAr?: string;
}
