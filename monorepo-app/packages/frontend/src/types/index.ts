// api-types.ts
// Auto-generated types for Diagram Management System API

// ═══════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════

// Define the object for runtime use
export const Role = {
  ENGINEER: 'ENGINEER',
  DC: 'DC',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN',
} as const;

// Define the type for compile-time checking
// This allows you to use 'Role' as a type: (e.g., const userRole: Role = Role.ADMIN)
export type Role = (typeof Role)[keyof typeof Role];

export const FileFormat = {
  PDF: 'PDF',
  JPEG: 'JPEG',
  PNG: 'PNG',
  SVG: 'SVG',
  DWG: 'DWG',
} as const;
export type FileFormat = (typeof FileFormat)[keyof typeof FileFormat];

export const AccessLevel = {
  VIEW: 'VIEW',
  EDIT: 'EDIT',
  ADMIN: 'ADMIN',
} as const;
export type AccessLevel = (typeof AccessLevel)[keyof typeof AccessLevel];

export const AccessPolicy = {
  ALLOW: 'ALLOW',
  DENY: 'DENY',
} as const;
export type AccessPolicy = (typeof AccessPolicy)[keyof typeof AccessPolicy];

export const TargetType = {
  USER: 'USER',
  DEPARTMENT: 'DEPARTMENT',
} as const;
export type TargetType = (typeof TargetType)[keyof typeof TargetType];

export const BackupStatus = {
  RUNNING: 'RUNNING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
} as const;
export type BackupStatus = (typeof BackupStatus)[keyof typeof BackupStatus];

export const SyncStatus = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  NEVER: 'NEVER',
} as const;
export type SyncStatus = (typeof SyncStatus)[keyof typeof SyncStatus];

export const ReportExportFormat = {
  PDF: 'pdf',
  EXCEL: 'excel',
} as const;
export type ReportExportFormat = (typeof ReportExportFormat)[keyof typeof ReportExportFormat];

export const TimeGranularity = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
} as const;
export type TimeGranularity = (typeof TimeGranularity)[keyof typeof TimeGranularity];


// ═══════════════════════════════════════════════════════════════════
// ERROR SCHEMAS
// ═══════════════════════════════════════════════════════════════════

export interface ErrorResponse {
  error: string;
  message: string;
}

export interface ValidationErrorDetail {
  path: string;
  message: string;
}

export interface ValidationErrorResponse {
  error: 'VALIDATION_ERROR';
  message: string;
  details: ValidationErrorDetail[];
}

export interface DeactivationConflictError {
  error: 'DEPARTMENT_HAS_ACTIVE_USERS' | 'DEPARTMENT_HAS_ACTIVE_DIAGRAMS';
  message: string;
  count: number;
}

// ═══════════════════════════════════════════════════════════════════
// PAGINATION
// ═══════════════════════════════════════════════════════════════════

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// ═══════════════════════════════════════════════════════════════════
// HEALTH
// ═══════════════════════════════════════════════════════════════════

export interface HealthResponse {
  status: string;
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  departmentId?: string | null;
}

// ═══════════════════════════════════════════════════════════════════
// DEPARTMENTS
// ═══════════════════════════════════════════════════════════════════

export interface DepartmentBasic {
  id: string;
  nameAr: string;
  nameEn: string;
  code: string;
}

