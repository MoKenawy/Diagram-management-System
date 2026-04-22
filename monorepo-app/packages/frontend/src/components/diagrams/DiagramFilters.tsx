import { useState, useRef, useEffect } from 'react';
import { useActiveDepartments } from '@/hooks/queries/useDepartmentQueries';
import type { FileFormat, Role } from '@/types/index';

interface DiagramFiltersProps {
  selectedFormats: FileFormat[];
  selectedDepartments: string[];
  uploadedFrom: string;
  uploadedTo: string;
  userRole: Role;
  hasActiveFilters: boolean;
  onToggleFormat: (format: FileFormat) => void;
  onDepartmentsChange: (ids: string[]) => void;
  onDateChange: (from?: string, to?: string) => void;
  onClear: () => void;
}

export const DiagramFilters = ({
  selectedFormats,
  selectedDepartments,
  uploadedFrom,
  uploadedTo,
  hasActiveFilters,
  onToggleFormat,
  onDepartmentsChange,
  onDateChange,
  onClear,
}: DiagramFiltersProps) => {
  const { data: departments = [] } = useActiveDepartments();

  const [isFormatsOpen, setIsFormatsOpen] = useState(false);
  const formatsRef = useRef<HTMLDivElement>(null);

  const [isDeptsOpen, setIsDeptsOpen] = useState(false);
  const deptsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (formatsRef.current && !formatsRef.current.contains(target)) {
        setIsFormatsOpen(false);
      }
      if (deptsRef.current && !deptsRef.current.contains(target)) {
        setIsDeptsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fileFormats: FileFormat[] = ['PDF', 'JPEG', 'PNG', 'SVG', 'DWG'];

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-surface-container-low rounded-xl">
      <div className="flex items-center gap-1">
        <span className="material-symbols-outlined text-on-surface-variant">filter_list</span>
        <span className="text-sm font-semibold text-on-surface">عوامل التصفية:</span>
      </div>

      {/* Departments Dropdown with Checkboxes */}
      <div className="relative flex items-center pr-2" ref={deptsRef}>
        <span className="text-sm font-semibold text-on-surface ml-2 hidden sm:inline">القسم:</span>
        <button
          type="button"
          onClick={() => setIsDeptsOpen(!isDeptsOpen)}
          className="bg-surface-container-lowest text-sm text-on-surface rounded-md shadow-sm py-2 px-3 flex items-center gap-2 hover:bg-surface-container-high transition-colors focus:outline-none focus:ring-primary"
        >
          <span>
            {selectedDepartments.length === 0
              ? 'الكل'
              : selectedDepartments.length === 1
                ? departments.find(d => d.id === selectedDepartments[0])?.nameAr || 'قسم'
                : `${selectedDepartments.length} أقسام`}
          </span>
          <span className="material-symbols-outlined text-[18px]">
            {isDeptsOpen ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {isDeptsOpen && (
          <div className="absolute top-full right-0 mt-1 w-56 bg-surface-container-lowest shadow-lg rounded-xl border border-outline-variant/30 overflow-hidden z-20">
            <div className="py-2 flex flex-col max-h-60 overflow-y-auto">
              {departments.map(dept => {
                const isSelected = selectedDepartments.includes(dept.id);
                return (
                  <label
                    key={dept.id}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-surface-container-high cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        if (isSelected) {
                          onDepartmentsChange(selectedDepartments.filter(id => id !== dept.id));
                        } else {
                          onDepartmentsChange([...selectedDepartments, dept.id]);
                        }
                      }}
                      className="w-4 h-4 rounded text-primary border-outline-variant focus:ring-primary bg-surface-container-lowest cursor-pointer"
                    />
                    <span className="text-sm text-on-surface font-medium truncate" title={dept.nameAr}>{dept.nameAr}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* File Formats Dropdown with Checkboxes */}
      <div className="relative flex items-center border-r border-outline-variant/30 pr-3" ref={formatsRef}>
        <span className="text-sm font-semibold text-on-surface ml-2 hidden sm:inline">الصيغة:</span>
        <button
          type="button"
          onClick={() => setIsFormatsOpen(!isFormatsOpen)}
          className="bg-surface-container-lowest text-sm text-on-surface rounded-md shadow-sm py-2 px-3 flex items-center gap-2 hover:bg-surface-container-high transition-colors focus:outline-none focus:ring-primary"
        >
          <span>
            {selectedFormats.length === 0
              ? 'الكل'
              : selectedFormats.length === 1
                ? selectedFormats[0]
                : `${selectedFormats.length} صيغ`}
          </span>
          <span className="material-symbols-outlined text-[18px]">
            {isFormatsOpen ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {isFormatsOpen && (
          <div className="absolute top-full right-0 mt-1 w-48 bg-surface-container-lowest shadow-lg rounded-xl border border-outline-variant/30 overflow-hidden z-20">
            <div className="py-2 flex flex-col max-h-60 overflow-y-auto">
              {fileFormats.map(fmt => {
                const isSelected = selectedFormats.includes(fmt);
                return (
                  <label
                    key={fmt}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-surface-container-high cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleFormat(fmt)}
                      className="w-4 h-4 rounded text-primary border-outline-variant focus:ring-primary bg-surface-container-lowest cursor-pointer"
                    />
                    <span className="text-sm text-on-surface font-medium">{fmt}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Date Range filtering - Start & End Date */}
      <div className="flex items-center gap-2 flex-wrap border-r border-outline-variant/30 pr-3">
        <span className="text-sm font-semibold text-on-surface hidden sm:inline">التاريخ:</span>
        <input
          type="date"
          value={uploadedFrom || ''}
          onChange={(e) => onDateChange(e.target.value || undefined, uploadedTo)}
          className="bg-surface-container-lowest text-sm text-on-surface rounded-md shadow-sm py-1.5 px-3 border-none focus:ring-primary outline-none"
        />
        <span className="text-xs text-on-surface-variant">-</span>
        <input
          type="date"
          value={uploadedTo || ''}
          onChange={(e) => onDateChange(uploadedFrom, e.target.value || undefined)}
          className="bg-surface-container-lowest text-sm text-on-surface rounded-md shadow-sm py-1.5 px-3 border-none focus:ring-primary outline-none"
        />
      </div>

      {hasActiveFilters && (
        <button
          onClick={onClear}
          className="mr-auto text-sm text-error font-medium flex items-center gap-1 hover:underline hover:bg-error/10 px-2 py-1 rounded-md transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
          مسح
        </button>
      )}
    </div>
  );
};