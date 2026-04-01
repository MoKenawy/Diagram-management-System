import type { DiagramSummary } from '../types';
import { StatusBadge } from './ui/StatusBadge';
import { FileText, Image, PenTool } from 'lucide-react';

interface DiagramCardProps {
  diagram: DiagramSummary;
}

const formatIcons: Record<string, React.ReactNode> = {
  PDF: <FileText className="h-8 w-8" />,
  JPEG: <Image className="h-8 w-8" />,
  PNG: <Image className="h-8 w-8" />,
  SVG: <PenTool className="h-8 w-8" />,
  DWG: <FileText className="h-8 w-8" />,
};

export function DiagramCard({ diagram }: DiagramCardProps) {
  const version = diagram.currentVersion;
  const format = version?.fileFormat ?? 'PDF';
  const thumbnailUrl = version
    ? `/api/diagrams/${diagram.id}/versions/${version.id}/thumbnail`
    : null;

  return (
    <div className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
      {/* Thumbnail area */}
      <div className="flex h-40 items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={diagram.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`text-slate-300 ${thumbnailUrl ? 'hidden' : ''}`}>
          {formatIcons[format] ?? <FileText className="h-8 w-8" />}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="truncate text-sm font-semibold text-slate-900">{diagram.title}</h3>
        <p className="mt-1 text-xs text-slate-500">
          {diagram.department?.nameAr ?? diagram.department?.nameEn}
        </p>

        <div className="mt-3 flex items-center justify-between">
          {version && (
            <StatusBadge label={version.revisionLabel} variant="info" />
          )}
          <div className="flex gap-1">
            {diagram.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