export interface DepartmentFull {
  id: string;
  nameAr: string;
  nameEn: string;
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentStats {
  id: string;
  nameAr: string;
  nameEn: string;
  code: string;
  isActive: boolean;
  activeUserCount: number;
  totalUserCount: number;
  activeDiagramCount: number;
  totalDiagramCount: number;
}

export interface DepartmentCreateRequest {
  nameAr: string;
  nameEn: string;
  code: string;
}

export interface DepartmentUpdateRequest {
  nameAr?: string;
  nameEn?: string;
  code?: string;
}

// ═══════════════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════════════

export interface UserBrief {
  id: string;
  username: string;
  fullName: string;
}

export interface UserResponse {
  id: string;
  username: string;
  fullName: string;
  email: string | null;
  role: Role;
  departmentId: string | null;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  department: DepartmentBasic | null;
}

export interface UserEngineerResponse {
  id: string;
  username: string;
  fullName: string;
  email?: string | null;
  departmentId: string;
  department: DepartmentBasic;
}

export type UserPaginatedResponse = PaginatedResponse<UserResponse>;

export interface UserCreateRequest {
  username: string;
  fullName: string;
  email?: string | null;
  role: Role;
  departmentId?: string | null;
  password: string;
}

export interface UserUpdateRequest {
  fullName?: string;
  email?: string | null;
  role?: Role;
  departmentId?: string | null;
  isActive?: boolean;
}

export interface PasswordResetRequest {
  newPassword: string;
}

export interface DeleteUserRequest {
  confirmUsername: string;
}

export interface DeleteUserResponse {
  message: string;
  deletedUser: {
    id: string;
    username: string;
    fullName: string;
  };
}

export interface UserDeletionImpactResponse {
  user: {
    id: string;
    username: string;
    fullName: string;
    role: Role;
    isActive: boolean;
  };
  impact: {
    uploadedVersionCount: number;
    grantedAccessCount: number;
    auditLogCount: number;
    triggeredBackupCount: number;
    hasReferences: boolean;
    canDelete: boolean;
    recommendation: string;
  };
}

// ═══════════════════════════════════════════════════════════════════
// USER LIST QUERY PARAMS
// ═══════════════════════════════════════════════════════════════════

export interface UserListParams {
  page?: number;
  limit?: number;
  role?: Role;
  departmentId?: string;
  isActive?: boolean;
  search?: string;
}

// ═══════════════════════════════════════════════════════════════════
// DIAGRAMS
// ═══════════════════════════════════════════════════════════════════

export interface DiagramObject {
  id: string;
  title: string;
  description: string | null;
  departmentId: string;
  currentVersionId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiagramSummaryResponse {
  id: string;
  title: string;
  description: string | null;
  departmentId: string;
  department: DepartmentBasic;
  currentVersionId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  versionCount: number;
  currentVersion: DiagramVersionSummary | null;
}

export type DiagramDetailResponse = DiagramSummaryResponse;

export type DiagramPaginatedResponse = PaginatedResponse<DiagramSummaryResponse>;

export interface DiagramCreateFormDataFields {
  title: string;
  description?: string | null;
  departmentId: string;
  tags?: string;
  revisionLabel: string;
  changeSummary: string;
  file: File;
}

export interface DiagramCreateResponse {
  diagram: DiagramObject;
  version: DiagramVersionObject;
}

export interface DiagramUpdateRequest {
  title?: string;
  description?: string | null;
  tags?: string | null;
}

export interface DiagramDeactivateResponse {
  message: string;
  id: string;
}

// ═══════════════════════════════════════════════════════════════════
// DIAGRAM LIST QUERY PARAMS
// ═══════════════════════════════════════════════════════════════════

export interface DiagramListParams {
  page?: number;
  limit?: number;
  search?: string;
  fileFormat?: FileFormat[]; // Changed from single FileFormat
  departmentId?: string[];    // Changed from single string
  uploadedFrom?: string;
  uploadedTo?: string;
}

// ═══════════════════════════════════════════════════════════════════
// DIAGRAM VERSIONS
// ═══════════════════════════════════════════════════════════════════

export interface DiagramVersionSummary {
  id: string;
  versionNumber: number;
  revisionLabel: string;
  changeSummary: string;
  fileFormat: FileFormat;
  fileSizeBytes: string;
  originalFilename: string;
  thumbnailPath: string | null;
  uploadedAt: string;
  uploadedBy: UserBrief;
}

export interface DiagramVersionObject {
  id: string;
  diagramId: string;
  versionNumber: number;
  revisionLabel: string;
  changeSummary: string;
  filePath: string;
  originalFilename: string;
  fileFormat: FileFormat;
  fileSizeBytes: string;
  thumbnailPath: string | null;
  uploadedById: string;
  uploadedAt: string;
}

export interface DiagramVersionResponse {
  id: string;
  diagramId: string;
  versionNumber: number;
  revisionLabel: string;
  changeSummary: string;
  filePath?: string;
  originalFilename: string;
  fileFormat: FileFormat;
  fileSizeBytes: string;
  thumbnailPath: string | null;
  uploadedAt: string;
  uploadedById: string;
  uploadedBy: UserBrief;
}

export interface DiagramVersionCreateFormDataFields {
  revisionLabel: string;
  changeSummary: string;
  file: File;
}

// ═══════════════════════════════════════════════════════════════════
// ACCESS RULES
// ═══════════════════════════════════════════════════════════════════

export interface DiagramAccessRuleResponse {
  id: string;
  diagramId: string;
  targetType: TargetType;
  targetId: string;
  targetName: string | null;
  accessLevel: AccessLevel;
  policy: AccessPolicy;
  grantedAt: string;
  grantedBy: UserBrief;
}

export interface DiagramAccessRuleCreateRequest {
  targetType: TargetType;
  targetId: string;
  accessLevel: AccessLevel;
  policy: AccessPolicy;
}

export interface AccessRuleDeleteResponse {
  message: string;
  ruleId: string;
}

// ═══════════════════════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════════════════════

export interface ReportSummaryResponse {
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

export interface DiagramDownloadCount {
  diagramId: string;
  title: string;
  downloadCount: number;
}

export interface DepartmentAccessStats {
  departmentId: string;
  nameAr: string;
  nameEn: string;
  diagramCount: number;
  downloadCount: number;
}

export interface ReportDateParams {
  from?: string;
  to?: string;
}

export interface UploadsOverTimeParams extends ReportDateParams {
  granularity?: TimeGranularity;
}

export interface ReportExportParams extends ReportDateParams {
  format: ReportExportFormat;
}

// ═══════════════════════════════════════════════════════════════════
// ADMIN: SYSTEM CONFIG
// ═══════════════════════════════════════════════════════════════════

export type ConfigMap = Record<string, string>;

// ═══════════════════════════════════════════════════════════════════
// ADMIN: AUDIT LOGS
// ═══════════════════════════════════════════════════════════════════

export interface AuditLogEntry {
  id: string;
  userId: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  ipAddress: string | null;
  metadata: Record<string, unknown>;
  occurredAt: string;
  user: UserBrief | null;
}

export type AuditLogPaginatedResponse = PaginatedResponse<AuditLogEntry>;

export interface AuditLogListParams {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  from?: string;
  to?: string;
}

// ═══════════════════════════════════════════════════════════════════
// ADMIN: BACKUPS
// ═══════════════════════════════════════════════════════════════════

export interface BackupRecordResponse {
  id: string;
  filePath: string;
  sizeBytes: string;
  status: BackupStatus;
  startedAt: string;
  completedAt: string | null;
  triggeredById: string | null;
  triggeredBy: UserBrief | null;
}

export interface BackupTriggerResponse {
  backupRecordId: string;
}

export interface RestoreRequest {
  confirmToken: 'RESTORE';
}

export interface RestoreResponse {
  message: string;
  backupRecordId: string;
}

// ═══════════════════════════════════════════════════════════════════
// ADMIN: REPLICATION
// ═══════════════════════════════════════════════════════════════════

export interface ReplicationTargetResponse {
  id: string;
  host: string;
  port: number;
  label: string;
  sshUsername: string;
  isActive: boolean;
  lastSyncAt: string | null;
  lastSyncStatus: SyncStatus;
  createdAt: string;
}

export interface ReplicationTargetFullResponse extends ReplicationTargetResponse {
  sshKeyPath: string;
}

export interface ReplicationTargetCreateRequest {
  host: string;
  port?: number;
  label: string;
  sshUsername: string;
  sshKeyPath: string;
}

export interface ReplicationTargetUpdateRequest {
  host?: string;
  port?: number;
  label?: string;
  sshUsername?: string;
  sshKeyPath?: string;
  isActive?: boolean;
}

export interface ReplicationSyncResponse {
  message: string;
  targetId: string;
}

// ═══════════════════════════════════════════════════════════════════
// GENERIC MESSAGE RESPONSE
// ═══════════════════════════════════════════════════════════════════

export interface MessageResponse {
  message: string;
}

// ═══════════════════════════════════════════════════════════════════
// API ENDPOINT PATHS (for typed API client usage)
// ═══════════════════════════════════════════════════════════════════

/**
 * Describes all API endpoints, their methods, request shapes, and response shapes.
 * Useful for building a fully typed API client wrapper.
 */
export interface ApiEndpoints {
  // Health
  'GET /api/health': {
    response: HealthResponse;
  };

