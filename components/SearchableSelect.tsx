
import React, { useState, useRef, useEffect } from 'react';

interface Option {
  id: string;
  label: string;
  subLabel?: string;
  icon?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  placeholder: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value, onChange, label, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
    opt.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <label className="text-[10px] font-bold uppercase opacity-50 ml-1 mb-1 block">{label}</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full glass p-4 rounded-2xl flex items-center justify-between text-left border border-transparent hover:border-black/5 dark:hover:border-white/10 transition-all"
      >
        <div className="flex items-center gap-3">
          {selectedOption?.icon && <span className="text-xl">{selectedOption.icon}</span>}
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight">{selectedOption?.label}</span>
            {selectedOption?.subLabel && <span className="text-[10px] opacity-40 uppercase font-bold">{selectedOption.subLabel}</span>}
          </div>
        </div>
        <svg className={`w-5 h-5 opacity-30 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-[60] mt-2 w-full glass rounded-3xl shadow-2xl overflow-hidden border border-black/5 dark:border-white/10 animate-in fade-in zoom-in duration-200">
          <div className="p-3 border-b border-black/5 dark:border-white/5">
            <input
              autoFocus
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 ring-amber-500/30"
            />
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full px-5 py-3 flex items-center gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left ${value === opt.id ? 'bg-amber-500/10 dark:bg-amber-500/20' : ''}`}
                >
                  {opt.icon && <span className="text-xl">{opt.icon}</span>}
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{opt.label}</span>
                    {opt.subLabel && <span className="text-[10px] opacity-40 font-bold">{opt.subLabel}</span>}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-5 py-8 text-center opacity-40 text-sm">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
