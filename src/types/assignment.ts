export type AssignmentStatus = 'OPEN' | 'IN_TRANSIT' | 'DELIVERED';

export interface Assignment {
  id: string;
  label: string;
  status: AssignmentStatus;
  clients: string[];
  shipment_count: number;
}
