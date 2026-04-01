import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, FileX } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useLanguage } from '../../hooks/useLanguage';
import { fetchDiagrams } from '../../api/client';
import { DiagramCard } from '../../components/DiagramCard';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { formatDate, daysAgo } from '../../utils/format';

export function EngineerDashboard() {
  const { t, lang } = useLanguage();
  const user = useAuthStore((s) => s.user);
  const [searchValue, setSearchValue] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['diagrams', 'recent-7d'],
    queryFn: () =>
      fetchDiagrams({
        uploadedFrom: daysAgo(7),
        limit: 20,
        page: 1,
      }),
  });

  const diagrams = data?.data ?? [];
  const todayFormatted =
    lang === 'ar' ? formatDate(new Date(), 'ar') : formatDate(new Date(), 'en');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      // Navigate to archive with search param
      window.location.href = `/archive?search=${encodeURIComponent(searchValue.trim())}`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {t('greeting')} {user?.fullName}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{todayFormatted}</p>
      </div>

      {/* Quick search */}
      <form onSubmit={handleSearchSubmit} className="relative max-w-xl">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full rounded-xl border border-slate-300 bg-white py-3 pe-4 ps-11 text-sm shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </form>

      {/* New diagrams section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{t('newDiagrams')}</h2>
          <span className="text-xs text-slate-400">
            {lang === 'ar' ? 'آخر 7 أيام' : 'Last 7 days'}
          </span>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : diagrams.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <FileX className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">{t('noNewDiagrams')}</h3>
            <p className="mt-1 max-w-xs text-center text-sm text-slate-400">
              {t('noNewDiagramsDesc')}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {diagrams.map((diagram) => (
              <DiagramCard key={diagram.id} diagram={diagram} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
