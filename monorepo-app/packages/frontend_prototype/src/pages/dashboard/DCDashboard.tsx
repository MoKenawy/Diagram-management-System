import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Upload, FileStack, Eye } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { fetchReportSummary, fetchDiagrams } from '../../api/client';
import { KPICard } from '../../components/ui/KPICard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { CreateDiagramModal } from '../../components/CreateDiagramModal';
import { CardSkeleton, TableSkeleton } from '../../components/ui/Skeleton';

export function DCDashboard() {
  const { t, lang } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['reports', 'summary', 'dc'],
    queryFn: () => fetchReportSummary(),
  });

  const { data: diagramsData, isLoading: diagramsLoading } = useQuery({
    queryKey: ['diagrams', 'dc-recent'],
    queryFn: () => fetchDiagrams({ limit: 10, page: 1 }),
  });

  const diagrams = diagramsData?.data ?? [];

  return (
    <div className="space-y-8">
      {/* Stat row + Upload button */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          {summaryLoading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            <>
              <KPICard
                title={t('uploadsThisMonth')}
                value={summary?.uploadsThisMonth ?? 0}
                icon={<Upload className="h-5 w-5" />}
              />
              <KPICard
                title={t('totalDiagrams')}
                value={summary?.totalActiveDiagrams ?? 0}
                icon={<FileStack className="h-5 w-5" />}
              />
            </>
          )}
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
        >
          <Upload className="h-4 w-4" />
          {t('uploadNewDiagram')}
        </button>
      </div>

      {/* Recent uploads table */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">{t('recentUploads')}</h2>

        {diagramsLoading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-start font-medium text-slate-600">
                      {t('thumbnail')}
                    </th>
                    <th className="px-4 py-3 text-start font-medium text-slate-600">
                      {t('title')}
                    </th>
                    <th className="px-4 py-3 text-start font-medium text-slate-600">
                      {t('revision')}
                    </th>
                    <th className="px-4 py-3 text-start font-medium text-slate-600">
                      {t('uploadDate')}
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-slate-600">
                      <div className="flex items-center justify-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {t('viewerRules')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-slate-600">
                      {t('status')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {diagrams.map((d) => {
                    const version = d.currentVersion;
                    const thumbUrl = version
                      ? `/api/diagrams/${d.id}/versions/${version.id}/thumbnail`
                      : null;

                    return (
                      <tr
                        key={d.id}
                        className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                      >
                        <td className="px-4 py-3">
                          <div className="flex h-10 w-14 items-center justify-center overflow-hidden rounded bg-slate-100">
                            {thumbUrl ? (
                              <img
                                src={thumbUrl}
                                alt=""
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <FileStack className="h-4 w-4 text-slate-300" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">{d.title}</td>
                        <td className="px-4 py-3">
                          {version ? (
                            <StatusBadge label={version.revisionLabel} variant="info" />
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {version
                            ? new Date(version.uploadedAt).toLocaleDateString(
                                lang === 'ar' ? 'ar-SA' : 'en-US',
                              )
                            : '-'}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-500">
                          {d.versionCount}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge
                            label={d.isActive ? t('active') : t('inactive')}
                            variant={d.isActive ? 'success' : 'danger'}
                          />
                        </td>
                      </tr>
                    );
                  })}

                  {diagrams.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        {t('noData')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <CreateDiagramModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
