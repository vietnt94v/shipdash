import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useShipmentStore } from '../../store';
import { getShipmentById } from '../../api/shipment';
import type { Shipment } from '../../types/shipment';
import { getAssignments as getAssignmentsApi } from '../../api/assignment';
import type { Assignment } from '../../types/assignment';

const STATUSES = ['OPEN', 'IN_TRANSIT', 'DELIVERED'];

const ShipmentDetail = () => {
  const { shipmentSelectedId } = useShipmentStore();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const getAssignments = async () => {
    const response = await getAssignmentsApi(1, 100);
    setAssignments(response.data);
  };

  useEffect(() => {
    if (shipmentSelectedId) {
      getShipmentById(shipmentSelectedId).then((data) => {
        setShipment(data);
      });
    }
  }, [shipmentSelectedId]);

  return (
    <>
      {shipment && (
        <div className="flex flex-col gap-3 p-3">
          <div className="flex justify-between items-center border-b border-gray-200 pb-2">
            <div className="block">
              <div className="text-lg font-bold">{shipment.label}</div>
              <div>{shipment.client_name}</div>
            </div>
            <div>{shipment.status}</div>
          </div>
          <div className="flex">
            <div className="flex-1">
              <label htmlFor="warehouse_id">Warehouse ID</label>
              <div className="text-sm text-gray-500">{shipment.warehouse_id}</div>
            </div>
            <div className="flex-1">
              <label htmlFor="arrival_date">Arrival Date</label>
              <div className="text-sm text-gray-500">
                {dayjs(shipment.arrival_date).format('MMM D, YYYY')}
              </div>
            </div>
          </div>
          <div className="block">
            <label htmlFor="delivery_by_date">Delivery By Date</label>
            <input
              type="date"
              className="input-base"
              id="delivery_by_date"
              value={dayjs(shipment.delivery_by_date).format('YYYY-MM-DD')}
              onChange={(e) => {
                const date = dayjs(e.target.value);
                if (date.isValid()) {
                  setShipment((prev) => ({ ...prev, delivery_by_date: date.toISOString() }));
                }
              }}
            />
          </div>
          <div className="block">
            <label htmlFor="">Location</label>
            <div className="flex gap-3">
              <div className="flex-1">
                <input type="text" className="input-base" value={shipment.lat} />
              </div>
              <div className="flex-1">
                <input type="text" className="input-base" value={shipment.lng} />
              </div>
            </div>
          </div>
          <div className="block bg-gray-100 p-3">
            <div className="block">
              <p className="field-label">Update status</p>
              <select className="input-base" value={status}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="block">
              <p className="field-label">Update assignment</p>
              {shipment.status !== 'OPEN' && (
                <select className="input-base">
                  <option value="null">None</option>
                  {assignments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShipmentDetail;
