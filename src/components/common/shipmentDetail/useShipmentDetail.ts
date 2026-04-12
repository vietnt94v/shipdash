import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useShipmentStore } from '../../../store';
import {
  getShipmentById,
  updateShipment,
  deleteShipment,
} from '../../../api/shipment';
import type { Shipment, ShipmentStatus } from '../../../types/shipment';
import {
  getAssignments as fetchAssignments,
  getAssignmentById,
} from '../../../api/assignment';
import { ASSIGN_LIST_SIZE } from './constants';
import { invalidateShipmentRelatedQueries } from './invalidateShipmentRelatedQueries';

type AssignItem = { id: string; label: string };

type UseShipmentDetailArgs = {
  effectiveId: string;
  assignmentContext?: boolean;
};

export function useShipmentDetail({
  effectiveId,
  assignmentContext,
}: UseShipmentDetailArgs) {
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

  const { data: assignmentForLabel } = useQuery({
    queryKey: ['assignment', 'label', draft?.assignment_id],
    queryFn: ({ signal }) =>
      getAssignmentById(draft!.assignment_id!, signal),
    enabled: Boolean(draft?.assignment_id && draft.status !== 'OPEN'),
  });

  const assignmentLabel =
    assignmentForLabel?.label ?? draft?.assignment_id ?? '';

  const showAssignment =
    draft &&
    (draft.status === 'IN_TRANSIT' || draft.status === 'DELIVERED');

  const assignmentsPickQuery = useQuery({
    queryKey: ['assignments', 'pick', assignOpen, assignQDebounced],
    queryFn: ({ signal }) =>
      fetchAssignments(1, ASSIGN_LIST_SIZE, {
        search: assignQDebounced,
        signal,
      }).then((r) => r.data),
    enabled: Boolean(assignOpen && showAssignment),
  });

  const assignLoading =
    assignmentsPickQuery.isFetching || assignmentsPickQuery.isPending;

  const assignRows = assignmentsPickQuery.data ?? [];
  const assignListBase = assignRows.map((a) => ({
    id: a.id,
    label: a.label,
  }));
  const assignItems: AssignItem[] =
    draft?.assignment_id &&
    assignmentLabel &&
    !assignListBase.some((x) => x.id === draft.assignment_id)
      ? [
          { id: draft.assignment_id, label: assignmentLabel },
          ...assignListBase,
        ]
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
          status === 'OPEN'
            ? null
            : (prev.assignment_id ?? server?.assignment_id ?? null),
      }));
    },
    [server?.assignment_id],
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
    mutationFn: (vars: { id: string; assignmentId?: string | null }) =>
      deleteShipment(vars.id),
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

  const ready =
    shipmentQuery.isSuccess &&
    draft !== null &&
    draft.id === effectiveId;

  const canDeleteShipment = draft?.status === 'OPEN';

  return {
    ready,
    draft,
    patchDraft,
    assignmentPicker: {
      open: assignOpen,
      onOpenChange: onAssignOpenChange,
      searchValue: assignQ,
      onSearchChange: setAssignQ,
      items: assignItems,
      loading: assignLoading,
      triggerLabel: assignTrigger,
      onSelect: (item: AssignItem) => {
        patchDraft({ assignment_id: item.id });
      },
    },
    showAssignment: Boolean(showAssignment),
    saving: saveMutation.isPending,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    deleting: deleteMutation.isPending,
    canDeleteShipment: Boolean(canDeleteShipment),
    setStatus,
    save,
    onDeleteClick,
    onConfirmDelete,
  };
}
