import api from './index';
import type { Assignment, AssignmentsPageResponse } from '../types/assignment';

export const getAssignments = async (
  page: number,
  perPage: number,
  options?: { search?: string; signal?: AbortSignal },
): Promise<AssignmentsPageResponse> => {
  const trimmed = options?.search?.trim() ?? '';
  const params: Record<string, string | number> = {
    _page: page,
    _per_page: perPage,
  };
  if (trimmed !== '') {
    params._where = JSON.stringify({
      label: { contains: trimmed },
    });
  }
  const response = await api.get<AssignmentsPageResponse>('/assignments', {
    params,
    signal: options?.signal,
  });
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
