// src/types/dashboard.ts
export interface DiagramSummary {
  id: string;
  title: string;
  stationName: string;
  currentRevisionLabel: string;
  thumbnailUrl: string | null;
  uploadedAt: string;
  uploadedBy: {
    id: string;
    fullName: string;
  };
  viewerRulesCount: number;
  isActive: boolean;
}

export interface ReportSummary {
  uploadsThisMonth: number;
  totalDiagrams: number;
  totalVersions: number;
  downloadsThisMonth: number;
  storageUsedBytes: number;
}

export interface MonthlyUploadStat {
  month: string;
  label: string;
  count: number;
}

export interface DepartmentDownloadStat {
  departmentId: string;
  departmentName: string;
  downloads: number;
}

export interface BackupInfo {
  id: string;
  completedAt: string | null;
  status: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'PENDING';
  sizeBytes: number;
}

export interface ReplicationTarget {
  id: string;
  label: string;
  lastSyncAt: string | null;
  status: 'SYNCED' | 'PENDING' | 'ERROR';
}

export interface SystemHealth {
  storageUsedBytes: number;
  storageTotalBytes: number;
  lastBackup: BackupInfo | null;
  replicationTargets: ReplicationTarget[];
}

export interface AuditLogEntry {
  id: string;
  occurredAt: string;
  user: {
    id: string;
    username: string;
    fullName: string;
  };
  action: string;
  targetType: string;
  targetId: string | null;
  metadata: Record<string, unknown>;
}

export interface DateRange {
  from: Date;
  to: Date;
}