  // Auth
  'POST /api/auth/login': {
    body: LoginRequest;
    response: LoginResponse;
  };
  'POST /api/auth/logout': {
    response: MessageResponse;
  };
  'POST /api/auth/refresh': {
    response: RefreshResponse;
  };
  'GET /api/auth/me': {
    response: User;
  };

  // Departments
  'GET /api/departments': {
    response: DepartmentBasic[];
  };
  'POST /api/departments': {
    body: DepartmentCreateRequest;
    response: DepartmentFull;
  };
  'GET /api/departments/all': {
    response: DepartmentFull[];
  };
  'PATCH /api/departments/:id': {
    params: { id: string };
    body: DepartmentUpdateRequest;
    response: DepartmentFull;
  };
  'GET /api/departments/:id/stats': {
    params: { id: string };
    response: DepartmentStats;
  };
  'PATCH /api/departments/:id/deactivate': {
    params: { id: string };
    response: DepartmentFull;
  };
  'PATCH /api/departments/:id/activate': {
    params: { id: string };
    response: DepartmentFull;
  };

  // Users
  'GET /api/users': {
    query: UserListParams;
    response: UserPaginatedResponse;
  };
  'POST /api/users': {
    body: UserCreateRequest;
    response: UserResponse;
  };
  'GET /api/users/engineers': {
    response: UserEngineerResponse[];
  };
  'PATCH /api/users/:id': {
    params: { id: string };
    body: UserUpdateRequest;
    response: UserResponse;
  };
  'PATCH /api/users/:id/password': {
    params: { id: string };
    body: PasswordResetRequest;
    response: MessageResponse;
  };
  'PATCH /api/users/:id/deactivate': {
    params: { id: string };
    response: UserResponse;
  };
  'PATCH /api/users/:id/activate': {
    params: { id: string };
    response: UserResponse;
  };
  'GET /api/users/:id/deletion-impact': {
    params: { id: string };
    response: UserDeletionImpactResponse;
  };
  'DELETE /api/users/:id': {
    params: { id: string };
    body: DeleteUserRequest;
    response: DeleteUserResponse;
  };

