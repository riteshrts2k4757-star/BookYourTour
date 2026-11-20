import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, MapPin } from 'lucide-react';

export type LocationOption = {
  value: string;
  label?: string;
};

interface LocationAutocompleteProps {
  id: string;
  value: string;
  options: LocationOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  id,
  value,
  options,
  onChange,
  placeholder,
  className,
  required
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listboxId = `${id}-listbox`;
  const normalizedQuery = value.trim().toLocaleLowerCase();
  const matchingOptions = options.filter((option) => (
      `${option.value} ${option.label || ''}`.toLocaleLowerCase().includes(normalizedQuery)
    ));
  const filteredOptions = matchingOptions.slice(0, 8);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  const selectOption = (option: LocationOption) => {
    onChange(option.value);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((index) => Math.min(index + 1, filteredOptions.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((index) => (
        index <= 0 ? filteredOptions.length - 1 : index - 1
      ));
    } else if (event.key === 'Enter' && isOpen && filteredOptions[activeIndex]) {
      event.preventDefault();
      selectOption(filteredOptions[activeIndex]);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    } else if (event.key === 'Tab') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div ref={rootRef} className="relative w-full">
      <input
        id={id}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={isOpen && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`${className || 'input-field'} pr-10`}
        required={required}
        autoComplete="off"
      />
      <button
        type="button"
        aria-label={isOpen ? 'Hide location suggestions' : 'Show location suggestions'}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      >
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-[70] mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-xl shadow-slate-900/10 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95 dark:shadow-black/40">
          <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-2.5 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
              {normalizedQuery ? 'Matches' : 'Popular locations'}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {filteredOptions.length}{matchingOptions.length > filteredOptions.length ? '+' : ''} results
            </span>
          </div>

          {filteredOptions.length > 0 ? (
            <ul id={listboxId} role="listbox" className="max-h-64 overflow-y-auto p-1.5">
              {filteredOptions.map((option, index) => {
                const isActive = index === activeIndex;
                const isSelected = option.value === value;

                return (
                  <li key={`${option.value}-${option.label || ''}`} role="presentation">
                    <button
                      id={`${listboxId}-option-${index}`}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      tabIndex={-1}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectOption(option)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                        isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/40'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        <MapPin className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {option.value}
                        </span>
                        {option.label && (
                          <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
                            {option.label}
                          </span>
                        )}
                      </span>
                      {isSelected && <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-4 py-5 text-sm text-slate-500 dark:text-slate-400">
              No matches. You can still use “{value}”.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
