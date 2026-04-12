import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useShipmentStore } from '../../store';
import { getShipmentById, updateShipment, deleteShipment } from '../../api/shipment';
import type { Shipment, ShipmentStatus } from '../../types/shipment';
import { getAssignments as fetchAssignments, getAssignmentById } from '../../api/assignment';
import type { Assignment } from '../../types/assignment';
import Dropdown from '../ui/Dropdown';
import ShipmentRouteMap from './ShipmentRouteMap';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import Select from '../ui/Select';

const STATUSES: ShipmentStatus[] = ['OPEN', 'IN_TRANSIT', 'DELIVERED'];
const ASSIGN_LIST_SIZE = 100;

export type ShipmentDetailProps = {
  shipmentIdOverride?: string;
  routeShipments?: Shipment[];
  routeShipmentsPending?: boolean;
  assignmentContext?: boolean;
};

const ShipmentDetail = ({
  shipmentIdOverride,
  routeShipments,
  routeShipmentsPending,
  assignmentContext,
}: ShipmentDetailProps = {}) => {
  const queryClient = useQueryClient();
  const { shipmentSelectedId, setShipmentSelectedId } = useShipmentStore();
  const effectiveId = shipmentIdOverride !== undefined ? shipmentIdOverride : shipmentSelectedId;
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
    if (!effectiveId) {
      setShipmentSelected(null);
      return;
    }
    getShipmentById(effectiveId).then((data) => {
      setShipmentSelected(data);
      if (data.assignment_id && data.status !== 'OPEN') {
        getAssignmentById(data.assignment_id)
          .then((a) => setAssignmentLabel(a.label))
          .catch(() => setAssignmentLabel(data.assignment_id ?? ''));
      } else {
        setAssignmentLabel('');
      }
    });
  }, [effectiveId]);

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
      if (assignmentContext) {
        await queryClient.invalidateQueries({ queryKey: ['assignments'] });
        await queryClient.invalidateQueries({ queryKey: ['assignment'] });
        await queryClient.invalidateQueries({
          queryKey: ['shipments', 'byAssignment'],
        });
        const aid = shipmentSelected.assignment_id;
        if (aid) {
          await queryClient.invalidateQueries({
            queryKey: ['assignmentRoute', aid],
          });
        }
      }
      setShipmentSelectedId('');
    } finally {
      setSaving(false);
    }
  };

  const onDeleteShipment = async (id: string) => {
    if (!id) {
      return;
    }
    if (confirm('Are you sure you want to delete this shipment?')) {
      await deleteShipment(id);
      await queryClient.invalidateQueries({ queryKey: ['shipments'] });
      if (assignmentContext) {
        await queryClient.invalidateQueries({ queryKey: ['assignments'] });
        await queryClient.invalidateQueries({ queryKey: ['assignment'] });
        await queryClient.invalidateQueries({
          queryKey: ['shipments', 'byAssignment'],
        });
        const aid = shipmentSelected?.assignment_id;
        if (aid) {
          await queryClient.invalidateQueries({
            queryKey: ['assignmentRoute', aid],
          });
        }
      }
      setShipmentSelectedId('');
    }
  };

  if (!effectiveId || !shipmentSelected) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
        <div className="block">
          <div className="text-2xl font-bold font-mono">{shipmentSelected.label}</div>
          <div className="text-sm text-gray-500">{shipmentSelected.client_name}</div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success" hasAnchor>
            {shipmentSelected.status}
          </Badge>
          <Button variant="danger" onClick={() => onDeleteShipment(shipmentSelected.id)}>
            Delete
          </Button>
        </div>
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            label="Warehouse ID"
            id="warehouse_id"
            readOnly
            value={shipmentSelected.warehouse_id}
            onChange={() => {}}
          />
        </div>
        <div className="flex-1">
          <Input
            label="Arrival Date"
            id="arrival_date"
            readOnly
            value={dayjs(shipmentSelected.arrival_date).format('MMM D, YYYY')}
            onChange={() => {}}
          />
        </div>
      </div>
      <div className="block">
        <Input
          label="Delivery By Date"
          id="delivery_by_date"
          type="date"
          value={dayjs(shipmentSelected.delivery_by_date).format('YYYY-MM-DD')}
          onChange={(value) =>
            setShipmentSelected((s) => (s ? { ...s, delivery_by_date: value } : s))
          }
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            label="Latitude"
            id="lat"
            type="number"
            value={shipmentSelected.lat.toString()}
            onChange={(value) =>
              setShipmentSelected((s) => (s ? { ...s, lat: parseFloat(value) } : s))
            }
          />
        </div>
        <div className="flex-1">
          <Input
            label="Longitude"
            id="lng"
            type="number"
            value={shipmentSelected.lng.toString()}
            onChange={(value) =>
              setShipmentSelected((s) => (s ? { ...s, lng: parseFloat(value) } : s))
            }
          />
        </div>
      </div>
      <div className="block bg-gray-100 p-3 rounded-md">
        <div className="block">
          <label htmlFor="status" className="field-label">
            Status
          </label>
          <Select
            value={shipmentSelected.status}
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
          <Button
            disabled={saving}
            onClick={() => void save()}
          >
            {saving ? 'Saving…' : 'Save change'}
          </Button>
        </div>
      </div>
      {assignmentContext ? (
        routeShipmentsPending ? (
          <div className="text-sm text-gray-500 p-2">Loading route…</div>
        ) : (
          <ShipmentRouteMap
            shipments={routeShipments ?? []}
            selectedShipmentId={shipmentSelected.id}
          />
        )
      ) : (
        <ShipmentRouteMap shipments={[shipmentSelected]} selectedShipmentId={shipmentSelected.id} />
      )}
    </div>
  );
};

export default ShipmentDetail;
