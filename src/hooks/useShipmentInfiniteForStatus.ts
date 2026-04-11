import { useInfiniteQuery } from '@tanstack/react-query';
import { getShipments, searchShipments } from '../api/shipment';
import type { ShipmentStatus } from '../types/shipment';

export function useShipmentInfiniteForStatus(
  status: ShipmentStatus,
  mode: 'browse' | 'search',
  searchQuery: string,
  pageSize: number,
) {
  return useInfiniteQuery({
    queryKey: ['shipments', mode, searchQuery, status],
    queryFn: ({ pageParam, signal }) => {
      const page = pageParam as number;
      if (mode === 'browse') {
        return getShipments(status, page, pageSize, signal);
      }
      return searchShipments(status, page, pageSize, searchQuery, signal);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.next ?? undefined,
  });
}
