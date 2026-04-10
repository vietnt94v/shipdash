import { useEffect, useState } from 'react';
import { useShipmentStore } from '../../store';
import { getShipmentById } from '../../api/shipment';
import type { Shipment } from '../../types/shipment';
import dayjs from 'dayjs';

const ShipmentDetail = () => {
  const { shipmentSelectedId } = useShipmentStore();
  const [shipment, setShipment] = useState<Shipment | null>(null);

  useEffect(() => {
    if (shipmentSelectedId) {
      getShipmentById(shipmentSelectedId).then((data) => {
        setShipment(data);
      });
    }
  }, [shipmentSelectedId]);

  return (
    <>
      <h1>Shipment {shipmentSelectedId}</h1>
      {shipment && (
        <div>
          <div>{shipment.client_name}</div>
          <div>{shipment.label}</div>
          <div>{shipment.status}</div>
          <div>{dayjs(shipment.arrival_date).format('MMM D, YYYY')}</div>
          <div>{dayjs(shipment.delivery_by_date).format('MMM D, YYYY')}</div>
          <div>{shipment.warehouse_id}</div>
          <div>{shipment.assignment_id}</div>
        </div>
      )}
    </>
  );
};

export default ShipmentDetail;
