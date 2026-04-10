import api from './index';
import type { Shipment } from '../types/shipment';

export const getShipments = async (page: number, page_size: number) => {
  const response = await api.get(`/shipments?_page=${page}&_per_page=${page_size}`);
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
