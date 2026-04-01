import { BarChart3, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../utils/cn';

const metrics = [
  { label: 'Total Requests', value: '1.2M', change: '+14.2%', up: true },
  { label: 'Avg Latency', value: '42ms', change: '-8.5%', up: false },
  { label: 'Error Rate', value: '0.12%', change: '-23.1%', up: false },
  { label: 'Throughput', value: '8.4K/s', change: '+5.7%', up: true },
];

const chartBars = [
  { label: 'Mon', value: 65 },
  { label: 'Tue', value: 80 },
  { label: 'Wed', value: 45 },
  { label: 'Thu', value: 90 },
  { label: 'Fri', value: 72 },
  { label: 'Sat', value: 35 },
  { label: 'Sun', value: 50 },
];

const topEndpoints = [
  { path: '/api/auth/login', calls: '245K', latency: '38ms', pct: 85 },
  { path: '/api/reports', calls: '189K', latency: '52ms', pct: 72 },
  { path: '/api/users', calls: '156K', latency: '41ms', pct: 65 },
  { path: '/api/departments', calls: '98K', latency: '35ms', pct: 48 },
  { path: '/api/analytics', calls: '67K', latency: '67ms', pct: 35 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500">System performance and usage metrics</p>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{m.label}</p>
            <div className="mt-2 flex items-end justify-between">
              <p className="text-2xl font-bold text-slate-900">{m.value}</p>
              <span
                className={cn(
                  'flex items-center gap-0.5 text-xs font-medium',
                  m.up ? 'text-emerald-600' : 'text-rose-600'
                )}
              >
                {m.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {m.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bar chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Weekly Traffic</h2>
            <BarChart3 className="h-5 w-5 text-slate-400" />
          </div>
          <div className="mt-6 flex items-end justify-between gap-3" style={{ height: 200 }}>
            {chartBars.map((bar) => (
              <div key={bar.label} className="flex flex-1 flex-col items-center gap-2">
                <div className="relative w-full rounded-t-lg bg-slate-100" style={{ height: 180 }}>
                  <div
                    className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-violet-500 transition-all duration-500"
                    style={{ height: `${bar.value}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top endpoints */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Top Endpoints</h2>
            <TrendingUp className="h-5 w-5 text-slate-400" />
          </div>
          <div className="mt-4 space-y-4">
            {topEndpoints.map((ep) => (
              <div key={ep.path} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-mono text-slate-700">{ep.path}</span>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{ep.calls} calls</span>
                    <span>{ep.latency}</span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
                    style={{ width: `${ep.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
