import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { deleteShipment, getShipmentById, updateShipment } from '../../../api/shipment';
import { getAssignments as fetchAssignments } from '../../../api/assignment';
import { useShipmentStore } from '../../../store';
import type { Shipment, ShipmentStatus } from '../../../types/shipment';
import Badge from '../../ui/Badge';
import Button from '../../ui/Button';
import Dropdown from '../../ui/Dropdown';
import Input from '../../ui/Input';
import Modal from '../../ui/Modal';
import Select from '../../ui/Select';
import ShipmentDetailRoute from './ShipmentDetailRoute';

const STATUSES: ShipmentStatus[] = ['OPEN', 'IN_TRANSIT', 'DELIVERED'];
const ASSIGN_LIST_SIZE = 100;

export type ShipmentDetailProps = {
  shipmentIdOverride?: string;
  routeShipments?: Shipment[];
  routeShipmentsPending?: boolean;
  assignmentContext?: boolean;
};

type AssignItem = { id: string; label: string };
type ShipmentDetailInnerProps = ShipmentDetailProps & {
  effectiveId: string;
};

async function invalidateShipmentRelatedQueries(
  queryClient: QueryClient,
  opts: { assignmentContext?: boolean; assignmentId?: string | null },
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

const ShipmentDetailInner = ({
  effectiveId,
  routeShipments,
  routeShipmentsPending,
  assignmentContext,
}: ShipmentDetailInnerProps) => {
  const queryClient = useQueryClient();
  const { setShipmentSelectedId } = useShipmentStore();
  const [edits, setEdits] = useState<Partial<Shipment>>({});
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignQ, setAssignQ] = useState('');
  const [assignQDebounced, setAssignQDebounced] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAssignQDebounced(assignQ), 300);
    return () => clearTimeout(t);
  }, [assignQ]);

  const shipmentQuery = useQuery({
    queryKey: ['shipment', 'detail', effectiveId],
    queryFn: ({ signal }) => getShipmentById(effectiveId, signal),
  });

  const server = shipmentQuery.data;

  const draft = useMemo((): Shipment | null => {
    if (!server) {
      return null;
    }
    return { ...server, ...edits };
  }, [server, edits]);

  const assignmentLabel = draft?.assignment_label || draft?.assignment_id || '';

  const showAssignment = draft && (draft.status === 'IN_TRANSIT' || draft.status === 'DELIVERED');

  const assignmentsPickQuery = useQuery({
    queryKey: ['assignments', 'pick', assignOpen, assignQDebounced],
    queryFn: ({ signal }) =>
      fetchAssignments(1, ASSIGN_LIST_SIZE, {
        search: assignQDebounced,
        signal,
      }).then((r) => r.data),
    enabled: Boolean(assignOpen && showAssignment),
  });

  const assignLoading = assignmentsPickQuery.isFetching || assignmentsPickQuery.isPending;

  const assignRows = assignmentsPickQuery.data ?? [];

  const assignListBase = assignRows.map((a) => ({
    id: a.id,
    label: a.label,
  }));

  const assignItems: AssignItem[] =
    draft?.assignment_id &&
    assignmentLabel &&
    !assignListBase.some((x) => x.id === draft.assignment_id)
      ? [{ id: draft.assignment_id, label: assignmentLabel }, ...assignListBase]
      : assignListBase;

  const assignTrigger = draft?.assignment_id
    ? assignItems.find((x) => x.id === draft.assignment_id)?.label ||
      assignmentLabel ||
      draft.assignment_id
    : '';

  const patchDraft = useCallback((patch: Partial<Shipment>) => {
    setEdits((prev) => ({ ...prev, ...patch }));
  }, []);

  const setStatus = useCallback(
    (status: ShipmentStatus) => {
      setEdits((prev) => ({
        ...prev,
        status,
        assignment_id:
          status === 'OPEN' ? null : (prev.assignment_id ?? server?.assignment_id ?? null),
        assignment_label:
          status === 'OPEN' ? null : (prev.assignment_label ?? server?.assignment_label ?? null),
      }));
    },
    [server?.assignment_id, server?.assignment_label],
  );

  const onAssignOpenChange = useCallback((open: boolean) => {
    setAssignOpen(open);
    if (open) {
      setAssignQ('');
      setAssignQDebounced('');
    }
  }, []);

  const saveMutation = useMutation({
    mutationFn: (s: Shipment) => updateShipment(s.id, s),
    onSuccess: async (_data, variables) => {
      await invalidateShipmentRelatedQueries(queryClient, {
        assignmentContext,
        assignmentId: variables.assignment_id,
      });
      await queryClient.invalidateQueries({
        queryKey: ['shipment', 'detail', variables.id],
      });
      setShipmentSelectedId('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (vars: { id: string; assignmentId?: string | null }) => deleteShipment(vars.id),
    onSuccess: async (_data, variables) => {
      await invalidateShipmentRelatedQueries(queryClient, {
        assignmentContext,
        assignmentId: variables.assignmentId,
      });
      await queryClient.invalidateQueries({
        queryKey: ['shipment', 'detail', variables.id],
      });
      setShipmentSelectedId('');
    },
  });

  const save = useCallback(() => {
    if (!draft) {
      return;
    }
    if (draft.status !== 'OPEN' && !draft.assignment_id) {
      alert('Please select an assignment');
      return;
    }
    saveMutation.mutate(draft);
  }, [draft, saveMutation]);

  const onDeleteClick = useCallback(() => {
    if (!draft || deleteMutation.isPending || draft.status !== 'OPEN') {
      return;
    }
    setDeleteConfirmOpen(true);
  }, [draft, deleteMutation.isPending]);

  const onConfirmDelete = useCallback(() => {
    if (!draft || deleteMutation.isPending || draft.status !== 'OPEN') {
      return;
    }
    setDeleteConfirmOpen(false);
    deleteMutation.mutate({
      id: draft.id,
      assignmentId: draft.assignment_id,
    });
  }, [draft, deleteMutation]);

  const ready = shipmentQuery.isSuccess && draft !== null && draft.id === effectiveId;

  const canDeleteShipment = draft?.status === 'OPEN';

  const ap = {
    open: assignOpen,
    onOpenChange: onAssignOpenChange,
    searchValue: assignQ,
    onSearchChange: setAssignQ,
    items: assignItems,
    loading: assignLoading,
    triggerLabel: assignTrigger,
    onSelect: (item: AssignItem) => {
      patchDraft({ assignment_id: item.id, assignment_label: item.label });
    },
  };

  if (!ready || !draft) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col gap-3 p-3">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-gray-200 pb-2">
            <div className="block">
              <div className="text-2xl font-bold font-mono">{draft.label}</div>
              <div className="text-sm text-gray-500">{draft.client_name}</div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant={
                  draft.status === 'OPEN'
                    ? 'primary'
                    : draft.status === 'IN_TRANSIT'
                      ? 'warning'
                      : 'success'
                }
                hasAnchor
              >
                {draft.status.replace('_', ' ')}
              </Badge>
              <div className="flex flex-col items-end gap-1 shrink-0 max-w-48">
                <span
                  className="inline-block"
                  title={
                    !canDeleteShipment
                      ? 'Only shipments with status OPEN can be deleted.'
                      : undefined
                  }
                >
                  <Button
                    variant="danger"
                    outline
                    disabled={deleteMutation.isPending || !canDeleteShipment}
                    onClick={onDeleteClick}
                  >
                    Delete
                  </Button>
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                label="Warehouse ID"
                id="warehouse_id"
                readOnly
                value={draft.warehouse_id}
                onChange={() => {}}
              />
            </div>
            <div className="flex-1">
              <Input
                label="Arrival Date"
                id="arrival_date"
                readOnly
                value={dayjs(draft.arrival_date).format('MMM D, YYYY')}
                onChange={() => {}}
              />
            </div>
          </div>
          <div className="block">
            <Input
              label="Delivery By Date"
              id="delivery_by_date"
              type="date"
              value={dayjs(draft.delivery_by_date).format('YYYY-MM-DD')}
              onChange={(value) => patchDraft({ delivery_by_date: value })}
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                label="Latitude"
                id="lat"
                type="number"
                value={draft.lat.toString()}
                onChange={(value) => patchDraft({ lat: parseFloat(value) })}
              />
            </div>
            <div className="flex-1">
              <Input
                label="Longitude"
                id="lng"
                type="number"
                value={draft.lng.toString()}
                onChange={(value) => patchDraft({ lng: parseFloat(value) })}
              />
            </div>
          </div>
          <div className="block bg-gray-100 p-3 rounded-md">
            <div className="block">
              <Select
                label="Status"
                value={draft.status}
                onChange={(value) => setStatus(value as ShipmentStatus)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </Select>
            </div>
            {showAssignment && (
              <div className="mt-3 block">
                <p className="field-label">Assignment ID</p>
                <Dropdown
                  open={ap.open}
                  onOpenChange={ap.onOpenChange}
                  placeholder="— Select assignment —"
                  triggerLabel={ap.triggerLabel}
                  searchValue={ap.searchValue}
                  onSearchChange={ap.onSearchChange}
                  items={ap.items}
                  loading={ap.loading}
                  hasMore={false}
                  onSelectItem={ap.onSelect}
                />
              </div>
            )}
            <div className="mt-4">
              <Button disabled={saveMutation.isPending} onClick={() => void save()}>
                Save change
              </Button>
            </div>
          </div>
        </div>
        <ShipmentDetailRoute
          assignmentContext={assignmentContext}
          routeShipmentsPending={routeShipmentsPending}
          routeShipments={routeShipments}
          shipment={draft}
        />
      </div>
      <Modal open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} hideCloseButton>
        <div>
          <h3 className="font-semibold text-lg">Delete this shipment?</h3>
          <p className="text-sm text-gray-600 mt-2">
            This will remove <span className="font-mono">{draft.label}</span>. This cannot be
            undone.
          </p>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="secondary" outline onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onConfirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

const ShipmentDetail = ({
  shipmentIdOverride,
  routeShipments,
  routeShipmentsPending,
  assignmentContext,
}: ShipmentDetailProps = {}) => {
  const { shipmentSelectedId } = useShipmentStore();
  const effectiveId = shipmentIdOverride !== undefined ? shipmentIdOverride : shipmentSelectedId;

  if (!effectiveId) {
    return null;
  }

  return (
    <ShipmentDetailInner
      key={effectiveId}
      effectiveId={effectiveId}
      routeShipments={routeShipments}
      routeShipmentsPending={routeShipmentsPending}
      assignmentContext={assignmentContext}
    />
  );
};

export default ShipmentDetail;
