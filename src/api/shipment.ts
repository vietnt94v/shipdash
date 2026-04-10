import api from './index';
import type { Shipment, ShipmentStatus } from '../types/shipment';

export const getShipments = async (status: ShipmentStatus, page: number, page_size: number) => {
  const response = await api.get('/shipments', {
    params: {
      status,
      _page: page,
      _per_page: page_size,
    },
  });
  return response.data;
};

export const searchShipments = async (
  status: ShipmentStatus,
  page: number,
  page_size: number,
  search: string,
) => {
  const trimmed = search.trim();
  const where =
    trimmed === ''
      ? { status: { eq: status } }
      : {
          status: { eq: status },
          or: [
            { label: { contains: trimmed } },
            { client_name: { contains: trimmed } },
          ],
        };
  const response = await api.get('/shipments', {
    params: {
      _where: JSON.stringify(where),
      _page: page,
      _per_page: page_size,
    },
  });
  return response.data;
};
export const getShipmentById = async (id: string) => {
  const response = await api.get(`/shipments/${id}`);
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
