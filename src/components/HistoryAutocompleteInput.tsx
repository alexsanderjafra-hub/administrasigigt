import React, { useState, useRef, useEffect, useMemo } from "react";
import { History, X, ChevronDown } from "lucide-react";

interface HistoryAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  onSaveHistory?: (value: string) => void;
  onRemoveSuggestion?: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  name?: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const HistoryAutocompleteInput: React.FC<HistoryAutocompleteInputProps> = ({
  value,
  onChange,
  suggestions,
  onSaveHistory,
  onRemoveSuggestion,
  placeholder,
  className = "input-field text-xs",
  required = false,
  multiline = false,
  rows = 4,
  name,
  onBlur,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasTypedSinceFocus, setHasTypedSinceFocus] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, []);

  const filteredSuggestions = useMemo(() => {
    const cleanList = suggestions.filter((s) => s && s.trim().length > 0);
    if (!hasTypedSinceFocus || !value.trim()) {
      return cleanList.slice(0, 20);
    }
    const q = value.trim().toLowerCase();
    const matches = cleanList.filter((s) => s.toLowerCase().includes(q));
    return matches.slice(0, 20);
  }, [suggestions, value, hasTypedSinceFocus]);

  const handleFocus = () => {
    setHasTypedSinceFocus(false);
    if (suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (onSaveHistory && value.trim().length >= 2) {
      onSaveHistory(value);
    }
    if (onBlur) onBlur(e);
  };

  const handleSelectItem = (item: string) => {
    onChange(item);
    if (onSaveHistory) onSaveHistory(item);
    setHasTypedSinceFocus(false);
    setIsOpen(false);
  };

  const hasSuggestions = suggestions.length > 0;

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0 w-full">
      <div className="relative w-full">
        {multiline ? (
          <textarea
            name={name}
            rows={rows}
            required={required}
            placeholder={placeholder}
            value={value}
            onFocus={handleFocus}
            onClick={handleFocus}
            onBlur={handleInputBlur}
            onChange={(e) => {
              setHasTypedSinceFocus(true);
              if (suggestions.length > 0) setIsOpen(true);
              onChange(e.target.value);
            }}
            className={`${className} ${hasSuggestions ? "pr-10" : ""}`}
          />
        ) : (
          <input
            name={name}
            type="text"
            required={required}
            placeholder={placeholder}
            value={value}
            onFocus={handleFocus}
            onClick={handleFocus}
            onBlur={handleInputBlur}
            onChange={(e) => {
              setHasTypedSinceFocus(true);
              if (suggestions.length > 0) setIsOpen(true);
              onChange(e.target.value);
            }}
            className={`${className} w-full ${hasSuggestions ? "pr-10" : ""}`}
            autoComplete="off"
          />
        )}

        {hasSuggestions && (
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setHasTypedSinceFocus(false);
              setIsOpen((prev) => !prev);
            }}
            title="Pilih dari riwayat input sebelumnya"
            className={`absolute right-2 ${multiline ? "top-3" : "top-1/2 -translate-y-1/2"} p-1.5 rounded-lg transition-colors flex items-center gap-0.5 cursor-pointer ${
              isOpen
                ? "bg-primary/10 text-primary"
                : "text-slate-400 hover:text-primary hover:bg-slate-100"
            }`}
          >
            <History size={13} />
            <ChevronDown size={11} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      {isOpen && (filteredSuggestions.length > 0 || (hasTypedSinceFocus && suggestions.length > 0)) && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in duration-150">
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <History size={12} className="text-primary" />
              Riwayat Input ({filteredSuggestions.length})
            </span>
            <div className="flex items-center gap-2">
              {hasTypedSinceFocus && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setHasTypedSinceFocus(false)}
                  className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                >
                  Lihat Semua
                </button>
              )}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setIsOpen(false)}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>

          {filteredSuggestions.length === 0 ? (
            <div className="px-3.5 py-3 text-[11px] text-slate-400 italic flex items-center justify-between">
              <span>Tidak ada riwayat yang cocok.</span>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setHasTypedSinceFocus(false)}
                className="text-primary font-bold not-italic hover:underline cursor-pointer"
              >
                Tampilkan semua
              </button>
            </div>
          ) : (
            <div className="max-h-52 overflow-y-auto divide-y divide-slate-100/80">
              {filteredSuggestions.map((item, idx) => {
                const isExact = item.trim().toLowerCase() === value.trim().toLowerCase();
                return (
                  <div
                    key={`${item}_${idx}`}
                    className={`flex items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors ${
                      isExact ? "bg-primary/5" : "hover:bg-slate-50"
                    }`}
                  >
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectItem(item)}
                      className="flex-1 text-left text-xs font-semibold text-slate-700 hover:text-primary leading-snug break-words cursor-pointer"
                    >
                      {item}
                    </button>
                    {onRemoveSuggestion && (
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveSuggestion(item);
                        }}
                        title="Hapus dari riwayat lokal"
                        className="p-1 text-slate-300 hover:text-rose-500 rounded-md transition-colors shrink-0 cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
