import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AssignmentList from './AssignmentList';
import AssignmentCreateForm from './AssignmentCreateForm';
import AssignmentDetailPanel from './AssignmentDetailPanel';
import ShipmentDetail from '../../components/common/ShipmentDetail';
import { getAllShipmentsByAssignmentId } from '../../api/shipment';
import { useAssignmentStore, useShipmentStore } from '../../store';

const Assignment = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { assignmentSelectedId } = useAssignmentStore();
  const { shipmentSelectedId } = useShipmentStore();

  const { data: routeShipments, isPending: routeShipmentsPending } = useQuery({
    queryKey: ['assignmentRoute', assignmentSelectedId],
    queryFn: ({ signal }) =>
      getAllShipmentsByAssignmentId(assignmentSelectedId, signal),
    enabled: !!assignmentSelectedId,
  });

  return (
    <div className="flex flex-1">
      <div className="sticky top-(--header-height) max-h-[calc(100vh-(var(--header-height)))] w-90 shrink-0 flex flex-col gap-3 border-r border-gray-500 p-3 min-h-0">
        <button
          type="button"
          className="button-base shrink-0"
          onClick={() => setShowCreateForm((prev) => !prev)}
        >
          {showCreateForm ? 'Cancel' : 'New'}
        </button>
        {showCreateForm && (
          <AssignmentCreateForm onClose={() => setShowCreateForm(false)} />
        )}
        <AssignmentList />
      </div>
      <div className="sticky top-(--header-height) max-h-[calc(100vh-(var(--header-height)))] w-96 shrink-0 flex flex-col gap-3 border-r border-gray-500 p-3 min-h-0">
        <AssignmentDetailPanel />
      </div>
      <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-auto">
        {assignmentSelectedId && shipmentSelectedId ? (
          <ShipmentDetail
            routeShipments={routeShipments}
            routeShipmentsPending={routeShipmentsPending}
            assignmentContext
          />
        ) : (
          <div className="text-gray-500 text-sm p-4">
            {assignmentSelectedId
              ? 'Select a shipment to view details.'
              : 'Select an assignment and a shipment.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Assignment;