  // Diagrams
  'GET /api/diagrams': {
    query: DiagramListParams;
    response: DiagramPaginatedResponse;
  };
  'POST /api/diagrams': {
    body: FormData; // multipart/form-data with DiagramCreateFormDataFields
    response: DiagramCreateResponse;
  };
  'GET /api/diagrams/:id': {
    params: { id: string };
    response: DiagramDetailResponse;
  };
  'PATCH /api/diagrams/:id': {
    params: { id: string };
    body: DiagramUpdateRequest;
    response: DiagramDetailResponse;
  };
  'DELETE /api/diagrams/:id': {
    params: { id: string };
    response: DiagramDeactivateResponse;
  };

  // Versions
  'GET /api/diagrams/:id/versions': {
    params: { id: string };
    response: DiagramVersionResponse[];
  };
  'POST /api/diagrams/:id/versions': {
    params: { id: string };
    body: FormData; // multipart/form-data with DiagramVersionCreateFormDataFields
    response: DiagramVersionResponse;
  };
  'GET /api/diagrams/:id/versions/:versionId/file': {
    params: { id: string; versionId: string };
    response: Blob;
  };
  'GET /api/diagrams/:id/versions/:versionId/thumbnail': {
    params: { id: string; versionId: string };
    response: Blob;
  };

  // Access Rules
  'GET /api/diagrams/:id/access': {
    params: { id: string };
    response: DiagramAccessRuleResponse[];
  };
  'POST /api/diagrams/:id/access': {
    params: { id: string };
    body: DiagramAccessRuleCreateRequest;
    response: DiagramAccessRuleResponse;
  };
  'DELETE /api/diagrams/:id/access/:ruleId': {
    params: { id: string; ruleId: string };
    response: AccessRuleDeleteResponse;
  };

  // Reports
  'GET /api/reports/summary': {
    query: ReportDateParams;
    response: ReportSummaryResponse;
  };
  'GET /api/reports/uploads-over-time': {
    query: UploadsOverTimeParams;
    response: TimeSeriesPoint[];
  };
  'GET /api/reports/downloads-by-diagram': {
    query: ReportDateParams;
    response: DiagramDownloadCount[];
  };
  'GET /api/reports/access-by-department': {
    query: ReportDateParams;
    response: DepartmentAccessStats[];
  };
  'GET /api/reports/export': {
    query: ReportExportParams;
    response: Blob;
  };

  // Admin: Config
  'GET /api/admin/config': {
    response: ConfigMap;
  };
  'PATCH /api/admin/config': {
    body: ConfigMap;
    response: ConfigMap;
  };

  // Admin: Audit Logs
  'GET /api/admin/audit-logs': {
    query: AuditLogListParams;
    response: AuditLogPaginatedResponse;
  };

  // Admin: Backups
  'GET /api/admin/backups': {
    response: BackupRecordResponse[];
  };
  'POST /api/admin/backups': {
    response: BackupTriggerResponse;
  };
  'POST /api/admin/backups/:id/restore': {
    params: { id: string };
    body: RestoreRequest;
    response: RestoreResponse;
  };

  // Admin: Replication
  'GET /api/admin/replication': {
    response: ReplicationTargetResponse[];
  };
  'POST /api/admin/replication': {
    body: ReplicationTargetCreateRequest;
    response: ReplicationTargetFullResponse;
  };
  'PATCH /api/admin/replication/:id': {
    params: { id: string };
    body: ReplicationTargetUpdateRequest;
    response: ReplicationTargetResponse;
  };
  'DELETE /api/admin/replication/:id': {
    params: { id: string };
    response: void;
  };
  'POST /api/admin/replication/:id/sync': {
    params: { id: string };
    response: ReplicationSyncResponse;
  };
}