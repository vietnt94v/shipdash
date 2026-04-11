import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useShipmentStore } from '../../store';
import { getShipmentById, updateShipment } from '../../api/shipment';
import type { Shipment, ShipmentStatus } from '../../types/shipment';
import { getAssignments as fetchAssignments, getAssignmentById } from '../../api/assignment';
import type { Assignment } from '../../types/assignment';
import Dropdown from './Dropdown';

const STATUSES: ShipmentStatus[] = ['OPEN', 'IN_TRANSIT', 'DELIVERED'];
const ASSIGN_LIST_SIZE = 100;

const ShipmentDetail = () => {
  const queryClient = useQueryClient();
  const { shipmentSelectedId, setShipmentSelectedId } = useShipmentStore();
  const [shipmentSelected, setShipmentSelected] = useState<Shipment | null>(null);
  const [assignmentLabel, setAssignmentLabel] = useState('');
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignQ, setAssignQ] = useState('');
  const [assignQDebounced, setAssignQDebounced] = useState('');
  const [assignRows, setAssignRows] = useState<Assignment[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const showAssignment =
    shipmentSelected &&
    (shipmentSelected.status === 'IN_TRANSIT' || shipmentSelected.status === 'DELIVERED');

  useEffect(() => {
    if (!shipmentSelectedId) {
      setShipmentSelected(null);
      return;
    }
    getShipmentById(shipmentSelectedId).then((data) => {
      setShipmentSelected(data);
      if (data.assignment_id && data.status !== 'OPEN') {
        getAssignmentById(data.assignment_id)
          .then((a) => setAssignmentLabel(a.label))
          .catch(() => setAssignmentLabel(data.assignment_id ?? ''));
      } else {
        setAssignmentLabel('');
      }
    });
  }, [shipmentSelectedId]);

  useEffect(() => {
    const t = setTimeout(() => setAssignQDebounced(assignQ), 300);
    return () => clearTimeout(t);
  }, [assignQ]);

  useEffect(() => {
    if (!assignOpen || !showAssignment) {
      return;
    }
    const ac = new AbortController();
    setAssignLoading(true);
    fetchAssignments(1, ASSIGN_LIST_SIZE, {
      search: assignQDebounced,
      signal: ac.signal,
    })
      .then((res) => setAssignRows(res.data))
      .finally(() => {
        if (!ac.signal.aborted) {
          setAssignLoading(false);
        }
      });
    return () => ac.abort();
  }, [assignOpen, assignQDebounced, showAssignment]);

  const assignItems = useMemo(() => {
    const list = assignRows.map((a) => ({ id: a.id, label: a.label }));
    if (
      shipmentSelected?.assignment_id &&
      assignmentLabel &&
      !list.some((x) => x.id === shipmentSelected.assignment_id)
    ) {
      return [{ id: shipmentSelected.assignment_id, label: assignmentLabel }, ...list];
    }
    return list;
  }, [assignRows, shipmentSelected?.assignment_id, assignmentLabel]);

  const assignTrigger = shipmentSelected?.assignment_id
    ? assignItems.find((x) => x.id === shipmentSelected.assignment_id)?.label ||
      assignmentLabel ||
      shipmentSelected.assignment_id
    : '';

  const setStatus = (status: ShipmentStatus) => {
    setShipmentSelected((s) =>
      s
        ? {
            ...s,
            status,
            assignment_id: status === 'OPEN' ? null : s.assignment_id,
          }
        : s,
    );
    if (status === 'OPEN') {
      setAssignmentLabel('');
    }
  };

  const onAssignOpenChange = (open: boolean) => {
    setAssignOpen(open);
    if (open) {
      setAssignQ('');
      setAssignQDebounced('');
    }
  };

  const save = async () => {
    if (!shipmentSelected) {
      return;
    }
    if (shipmentSelected.status !== 'OPEN' && !shipmentSelected.assignment_id) {
      alert('Please select an assignment');
      return;
    }
    setSaving(true);
    try {
      await updateShipment(shipmentSelected.id, shipmentSelected);
      await queryClient.invalidateQueries({ queryKey: ['shipments'] });
      setShipmentSelectedId('');
    } finally {
      setSaving(false);
    }
  };

  if (!shipmentSelectedId || !shipmentSelected) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
        <div className="block">
          <div className="text-lg font-bold">{shipmentSelected.label}</div>
          <div>{shipmentSelected.client_name}</div>
        </div>
        <div>{shipmentSelected.status}</div>
      </div>
      <div className="flex">
        <div className="flex-1">
          <label htmlFor="warehouse_id">Warehouse ID</label>
          <div className="text-sm text-gray-500">{shipmentSelected.warehouse_id}</div>
        </div>
        <div className="flex-1">
          <label htmlFor="arrival_date">Arrival Date</label>
          <div className="text-sm text-gray-500">
            {dayjs(shipmentSelected.arrival_date).format('MMM D, YYYY')}
          </div>
        </div>
      </div>
      <div className="block">
        <label htmlFor="delivery_by_date">Delivery By Date</label>
        <input
          type="date"
          className="input-base"
          id="delivery_by_date"
          value={dayjs(shipmentSelected.delivery_by_date).format('YYYY-MM-DD')}
          onChange={(e) => {
            const date = dayjs(e.target.value);
            if (date.isValid()) {
              setShipmentSelected((s) => (s ? { ...s, delivery_by_date: date.toISOString() } : s));
            }
          }}
        />
      </div>
      <div className="block">
        <label htmlFor="">Location</label>
        <div className="flex gap-3">
          <div className="flex-1">
            <input type="text" className="input-base" readOnly value={shipmentSelected.lat} />
          </div>
          <div className="flex-1">
            <input type="text" className="input-base" readOnly value={shipmentSelected.lng} />
          </div>
        </div>
      </div>
      <div className="block bg-gray-100 p-3">
        <div className="block">
          <p className="field-label">Status</p>
          <select
            className="input-base"
            value={shipmentSelected.status}
            onChange={(e) => setStatus(e.target.value as ShipmentStatus)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        {showAssignment && (
          <div className="mt-3 block">
            <p className="field-label">Assignment ID</p>
            <Dropdown
              open={assignOpen}
              onOpenChange={onAssignOpenChange}
              placeholder="— select assignment —"
              triggerLabel={assignTrigger}
              searchValue={assignQ}
              onSearchChange={setAssignQ}
              items={assignItems}
              loading={assignLoading}
              hasMore={false}
              onSelectItem={(item) => {
                setShipmentSelected((s) => (s ? { ...s, assignment_id: item.id } : s));
                setAssignmentLabel(item.label);
              }}
            />
          </div>
        )}
        <div className="mt-4">
          <button
            type="button"
            className="button-base disabled:opacity-50"
            disabled={saving}
            onClick={() => void save()}
          >
            {saving ? 'Saving…' : 'Save change'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShipmentDetail;
