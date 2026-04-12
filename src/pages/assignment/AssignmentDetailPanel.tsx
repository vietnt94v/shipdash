import { useEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import {
  deleteAssignment,
  getAssignmentById,
  updateAssignment,
} from '../../api/assignment';
import { getShipmentsByAssignmentId } from '../../api/shipment';
import { useAssignmentStore, useShipmentStore } from '../../store';
import type { Assignment, AssignmentStatus } from '../../types/assignment';
import type { ShipmentStatus } from '../../types/shipment';

const PAGE_SIZE = 15;
const ASSIGNMENT_STATUSES: AssignmentStatus[] = [
  'OPEN',
  'IN_TRANSIT',
  'DELIVERED',
];

const shipmentStatusBadge = (s: ShipmentStatus) => {
  if (s === 'OPEN') {
    return 'bg-blue-100 text-blue-800';
  }
  if (s === 'IN_TRANSIT') {
    return 'bg-amber-100 text-amber-900';
  }
  return 'bg-emerald-100 text-emerald-900';
};

const AssignmentDetailPanel = () => {
  const queryClient = useQueryClient();
  const { assignmentSelectedId, setAssignmentSelectedId } = useAssignmentStore();
  const { setShipmentSelectedId, shipmentSelectedId } = useShipmentStore();
  const [deleting, setDeleting] = useState(false);
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
      getShipmentsByAssignmentId(
        assignmentSelectedId!,
        pageParam as number,
        PAGE_SIZE,
        signal,
      ),
    initialPageParam: 1,
    getNextPageParam: (last) => last.next ?? undefined,
    enabled: !!assignmentSelectedId,
  });

  const shipments = useMemo(
    () => shipmentsInfinite.data?.pages.flatMap((p) => p.data) ?? [],
    [shipmentsInfinite.data],
  );

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

  const onDelete = async () => {
    if (!assignment || deleting) {
      return;
    }
    const check = await getShipmentsByAssignmentId(assignment.id, 1, 1);
    if (check.items > 0) {
      window.alert('Only empty assignments can be deleted.');
      return;
    }
    if (!window.confirm('Delete this assignment?')) {
      return;
    }
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
    return (
      <div className="text-gray-500 text-sm p-2">Select an assignment.</div>
    );
  }

  if (assignmentQuery.isPending) {
    return <div className="text-gray-500 text-sm p-2">Loading…</div>;
  }

  if (assignmentQuery.isError || !assignment) {
    return <div className="text-red-600 text-sm p-2">Assignment not found.</div>;
  }

  return (
    <div className="flex flex-col gap-3 min-h-0 flex-1">
      <div className="flex justify-between items-start gap-2 border-b border-gray-200 pb-2 shrink-0">
        <div>
          <div className="text-lg font-bold">{assignment.label}</div>
          <div className="text-sm text-gray-600 mt-1">
            {assignment.clients.length > 0
              ? assignment.clients.join(' · ')
              : '—'}
          </div>
        </div>
        <button
          type="button"
          className="button-base text-red-600 shrink-0"
          disabled={deleting}
          onClick={() => void onDelete()}
        >
          {deleting ? '…' : 'Delete'}
        </button>
      </div>

      <div className="shrink-0">
        <label htmlFor="assignment-status" className="field-label">
          Status
        </label>
        <select
          id="assignment-status"
          className="select-base mt-1"
          value={assignment.status}
          disabled={savingStatus}
          onChange={(e) =>
            void onStatusChange(e.target.value as AssignmentStatus)
          }
        >
          {ASSIGNMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 text-sm shrink-0 flex-wrap">
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
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide pb-2 shrink-0">
          Shipments · {shipments.length}
          {shipmentsInfinite.hasNextPage ? '+' : ''}
        </div>
        <div
          ref={shipmentsScrollRef}
          className="flex flex-col flex-1 min-h-0 overflow-y-auto border border-gray-200 rounded-md"
        >
          {shipmentsInfinite.isPending && !shipmentsInfinite.data ? (
            <div className="text-gray-500 text-sm p-2">Loading…</div>
          ) : shipments.length === 0 ? (
            <div className="text-gray-500 text-sm p-2">No shipments yet.</div>
          ) : (
            shipments.map((s) => (
              <div
                key={s.id}
                role="button"
                tabIndex={0}
                onClick={() => setShipmentSelectedId(s.id)}
                onKeyDown={(ev) => {
                  if (ev.key === 'Enter' || ev.key === ' ') {
                    ev.preventDefault();
                    setShipmentSelectedId(s.id);
                  }
                }}
                className={`cursor-pointer border-b border-gray-200 last:border-b-0 p-2 shrink-0 ${
                  shipmentSelectedId === s.id ? 'bg-gray-300' : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="font-mono text-sm">{s.label}</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${shipmentStatusBadge(
                      s.status,
                    )}`}
                  >
                    {s.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">{s.client_name}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {dayjs(s.arrival_date).format('MMM D, YYYY')}
                </div>
              </div>
            ))
          )}
          <div
            ref={shipmentsSentinelRef}
            className="h-px w-full shrink-0"
            aria-hidden
          />
          {shipmentsInfinite.isFetchingNextPage ? (
            <div className="text-gray-500 text-sm p-2 text-center shrink-0">
              Loading more…
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetailPanel;
