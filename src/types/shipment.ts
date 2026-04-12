export type ShipmentStatus = 'OPEN' | 'IN_TRANSIT' | 'DELIVERED';

export interface Shipment {
  id: string;
  client_name: string;
  label: string;
  status: ShipmentStatus;
  arrival_date: string;
  delivery_by_date: string;
  eta: string;
  warehouse_id: string;
  assignment_id: string | null;
  assignment_label: string | null;
  lat: number;
  lng: number;
}

export interface ShipmentsPageResponse {
  data: Shipment[];
  first: number;
  prev: number | null;
  next: number | null;
  last: number;
  pages: number;
  items: number;
}
