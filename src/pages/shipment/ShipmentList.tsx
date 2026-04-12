import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import type { ShipmentStatus } from '../../types/shipment';
import { useShipmentStore } from '../../store';
import { useShipmentInfiniteForStatus } from '../../hooks/useShipmentInfiniteForStatus';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import CardItem from '../../components/common/CardItem';

const STATUS_ORDER: ShipmentStatus[] = ['OPEN', 'IN_TRANSIT', 'DELIVERED'];
const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

const ShipmentList = () => {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState<ShipmentStatus>('OPEN');
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { shipmentSelectedId, setShipmentSelectedId } = useShipmentStore();

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const trimmedDebounced = debouncedSearch.trim().toLowerCase();
  const mode = trimmedDebounced ? 'search' : 'browse';
  const queryKeyPart = mode === 'search' ? trimmedDebounced : '';

  const openQ = useShipmentInfiniteForStatus('OPEN', mode, queryKeyPart, PAGE_SIZE);
  const transitQ = useShipmentInfiniteForStatus('IN_TRANSIT', mode, queryKeyPart, PAGE_SIZE);
  const deliveredQ = useShipmentInfiniteForStatus('DELIVERED', mode, queryKeyPart, PAGE_SIZE);

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

  const shipments = useMemo(
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

  const handleSelectShipment = (shipmentId: string) => {
    setShipmentSelectedId(shipmentId);
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
        ) : shipments.length === 0 ? (
          <div className="text-gray-500 text-sm p-2">No shipments.</div>
        ) : (
          shipments.map((shipment) => (
            <CardItem
              key={shipment.id}
              onClick={() => handleSelectShipment(shipment.id)}
              isSelected={shipmentSelectedId === shipment.id}
            >
              <div className="font-mono">{shipment.label}</div>
              <div className="flex justify-between gap-2">
                <div className="text-sm text-gray-600">{shipment.client_name}</div>
                <div className="text-xs text-gray-500">
                  {dayjs(shipment.arrival_date).format('MMM D, YYYY')}
                </div>
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

export default ShipmentList;
