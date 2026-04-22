interface ViewToggleProps {
  view: 'grid' | 'table';
  onChange: (view: 'grid' | 'table') => void;
}

export const ViewToggle = ({ view, onChange }: ViewToggleProps) => (
  <div className="flex items-center gap-3 w-full md:w-auto">
    <div className="flex items-center bg-surface-container-high rounded-full p-1 w-full md:w-auto">
      <button 
        onClick={() => onChange('grid')} 
        className={`flex-1 md:flex-none px-4 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
          view === 'grid' 
            ? 'bg-surface-container-lowest text-primary shadow-sm' 
            : 'text-on-surface-variant hover:text-on-surface font-medium'
        }`}
      >
        <span className="material-symbols-outlined text-[18px]">grid_view</span> شبكة
      </button>
      <button 
        onClick={() => onChange('table')} 
        className={`flex-1 md:flex-none px-4 py-2 rounded-full text-sm flex items-center justify-center gap-2 transition-colors ${
          view === 'table' 
            ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold' 
            : 'text-on-surface-variant hover:text-on-surface font-medium'
        }`}
      >
        <span className="material-symbols-outlined text-[18px]">table_rows</span> قائمة
      </button>
    </div>
  </div>
);