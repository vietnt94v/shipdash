import type { QueryClient } from '@tanstack/react-query';

type Opts = {
  assignmentContext?: boolean;
  assignmentId?: string | null;
};

export async function invalidateShipmentRelatedQueries(
  queryClient: QueryClient,
  opts: Opts,
) {
  await queryClient.invalidateQueries({ queryKey: ['shipments'] });
  await queryClient.invalidateQueries({ queryKey: ['shipment', 'detail'] });
  if (opts.assignmentContext) {
    await queryClient.invalidateQueries({ queryKey: ['assignments'] });
    await queryClient.invalidateQueries({ queryKey: ['assignment'] });
    await queryClient.invalidateQueries({
      queryKey: ['shipments', 'byAssignment'],
    });
    if (opts.assignmentId) {
      await queryClient.invalidateQueries({
        queryKey: ['assignmentRoute', opts.assignmentId],
      });
    }
  }
}
