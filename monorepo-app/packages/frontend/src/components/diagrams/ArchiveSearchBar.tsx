interface ArchiveSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const ArchiveSearchBar = ({ value, onChange, disabled }: ArchiveSearchBarProps) => (
  <div className="hidden sm:flex items-center bg-surface-container-low rounded-full px-4 py-2 border border-outline-variant/30 focus-within:border-primary w-96 transition-colors">
    <span className="material-symbols-outlined text-on-surface-variant ml-2">search</span>
    <input 
      className="bg-transparent border-none focus:ring-0 text-sm text-on-surface w-full placeholder:text-on-surface-variant/70 focus:outline-none" 
      placeholder="البحث عن المخططات، العناوين، العلامات..." 
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    />
  </div>
);