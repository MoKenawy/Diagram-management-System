import type { PaginationMeta } from '@/types/index';

interface ArchivePaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export const ArchivePagination = ({
  pagination,
  onPageChange,
  // onLimitChange,
}: ArchivePaginationProps) => {
  const { page, totalPages } = pagination;

  // Simple logic to show a few pages around the current page
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(page - p) <= 1);

  return (
    <div className="mt-12 flex justify-center items-center gap-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="p-2 rounded-md text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-sm">chevron_right</span>
      </button>

      {pages.map((p, i) => (
        <div key={p} className="flex items-center gap-2">
          {i > 0 && p - pages[i - 1] > 1 && (
            <span className="text-on-surface-variant text-sm">...</span>
          )}
          <button
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${page === p
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface hover:bg-surface-container-high'
              }`}
          >
            {p}
          </button>
        </div>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="p-2 rounded-md text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-sm">chevron_left</span>
      </button>
    </div>
  );
};