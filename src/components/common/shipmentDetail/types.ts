import type { Shipment } from '../../../types/shipment';

export type ShipmentDetailProps = {
  shipmentIdOverride?: string;
  routeShipments?: Shipment[];
  routeShipmentsPending?: boolean;
  assignmentContext?: boolean;
};
