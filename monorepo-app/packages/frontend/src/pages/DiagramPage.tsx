// src/pages/DiagramPage.tsx
import { useState, useCallback } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import {
    Box,
    Tab,
    Tabs,
    Paper,
    Skeleton,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { AppShell } from '@/components/layout/AppShell';
import { useAuthStore } from '@/stores/authStore';
import { useDiagramDetail } from '@/hooks/queries/useDiagramDetailQueries';
import { FileViewer } from '@/components/diagrams/FileViewer';
import { VersionHistoryPanel } from '@/components/diagrams/VersionHistoryPanel';
import { AccessManager } from '@/components/diagrams/AccessManager';
import { EditMetadataForm } from '@/components/diagrams/EditMetadataForm';
import { DeactivateSection } from '@/components/diagrams/DeactivateSection';
import { DiagramPageHeader } from '@/components/diagrams/DiagramPageHeader';
import { Role, type DiagramVersionResponse, type FileFormat } from '@/types/index';
import '@/styles/print.css';
import { Route as ArchiveRoute } from '@/routes/_authenticated/archive';

// ─── Types ───────────────────────────────────────────────────────

interface SelectedVersion {
    id: string;
    fileFormat: FileFormat;
}

type SidebarTab = 'history' | 'access' | 'edit' | 'deactivate';

const PRIVILEGED_ROLES: Role[] = [Role.DC, Role.ADMIN];

// ─── Component ───────────────────────────────────────────────────

const DiagramPage = () => {
    const navigate = useNavigate();
    const { id: diagramId } = useParams({ from: '/_authenticated/diagrams/$id' });
    const userRole: Role = useAuthStore((state) => state.user?.role ?? Role.ENGINEER);
    const theme = useTheme();
    const isMobile: boolean = useMediaQuery(theme.breakpoints.down('md'));

    const { data: diagram, isLoading, isError } = useDiagramDetail(diagramId);

    const [selectedVersion, setSelectedVersion] = useState<SelectedVersion | null>(null);
    const [activeTab, setActiveTab] = useState<SidebarTab>('history');

    const canManage: boolean = PRIVILEGED_ROLES.includes(userRole);

    // Derive active version for viewer
    const viewerVersion: SelectedVersion | null = selectedVersion
        ?? (diagram?.currentVersion
            ? { id: diagram.currentVersion.id, fileFormat: diagram.currentVersion.fileFormat }
            : null);

    const handleVersionSelect = useCallback((version: DiagramVersionResponse): void => {
        setSelectedVersion({
            id: version.id,
            fileFormat: version.fileFormat,
        });
    }, []);

    const handleBack = useCallback((): void => {
        navigate({ to: ArchiveRoute.to });
    }, [navigate]);

    const handleDeactivated = useCallback((): void => {
        navigate({ to: ArchiveRoute.to });
    }, [navigate]);

    // ─── Loading / Error States ────────────────────────────────

    if (isLoading) {
        return (
            <AppShell>
                <Box>
                    <Skeleton width={100} height={36} sx={{ mb: 2 }} />
                    <Skeleton width="60%" height={48} />
                    <Skeleton width="40%" height={24} sx={{ mt: 1, mb: 3 }} />
                    <Box display="flex" gap={3}>
                        <Skeleton variant="rounded" sx={{ flex: 7, height: 500, borderRadius: 3 }} />
                        <Skeleton
                            variant="rounded"
                            sx={{ flex: 3, height: 500, borderRadius: 3, display: { xs: 'none', md: 'block' } }}
                        />
                    </Box>
                </Box>
            </AppShell>
        );
    }

    if (isError || !diagram) {
        return (
            <AppShell>
                <Box display="flex" flexDirection="column" alignItems="center" py={10}>
                    <Typography variant="h6" color="text.secondary">
                        لم يتم العثور على اللوحة
                    </Typography>
                </Box>
            </AppShell>
        );
    }

    // ─── Sidebar Content ──────────────────────────────────────

    const sidebarContent = (
        <Box>
            <Tabs
                value={activeTab}
                onChange={(_, tab: SidebarTab) => setActiveTab(tab)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                    borderBottom: '1px solid #e0e0e0',
                    '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 48 },
                }}
            >
                <Tab label="سجل الإصدارات" value="history" />
                {canManage && <Tab label="إدارة الوصول" value="access" />}
                {canManage && <Tab label="تعديل البيانات" value="edit" />}
                {canManage && <Tab label="إلغاء التفعيل" value="deactivate" />}
            </Tabs>

            <Box sx={{ p: 2, maxHeight: isMobile ? 'auto' : 'calc(100vh - 320px)', overflow: 'auto' }}>
                {activeTab === 'history' && (
                    <VersionHistoryPanel
                        diagramId={diagramId}
                        currentVersionId={diagram.currentVersionId}
                        selectedVersionId={viewerVersion?.id ?? ''}
                        onVersionSelect={handleVersionSelect}
                    />
                )}
                {activeTab === 'access' && canManage && (
                    <AccessManager diagramId={diagramId} />
                )}
                {activeTab === 'edit' && canManage && (
                    <EditMetadataForm diagram={diagram} />
                )}
                {activeTab === 'deactivate' && canManage && (
                    <DeactivateSection
                        diagramId={diagramId}
                        diagramTitle={diagram.title}
                        onDeactivated={handleDeactivated}
                    />
                )}
            </Box>
        </Box>
    );

    // ─── Layout ────────────────────────────────────────────────

    if (isMobile) {
        return (
            <AppShell>
                <DiagramPageHeader diagram={diagram} onBack={handleBack} />

                {/* Viewer */}
                <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 2, p: 2 }}>
                    {viewerVersion ? (
                        <FileViewer
                            diagramId={diagramId}
                            versionId={viewerVersion.id}
                            fileFormat={viewerVersion.fileFormat}
                        />
                    ) : (
                        <Typography color="text.disabled" textAlign="center" py={4}>
                            لا توجد نسخة متاحة
                        </Typography>
                    )}
                </Paper>

                {/* Sidebar as stacked section */}
                <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                    {sidebarContent}
                </Paper>
            </AppShell>
        );
    }

    // Desktop: 2-column
    return (
        <AppShell>
            <DiagramPageHeader diagram={diagram} onBack={handleBack} />

            <Box display="flex" gap={3}>
                {/* File Viewer — 70% */}
                <Paper
                    className="print-only"
                    sx={{ flex: 7, borderRadius: 3, overflow: 'hidden', p: 2 }}
                >
                    {viewerVersion ? (
                        <FileViewer
                            diagramId={diagramId}
                            versionId={viewerVersion.id}
                            fileFormat={viewerVersion.fileFormat}
                        />
                    ) : (
                        <Typography color="text.disabled" textAlign="center" py={4}>
                            لا توجد نسخة متاحة
                        </Typography>
                    )}
                </Paper>

                {/* Sidebar — 30% */}
                <Paper
                    className="no-print"
                    sx={{
                        flex: 3,
                        borderRadius: 3,
                        overflow: 'hidden',
                        position: 'sticky',
                        top: 80,
                        alignSelf: 'flex-start',
                        maxHeight: 'calc(100vh - 100px)',
                    }}
                >
                    {sidebarContent}
                </Paper>
            </Box>
        </AppShell>
    );
};

export default DiagramPage;