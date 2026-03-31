// src/pages/dashboard/ManagerDashboard.tsx
import React, { useState, useMemo, useCallback } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useLanguage } from '../../hooks/useLanguage';
import { formatNumber, formatFileSize } from '../../utils/format';
import {
  useReportSummary,
  useMonthlyUploads,
  useDownloadsByDepartment,
} from './hooks/useDashboardQueries';
import { useExportReport } from './hooks/useExportReport';
import { KPICard } from './components/KPICard';
import { DateRangePicker } from './components/DateRangePicker';
import { SkeletonKPIRow } from './components/SkeletonCard';
import { SkeletonChart } from './components/SkeletonChart';
import type { DateRange } from '../../types/dashboard';

function getDefaultDateRange(): DateRange {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - 6);
  return { from, to };
}

export function ManagerDashboard() {
  const { t, lang, isRTL } = useLanguage();
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange);

  const { data: summary, isLoading: summaryLoading } = useReportSummary(dateRange);
  const { data: monthlyUploads, isLoading: uploadsChartLoading } = useMonthlyUploads(dateRange);
  const { data: deptDownloads, isLoading: deptChartLoading } = useDownloadsByDepartment(dateRange);
  const { exportReport, isExporting } = useExportReport(dateRange);

  const handleDateChange = useCallback((range: DateRange) => {
    setDateRange(range);
  }, []);

  const chartDirection = isRTL ? 'rtl' : 'ltr';

  // Memoize chart data transforms to avoid unnecessary re-renders
  const uploadChartData = useMemo(
    () =>
      monthlyUploads?.map((item) => ({
        ...item,
        name: item.label,
      })) ?? [],
    [monthlyUploads]
  );

  const downloadChartData = useMemo(
    () =>
      deptDownloads?.map((item) => ({
        ...item,
        name: item.departmentName,
      })) ?? [],
    [deptDownloads]
  );

  return (
    <div className="space-y-8">
      {/* Header with controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('reports.title')}</h1>

        <div className="flex flex-wrap items-center gap-3">
          <DateRangePicker value={dateRange} onChange={handleDateChange} />

          {/* Export dropdown */}
          <div className="relative">
            <div className="flex items-center gap-1">
              <button
                onClick={() => exportReport('excel')}
                disabled={isExporting}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Excel
              </button>
              <button
                onClick={() => exportReport('pdf')}
                disabled={isExporting}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {summaryLoading ? (
        <SkeletonKPIRow count={4} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            label={t('dashboard.totalDiagrams')}
            value={formatNumber(summary?.totalDiagrams ?? 0, lang)}
            color="blue"
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
              </svg>
            }
          />
          <KPICard
            label={lang === 'ar' ? 'إجمالي النسخ' : 'Total Versions'}
            value={formatNumber(summary?.totalVersions ?? 0, lang)}
            color="purple"
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
          />
          <KPICard
            label={lang === 'ar' ? 'التحميلات هذا الشهر' : 'Downloads This Month'}
            value={formatNumber(summary?.downloadsThisMonth ?? 0, lang)}
            color="green"
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            }
          />
          <KPICard
            label={t('dashboard.storageUsed')}
            value={formatFileSize(summary?.storageUsedBytes ?? 0, lang)}
            color="amber"
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            }
          />
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Line Chart: Uploads per Month */}
        {uploadsChartLoading ? (
          <SkeletonChart />
        ) : (
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-gray-900">
              {lang === 'ar' ? 'الرفعات الشهرية' : 'Monthly Uploads'}
            </h3>
            <div style={{ direction: 'ltr' }}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={uploadChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    reversed={isRTL}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    orientation={isRTL ? 'right' : 'left'}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '0.5rem',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      direction: chartDirection,
                    }}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name={lang === 'ar' ? 'عدد الرفعات' : 'Uploads'}
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#2563eb' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Bar Chart: Downloads per Department */}
        {deptChartLoading ? (
          <SkeletonChart />
        ) : (
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-gray-900">
              {lang === 'ar' ? 'التحميلات حسب القسم' : 'Downloads by Department'}
            </h3>
            <div style={{ direction: 'ltr' }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={downloadChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    reversed={isRTL}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    orientation={isRTL ? 'right' : 'left'}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '0.5rem',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      direction: chartDirection,
                    }}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Legend />
                  <Bar
                    dataKey="downloads"
                    name={lang === 'ar' ? 'التحميلات' : 'Downloads'}
                    fill="#7c3aed"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}