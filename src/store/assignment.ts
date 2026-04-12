import { create } from 'zustand';

interface AssignmentStoreType {
  assignmentSelectedId: string;
  setAssignmentSelectedId: (assignmentSelectedId: string) => void;
}

export const useAssignmentStore = create<AssignmentStoreType>((set) => ({
  assignmentSelectedId: '',
  setAssignmentSelectedId: (assignmentSelectedId: string) =>
    set({ assignmentSelectedId }),
}));
