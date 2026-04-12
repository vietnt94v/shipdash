import { useInfiniteQuery } from '@tanstack/react-query';
import { getAssignments } from '../api/assignment';
import type { AssignmentStatus } from '../types/assignment';

export function useAssignmentInfiniteForStatus(
  status: AssignmentStatus,
  mode: 'browse' | 'search',
  searchQuery: string,
  pageSize: number,
) {
  return useInfiniteQuery({
    queryKey: ['assignments', mode, searchQuery, status],
    refetchOnWindowFocus: false,
    queryFn: ({ pageParam, signal }) => {
      const page = pageParam as number;
      const search = mode === 'search' ? searchQuery : '';
      return getAssignments(page, pageSize, {
        search,
        status,
        signal,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.next ?? undefined,
  });
}
