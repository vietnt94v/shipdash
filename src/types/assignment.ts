export type AssignmentStatus = 'OPEN' | 'IN_TRANSIT' | 'DELIVERED';

export interface Assignment {
  id: string;
  label: string;
  status: AssignmentStatus;
  clients: string[];
  shipment_count: number;
}

export interface AssignmentsPageResponse {
  data: Assignment[];
  first: number;
  prev: number | null;
  next: number | null;
  last: number;
  pages: number;
  items: number;
}
