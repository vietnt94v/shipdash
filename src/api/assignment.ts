import api from './index';
import type { Assignment } from '../types/assignment';

export const getAssignments = async (page: number, page_size: number) => {
  const response = await api.get(`/assignments?_page=${page}&_per_page=${page_size}`);
  return response.data;
};

export const getAssignmentById = async (id: string) => {
  const response = await api.get(`/assignments/${id}`);
  return response.data;
};

export const createAssignment = async (assignment: Assignment) => {
  const response = await api.post('/assignments', assignment);
  return response.data;
};

export const updateAssignment = async (id: string, assignment: Assignment) => {
  const response = await api.put(`/assignments/${id}`, assignment);
  return response.data;
};

export const deleteAssignment = async (id: string) => {
  const response = await api.delete(`/assignments/${id}`);
  return response.data;
};
