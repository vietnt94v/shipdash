import { useEffect, useState } from 'react';
import type { Shipment, ShipmentStatus } from '../../types/shipment';
import { getShipments, searchShipments } from '../../api/shipment';
import { useShipmentStore } from '../../store';
import dayjs from 'dayjs';

const STATUS_ORDER: ShipmentStatus[] = ['OPEN', 'IN_TRANSIT', 'DELIVERED'];

const ShipmentList = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [status, setStatus] = useState<ShipmentStatus>('OPEN');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchShipmentQuery, setSearchShipmentQuery] = useState<string>('');
  const { shipmentSelectedId, setShipmentSelectedId } = useShipmentStore();

  const handleSelectShipment = (shipmentId: string) => {
    setShipmentSelectedId(shipmentId);
  };

  const handleChangeSearchShipment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;

    setSearchShipmentQuery(searchValue);
    searchShipments(status, page, pageSize, searchValue.trim().toLowerCase()).then((data) => {
      setShipments(data.data);
    });
  };

  useEffect(() => {
    getShipments(status, page, pageSize).then((data) => {
      setShipments(data.data);
    });
  }, [status, page, pageSize]);

  return (
    <>
      <div className="flex justify-between items-center gap-3">
        <h1>Shipments</h1>
        <button className="button-base shrink-0">+ New Shipment</button>
      </div>
      {/* search */}
      <div>
        <input
          type="text"
          placeholder="Search"
          className="input-base"
          value={searchShipmentQuery}
          onChange={handleChangeSearchShipment}
        />
      </div>
      <div className="flex justify-between items-center">
        {STATUS_ORDER.map((status) => (
          <div
            key={status}
            onClick={() => setStatus(status)}
            className={`cursor-pointer p-2 rounded-md transition-colors hover:bg-gray-100 ${status === status ? 'bg-gray-300' : ''}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        ))}
      </div>
      {/* list shipments */}
      <div className="flex flex-col gap-2">
        {shipments.map((shipment) => (
          <div
            key={shipment.id}
            onClick={() => handleSelectShipment(shipment.id)}
            className={`cursor-pointer border border-gray-200 hover:bg-gray-100 p-2 rounded-md ${
              shipmentSelectedId === shipment.id ? 'bg-gray-300' : ''
            }`}
          >
            <div>{shipment.client_name}</div>
            <div>{shipment.label}</div>
            <div>{dayjs(shipment.arrival_date).format('MMM D, YYYY')}</div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ShipmentList;
