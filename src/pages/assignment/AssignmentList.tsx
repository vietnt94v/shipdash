import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { AssignmentStatus } from '../../types/assignment';
import { useAssignmentStore, useShipmentStore } from '../../store';
import { useAssignmentInfiniteForStatus } from '../../hooks/useAssignmentInfiniteForStatus';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import CardItem from '../../components/common/CardItem';

const STATUS_ORDER: AssignmentStatus[] = ['OPEN', 'IN_TRANSIT', 'DELIVERED'];
const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

const AssignmentList = () => {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState<AssignmentStatus>('OPEN');
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { assignmentSelectedId, setAssignmentSelectedId } = useAssignmentStore();
  const { setShipmentSelectedId } = useShipmentStore();

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const trimmedDebounced = debouncedSearch.trim().toLowerCase();
  const mode = trimmedDebounced ? 'search' : 'browse';
  const queryKeyPart = mode === 'search' ? trimmedDebounced : '';

  const openQ = useAssignmentInfiniteForStatus('OPEN', mode, queryKeyPart, PAGE_SIZE);
  const transitQ = useAssignmentInfiniteForStatus('IN_TRANSIT', mode, queryKeyPart, PAGE_SIZE);
  const deliveredQ = useAssignmentInfiniteForStatus('DELIVERED', mode, queryKeyPart, PAGE_SIZE);

  const activeQuery = useMemo(() => {
    if (activeTab === 'OPEN') {
      return openQ;
    }
    if (activeTab === 'IN_TRANSIT') {
      return transitQ;
    }
    return deliveredQ;
  }, [activeTab, openQ, transitQ, deliveredQ]);
  const activeQueryRef = useRef(activeQuery);

  useLayoutEffect(() => {
    activeQueryRef.current = activeQuery;
  }, [activeQuery]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = 0;
    }
  }, [activeTab, mode, queryKeyPart]);

  const rows = useMemo(
    () => activeQuery.data?.pages.flatMap((p) => p.data) ?? [],
    [activeQuery.data],
  );

  useEffect(() => {
    const root = scrollRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel) {
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        const q = activeQueryRef.current;
        if (hit && q.hasNextPage && !q.isFetchingNextPage) {
          q.fetchNextPage();
        }
      },
      { root, rootMargin: '80px', threshold: 0 },
    );
    obs.observe(sentinel);

    return () => obs.disconnect();
  }, [mode, queryKeyPart, activeTab]);

  const handleSelectAssignment = (id: string) => {
    setAssignmentSelectedId(id);
    setShipmentSelectedId('');
  };

  const showInitialLoading = activeQuery.isPending && !activeQuery.data;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="shrink-0 border-b border-gray-300 p-3">
        <Input
          type="text"
          size="sm"
          placeholder="Search by label or client..."
          value={searchInput}
          onChange={(value) => setSearchInput(value)}
        />
      </div>
      <div className="flex justify-between border-b border-gray-300 bg-gray-200 p-2">
        {STATUS_ORDER.map((status) => (
          <Button
            key={status}
            onClick={() => setActiveTab(status)}
            variant={status === activeTab ? 'info' : 'secondary'}
            size="sm"
          >
            {status.replace('_', ' ')}
          </Button>
        ))}
      </div>
      <div ref={scrollRef} className="flex flex-col flex-1 min-h-0 overflow-y-auto">
        {showInitialLoading ? (
          <div className="text-gray-500 text-sm p-2">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="text-gray-500 text-sm p-2">No assignments.</div>
        ) : (
          rows.map((a) => (
            <CardItem
              key={a.id}
              onClick={() => handleSelectAssignment(a.id)}
              isSelected={assignmentSelectedId === a.id}
            >
              <div className="font-mono">{a.label}</div>
              <div className="text-sm text-gray-600">
                {a.shipment_count} shipment{a.shipment_count === 1 ? '' : 's'}
              </div>
            </CardItem>
          ))
        )}
        <div ref={sentinelRef} className="h-px w-full shrink-0" aria-hidden />
        {activeQuery.isFetchingNextPage ? (
          <div className="text-gray-500 text-sm p-2 text-center shrink-0">Loading more…</div>
        ) : null}
      </div>
    </div>
  );
};

export default AssignmentList;
