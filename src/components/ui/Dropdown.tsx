import { useEffect, useRef } from 'react';

export type DropdownItem = { id: string; label: string };

export type DropdownProps = {
  id?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeholder: string;
  triggerLabel: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  showSearch?: boolean;
  items: DropdownItem[];
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onSelectItem: (item: DropdownItem) => void;
  disabled?: boolean;
};

const Dropdown = ({
  id,
  open,
  onOpenChange,
  placeholder,
  triggerLabel,
  searchValue,
  onSearchChange,
  showSearch = true,
  items,
  loading = false,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  onSelectItem,
  disabled = false,
}: DropdownProps) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onDocMouseDown = (e: MouseEvent) => {
      const el = rootRef.current;
      if (el && !el.contains(e.target as Node)) {
        onOpenChange(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onOpenChange]);

  const display = triggerLabel.trim() !== '' ? triggerLabel : null;

  const handleListScroll = (e: React.UIEvent<HTMLUListElement>) => {
    if (!hasMore || loadingMore || loading || !onLoadMore) {
      return;
    }
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 32) {
      onLoadMore();
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="select-base flex w-full cursor-pointer items-center justify-between gap-2 text-left"
        onClick={() => !disabled && onOpenChange(!open)}
      >
        <span className={display ? 'font-mono text-sm font-semibold' : 'text-slate-400'}>
          {display ?? placeholder}
        </span>
        <span className="text-slate-400" aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <div
          className="absolute z-50 mt-1 max-h-72 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
          role="listbox"
        >
          {showSearch && (
            <div className="border-b border-gray-100 p-2">
              <input
                type="search"
                className="input-base"
                value={searchValue}
                placeholder="Search…"
                onChange={(e) => onSearchChange(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          )}
          <ul className="max-h-48 overflow-y-auto py-1" onScroll={handleListScroll}>
            {loading && items.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-500">Loading…</li>
            ) : null}
            {!loading && items.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-500">No results</li>
            ) : null}
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  role="option"
                  className="w-full px-3 py-2 text-left text-sm font-mono hover:bg-slate-100"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onSelectItem(item);
                    onOpenChange(false);
                  }}
                >
                  {item.label}
                </button>
              </li>
            ))}
            {loadingMore ? (
              <li className="px-3 py-2 text-xs text-slate-400">Loading more…</li>
            ) : null}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
