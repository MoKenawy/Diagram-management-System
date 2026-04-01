import { cn } from '../../utils/cn';

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  barClassName?: string;
}

export function ProgressBar({ value, className, barClassName }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('h-3 w-full overflow-hidden rounded-full bg-slate-200', className)}>
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500',
          clamped < 50
            ? 'bg-emerald-500'
            : clamped < 80
              ? 'bg-amber-500'
              : 'bg-red-500',
          barClassName,
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
