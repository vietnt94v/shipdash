import { useEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteAssignment, getAssignmentById, updateAssignment } from '../../api/assignment';
import { getShipmentsByAssignmentId } from '../../api/shipment';
import { useAssignmentStore, useShipmentStore } from '../../store';
import type { Assignment, AssignmentStatus } from '../../types/assignment';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import CardItem from '../../components/common/CardItem';
import Badge from '../../components/ui/Badge';

const PAGE_SIZE = 15;
const ASSIGNMENT_STATUSES: AssignmentStatus[] = ['OPEN', 'IN_TRANSIT', 'DELIVERED'];

const AssignmentDetailPanel = () => {
  const queryClient = useQueryClient();
  const { assignmentSelectedId, setAssignmentSelectedId } = useAssignmentStore();
  const { setShipmentSelectedId, shipmentSelectedId } = useShipmentStore();
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const shipmentsScrollRef = useRef<HTMLDivElement>(null);
  const shipmentsSentinelRef = useRef<HTMLDivElement>(null);

  const assignmentQuery = useQuery({
    queryKey: ['assignment', assignmentSelectedId],
    queryFn: () => getAssignmentById(assignmentSelectedId),
    enabled: !!assignmentSelectedId,
  });

  const shipmentsInfinite = useInfiniteQuery({
    queryKey: ['shipments', 'byAssignment', assignmentSelectedId],
    queryFn: ({ pageParam, signal }) =>
      getShipmentsByAssignmentId(assignmentSelectedId!, pageParam as number, PAGE_SIZE, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => last.next ?? undefined,
    enabled: !!assignmentSelectedId,
  });

  const shipments = useMemo(
    () => shipmentsInfinite.data?.pages.flatMap((p) => p.data) ?? [],
    [shipmentsInfinite.data],
  );

  const shipmentTotalFromApi = shipmentsInfinite.data?.pages[0]?.items;
  const shipmentCountReady = shipmentsInfinite.data !== undefined;
  const hasAnyShipments = shipmentCountReady && (shipmentTotalFromApi ?? 0) > 0;
  const canDeleteAssignment = shipmentCountReady && !hasAnyShipments;

  const counts = useMemo(() => {
    let open = 0;
    let transit = 0;
    let delivered = 0;
    for (const s of shipments) {
      if (s.status === 'OPEN') {
        open += 1;
      } else if (s.status === 'IN_TRANSIT') {
        transit += 1;
      } else {
        delivered += 1;
      }
    }
    return { open, transit, delivered };
  }, [shipments]);

  const assignment = assignmentQuery.data as Assignment | undefined;

  const shipmentsInfiniteRef = useRef(shipmentsInfinite);
  shipmentsInfiniteRef.current = shipmentsInfinite;

  useEffect(() => {
    const root = shipmentsScrollRef.current;
    const sentinel = shipmentsSentinelRef.current;
    if (!root || !sentinel || !assignmentSelectedId) {
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        const q = shipmentsInfiniteRef.current;
        if (hit && q.hasNextPage && !q.isFetchingNextPage) {
          q.fetchNextPage();
        }
      },
      { root, rootMargin: '80px', threshold: 0 },
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [assignmentSelectedId, assignmentQuery.isSuccess]);

  const onStatusChange = async (next: AssignmentStatus) => {
    if (!assignment || savingStatus) {
      return;
    }
    setSavingStatus(true);
    try {
      await updateAssignment(assignment.id, { ...assignment, status: next });
      await queryClient.invalidateQueries({ queryKey: ['assignments'] });
      await queryClient.invalidateQueries({
        queryKey: ['assignment', assignment.id],
      });
    } finally {
      setSavingStatus(false);
    }
  };

  const onDeleteClick = () => {
    if (!assignment || deleting || !canDeleteAssignment) {
      return;
    }
    setDeleteConfirmOpen(true);
  };

  const onConfirmDelete = async () => {
    if (!assignment || deleting) {
      return;
    }
    setDeleteConfirmOpen(false);
    setDeleting(true);
    try {
      await deleteAssignment(assignment.id);
      setAssignmentSelectedId('');
      setShipmentSelectedId('');
      await queryClient.invalidateQueries({ queryKey: ['assignments'] });
    } finally {
      setDeleting(false);
    }
  };

  if (!assignmentSelectedId) {
    return <div className="text-gray-500 text-sm p-2">Select an assignment.</div>;
  }

  if (assignmentQuery.isPending) {
    return <div className="text-gray-500 text-sm p-2">Loading…</div>;
  }

  if (assignmentQuery.isError || !assignment) {
    return <div className="text-red-600 text-sm p-2">Assignment not found.</div>;
  }

  return (
    <div className="flex flex-col min-h-0 flex-1 border border-gray-300 rounded-md overflow-hidden">
      <div className="flex justify-between items-start gap-2 border-b border-gray-300 pb-2 shrink-0 p-3">
        <div>
          <h2 className="uppercase font-mono font-bold text-2xl">{assignment.label}</h2>
          <div className="text-sm text-gray-600 mt-1">
            {assignment.clients.length > 0 ? assignment.clients.join(' · ') : '—'}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0 max-w-48">
          <span
            className="inline-block"
            title={
              hasAnyShipments
                ? 'Remove all shipments from this assignment before deleting it.'
                : undefined
            }
          >
            <Button
              variant="danger"
              size="sm"
              outline
              disabled={deleting || !canDeleteAssignment}
              onClick={onDeleteClick}
            >
              Delete
            </Button>
          </span>
        </div>
      </div>
      <div className="shrink-0 p-3 border-b border-gray-300">
        <Select
          label="Status"
          value={assignment.status}
          disabled={savingStatus}
          onChange={(value) => void onStatusChange(value as AssignmentStatus)}
        >
          {ASSIGNMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex gap-2 text-sm shrink-0 flex-wrap p-3 border-b border-gray-300">
        <span className="text-gray-600">
          <strong>{counts.open}</strong> OPEN
        </span>
        <span className="text-gray-400">·</span>
        <span className="text-gray-600">
          <strong>{counts.transit}</strong> TRANSIT
        </span>
        <span className="text-gray-400">·</span>
        <span className="text-gray-600">
          <strong>{counts.delivered}</strong> DELIVERED
        </span>
      </div>

      <div className="flex flex-col min-h-0 flex-1">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide shrink-0 p-1 border-b border-gray-300 bg-gray-200">
          Shipments · {shipments.length}
          {shipmentsInfinite.hasNextPage ? '+' : ''}
        </div>
        <div ref={shipmentsScrollRef} className="flex flex-col flex-1 min-h-0 overflow-y-auto">
          {shipmentsInfinite.isPending && !shipmentsInfinite.data ? (
            <div className="text-gray-500 text-sm p-2">Loading…</div>
          ) : shipments.length === 0 ? (
            <div className="text-gray-500 text-sm p-2">No shipments yet.</div>
          ) : (
            shipments.map((s) => (
              <CardItem
                key={s.id}
                onClick={() => setShipmentSelectedId(s.id)}
                isSelected={shipmentSelectedId === s.id}
              >
                <div className="font-mono">{s.label}</div>
                <div className="flex justify-between gap-2">
                  <div className="text-sm text-gray-600">{s.client_name}</div>
                  <Badge
                    size="sm"
                    variant={
                      s.status === 'OPEN'
                        ? 'primary'
                        : s.status === 'IN_TRANSIT'
                          ? 'warning'
                          : 'success'
                    }
                    hasAnchor
                  >
                    {s.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardItem>
            ))
          )}
          <div ref={shipmentsSentinelRef} className="h-px w-full shrink-0" aria-hidden />
          {shipmentsInfinite.isFetchingNextPage ? (
            <div className="text-gray-500 text-sm p-2 text-center shrink-0">Loading more…</div>
          ) : null}
        </div>
      </div>

      <Modal open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} hideCloseButton>
        <div>
          <h3 className="font-semibold text-lg">Delete this assignment?</h3>
          <p className="text-sm text-gray-600 mt-2">
            This will remove <span className="font-mono">{assignment.label}</span>. This cannot be
            undone.
          </p>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="secondary" outline onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => void onConfirmDelete()}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AssignmentDetailPanel;
