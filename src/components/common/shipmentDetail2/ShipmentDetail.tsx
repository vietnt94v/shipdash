import { useEffect, useMemo, useState } from 'react';
import Badge from '../../ui/Badge';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import Dropdown from '../../ui/Dropdown';
import Modal from '../../ui/Modal';
import dayjs from 'dayjs';
import { useShipmentStore } from '../../../store';
import { getShipmentById } from '../../../api/shipment';
import { getAssignments } from '../../../api/assignment';
import { useQuery } from '@tanstack/react-query';
import type { Shipment, ShipmentStatus } from '../../../types/shipment';

const STATUSES: ShipmentStatus[] = ['OPEN', 'IN_TRANSIT', 'DELIVERED'];

const ShipmentDetail = () => {
  const { shipmentSelectedId } = useShipmentStore();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [edits, setEdits] = useState<Partial<Shipment>>({});
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignQ, setAssignQ] = useState('');
  const shipmentQuery = useQuery({
    queryKey: ['shipment', 'detail', shipmentSelectedId],
    queryFn: () => getShipmentById(shipmentSelectedId),
    enabled: Boolean(shipmentSelectedId),
  });
  const server = shipmentQuery.data;

  useEffect(() => {
    setEdits({});
    setAssignOpen(false);
    setAssignQ('');
  }, [shipmentSelectedId]);

  const statusNow = edits.status ?? server?.status;
  const assignQuery = useQuery({
    queryKey: ['assignments', 'dropdown', assignOpen, assignQ],
    queryFn: ({ signal }) =>
      getAssignments(1, 100, { search: assignQ, signal }).then((r) => r.data),
    enabled:
      Boolean(shipmentSelectedId && server?.id && assignOpen) &&
      statusNow != null &&
      statusNow !== 'OPEN',
  });

  const draft = useMemo(() => {
    if (!server?.id) {
      return null;
    }
    return { ...server, ...edits };
  }, [server, edits]);

  if (!draft?.id) {
    return null;
  }

  const canDeleteShipment = draft.status === 'OPEN';

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
                {(draft.status ?? '').replace(/_/g, ' ')}
              </Badge>
              <div className="flex flex-col items-end gap-1 shrink-0 max-w-48">
                <Button
                  variant="danger"
                  outline
                  disabled={!canDeleteShipment}
                  onClick={() => {
                    setDeleteConfirmOpen(true);
                  }}
                >
                  Delete
                </Button>
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
              onChange={(value) => setEdits((prev) => ({ ...prev, delivery_by_date: value }))}
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                label="Latitude"
                id="lat"
                type="number"
                value={draft.lat != null ? String(draft.lat) : ''}
                onChange={(value) => setEdits((prev) => ({ ...prev, lat: parseFloat(value) }))}
              />
            </div>
            <div className="flex-1">
              <Input
                label="Longitude"
                id="lng"
                type="number"
                value={draft.lng != null ? String(draft.lng) : ''}
                onChange={(value) => setEdits((prev) => ({ ...prev, lng: parseFloat(value) }))}
              />
            </div>
          </div>
          <div className="block bg-gray-100 p-3 rounded-md">
            <div className="block">
              <Select
                label="Status"
                value={draft.status ?? STATUSES[0]}
                onChange={(value) => {
                  const status = value as ShipmentStatus;
                  setEdits((prev) => ({
                    ...prev,
                    status,
                    ...(status === 'OPEN'
                      ? { assignment_id: null, assignment_label: null }
                      : {}),
                  }));
                }}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </Select>
            </div>
            {draft.status !== 'OPEN' && (
              <div className="mt-3 block">
                <p className="field-label">Assignment</p>
                <Dropdown
                  open={assignOpen}
                  onOpenChange={(open) => {
                    setAssignOpen(open);
                    if (open) {
                      setAssignQ('');
                    }
                  }}
                  placeholder="— Select assignment —"
                  triggerLabel={
                    draft.assignment_label || draft.assignment_id || ''
                  }
                  searchValue={assignQ}
                  onSearchChange={setAssignQ}
                  items={(assignQuery.data ?? []).map((a) => ({
                    id: a.id,
                    label: a.label,
                  }))}
                  loading={assignQuery.isPending || assignQuery.isFetching}
                  hasMore={false}
                  onSelectItem={(item) =>
                    setEdits((prev) => ({
                      ...prev,
                      assignment_id: item.id,
                      assignment_label: item.label,
                    }))
                  }
                />
              </div>
            )}
            <div className="mt-4">
              <Button>Save change</Button>
            </div>
          </div>
        </div>
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
            <Button variant="danger">Delete</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ShipmentDetail;
