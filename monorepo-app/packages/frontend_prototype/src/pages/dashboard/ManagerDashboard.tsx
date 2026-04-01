import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  FileStack,
  Layers,
  Download,
  HardDrive,
  FileDown,
} from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import {
  fetchReportSummary,
  fetchUploadsOverTime,
  fetchAccessByDepartment,
  getExportUrl,
} from '../../api/client';
import { KPICard } from '../../components/ui/KPICard';
import { DateRangePicker } from '../../components/DateRangePicker';
import { CardSkeleton, ChartSkeleton } from '../../components/ui/Skeleton';
import { formatFileSize, monthsAgo, toDateInputValue } from '../../utils/format';

export function ManagerDashboard() {
  const { t, lang } = useLanguage();

  const [dateRange, setDateRange] = useState({
    from: toDateInputValue(new Date(monthsAgo(6))),
    to: toDateInputValue(new Date()),
  });

  const fromISO = new Date(dateRange.from).toISOString();
  const toISO = new Date(dateRange.to + 'T23:59:59.999Z').toISOString();

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['reports', 'summary', dateRange],
    queryFn: () => fetchReportSummary({ from: fromISO, to: toISO }),
  });

  const { data: uploadsData, isLoading: uploadsLoading } = useQuery({
    queryKey: ['reports', 'uploads-over-time', dateRange],
    queryFn: () =>
      fetchUploadsOverTime({
        from: fromISO,
        to: toISO,
        granularity: 'month',
      }),
  });

  const { data: deptData, isLoading: deptLoading } = useQuery({
    queryKey: ['reports', 'access-by-department', dateRange],
    queryFn: () => fetchAccessByDepartment({ from: fromISO, to: toISO }),
  });

  const uploadsChartData = (uploadsData ?? []).map((p) => ({
    name: new Date(p.period).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'short',
      year: '2-digit',
    }),
    uploads: p.count,
  }));

  const deptChartData = (deptData ?? []).map((d) => ({
    name: lang === 'ar' ? d.nameAr : d.nameEn,
    downloads: d.downloadCount,
  }));

  const handleExport = (format: 'excel' | 'pdf') => {
    const url = getExportUrl(format, fromISO, toISO);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Header with date range and export */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">{t('dashboard')}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <DateRangePicker from={dateRange.from} to={dateRange.to} onChange={setDateRange} />
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('excel')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
            >
              <FileDown className="h-3.5 w-3.5" />
              {t('exportExcel')}
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100"
            >
              <FileDown className="h-3.5 w-3.5" />
              {t('exportPdf')}
            </button>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      {summaryLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title={t('totalDiagrams')}
            value={summary?.totalActiveDiagrams ?? 0}
            icon={<FileStack className="h-5 w-5" />}
          />
          <KPICard
            title={t('totalVersions')}
            value={summary?.totalVersions ?? 0}
            icon={<Layers className="h-5 w-5" />}
          />
          <KPICard
            title={t('downloadsThisMonth')}
            value={summary?.downloadsThisMonth ?? 0}
            icon={<Download className="h-5 w-5" />}
          />
          <KPICard
            title={t('storageUsed')}
            value={formatFileSize(summary?.storageUsedBytes ?? '0')}
            icon={<HardDrive className="h-5 w-5" />}
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Line chart: Uploads over time */}
        {uploadsLoading ? (
          <ChartSkeleton />
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">{t('uploadsOverTime')}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={uploadsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="uploads"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#6366f1' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Bar chart: Downloads by department */}
        {deptLoading ? (
          <ChartSkeleton />
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">{t('downloadsByDept')}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={deptChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="downloads" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
