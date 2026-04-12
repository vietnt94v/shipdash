import { useShipmentStore } from '../../../store';
import ShipmentDetailInfo from './ShipmentDetailInfo';
import ShipmentDetailRoute from './ShipmentDetailRoute';
import type { ShipmentDetailProps } from './types';
import { useShipmentDetail } from './useShipmentDetail';

export type { ShipmentDetailProps } from './types';

type ShipmentDetailInnerProps = ShipmentDetailProps & {
  effectiveId: string;
};

const ShipmentDetailInner = ({
  effectiveId,
  routeShipments,
  routeShipmentsPending,
  assignmentContext,
}: ShipmentDetailInnerProps) => {
  const {
    ready,
    draft,
    patchDraft,
    assignmentPicker,
    showAssignment,
    saving,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    deleting,
    canDeleteShipment,
    setStatus,
    save,
    onDeleteClick,
    onConfirmDelete,
  } = useShipmentDetail({ effectiveId, assignmentContext });

  if (!ready || !draft) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 p-3">
      <ShipmentDetailInfo
        draft={draft}
        patchDraft={patchDraft}
        canDeleteShipment={canDeleteShipment}
        deleting={deleting}
        onDeleteClick={onDeleteClick}
        deleteConfirmOpen={deleteConfirmOpen}
        onCloseDeleteModal={() => setDeleteConfirmOpen(false)}
        onConfirmDelete={() => void onConfirmDelete()}
        showAssignment={showAssignment}
        assignmentPicker={assignmentPicker}
        saving={saving}
        onStatusChange={setStatus}
        onSave={() => void save()}
      />
      <ShipmentDetailRoute
        assignmentContext={assignmentContext}
        routeShipmentsPending={routeShipmentsPending}
        routeShipments={routeShipments}
        shipment={draft}
      />
    </div>
  );
};

const ShipmentDetail = ({
  shipmentIdOverride,
  routeShipments,
  routeShipmentsPending,
  assignmentContext,
}: ShipmentDetailProps = {}) => {
  const { shipmentSelectedId } = useShipmentStore();
  const effectiveId =
    shipmentIdOverride !== undefined ? shipmentIdOverride : shipmentSelectedId;

  if (!effectiveId) {
    return null;
  }

  return (
    <ShipmentDetailInner
      key={effectiveId}
      effectiveId={effectiveId}
      routeShipments={routeShipments}
      routeShipmentsPending={routeShipmentsPending}
      assignmentContext={assignmentContext}
    />
  );
};

export default ShipmentDetail;
