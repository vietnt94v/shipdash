import api from './index';
import type {
  Assignment,
  AssignmentStatus,
  AssignmentsPageResponse,
} from '../types/assignment';

export const getAssignments = async (
  page: number,
  perPage: number,
  options?: {
    search?: string;
    status?: AssignmentStatus;
    signal?: AbortSignal;
  },
): Promise<AssignmentsPageResponse> => {
  const trimmed = options?.search?.trim() ?? '';
  const status = options?.status;
  const params: Record<string, string | number> = {
    _page: page,
    _per_page: perPage,
  };
  const where: Record<string, unknown> = {};
  if (status) {
    where.status = { eq: status };
  }
  if (trimmed !== '') {
    where.label = { contains: trimmed };
  }
  if (Object.keys(where).length > 0) {
    params._where = JSON.stringify(where);
  }
  const response = await api.get<AssignmentsPageResponse>('/assignments', {
    params,
    signal: options?.signal,
  });
  return response.data;
};

export const getAssignmentById = async (id: string, signal?: AbortSignal) => {
  const response = await api.get(`/assignments/${id}`, { signal });
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
