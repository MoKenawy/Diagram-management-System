import { AccessLevel, AccessPolicy, DepartmentBasic, FileFormat, PaginationMeta, TargetType, UserBrief } from "./index";

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
  format: any;
  id: string;
  title: string;
  description?: string | null;
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
