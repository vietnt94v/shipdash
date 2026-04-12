import api from './index';
import type { Shipment, ShipmentStatus, ShipmentsPageResponse } from '../types/shipment';

export const getShipments = async (
  status: ShipmentStatus,
  page: number,
  page_size: number,
  signal?: AbortSignal,
): Promise<ShipmentsPageResponse> => {
  const response = await api.get<ShipmentsPageResponse>('/shipments', {
    params: {
      status,
      _page: page,
      _per_page: page_size,
    },
    signal,
  });
  return response.data;
};

export const searchShipments = async (
  status: ShipmentStatus,
  page: number,
  page_size: number,
  search: string,
  signal?: AbortSignal,
): Promise<ShipmentsPageResponse> => {
  const trimmed = search.trim();
  const where =
    trimmed === ''
      ? { status: { eq: status } }
      : {
          status: { eq: status },
          or: [{ label: { contains: trimmed } }, { client_name: { contains: trimmed } }],
        };
  const response = await api.get<ShipmentsPageResponse>('/shipments', {
    params: {
      _where: JSON.stringify(where),
      _page: page,
      _per_page: page_size,
    },
    signal,
  });
  return response.data;
};

export const getShipmentById = async (id: string, signal?: AbortSignal) => {
  const response = await api.get(`/shipments/${id}`, { signal });
  return response.data;
};

export const createShipment = async (shipment: Shipment) => {
  const response = await api.post('/shipments', shipment);
  return response.data;
};

export const updateShipment = async (id: string, shipment: Shipment) => {
  const response = await api.put(`/shipments/${id}`, shipment);
  return response.data;
};

export const deleteShipment = async (id: string) => {
  const response = await api.delete(`/shipments/${id}`);
  return response.data;
};

const MAP_FETCH_PER_PAGE = 500;

export const getShipmentsByAssignmentId = async (
  assignmentId: string,
  page: number,
  pageSize: number,
  signal?: AbortSignal,
): Promise<ShipmentsPageResponse> => {
  const response = await api.get<ShipmentsPageResponse>('/shipments', {
    params: {
      _where: JSON.stringify({ assignment_id: { eq: assignmentId } }),
      _page: page,
      _per_page: pageSize,
    },
    signal,
  });
  return response.data;
};

export const getAllShipmentsByAssignmentId = async (
  assignmentId: string,
  signal?: AbortSignal,
): Promise<Shipment[]> => {
  const acc: Shipment[] = [];
  let page = 1;
  for (;;) {
    const res = await getShipmentsByAssignmentId(
      assignmentId,
      page,
      MAP_FETCH_PER_PAGE,
      signal,
    );
    acc.push(...res.data);
    if (!res.next) {
      break;
    }
    page = res.next;
  }
  return acc;
};
