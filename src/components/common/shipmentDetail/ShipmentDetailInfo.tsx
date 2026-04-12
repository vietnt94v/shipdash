import dayjs from 'dayjs';
import type { Shipment, ShipmentStatus } from '../../../types/shipment';
import Badge from '../../ui/Badge';
import Button from '../../ui/Button';
import Dropdown from '../../ui/Dropdown';
import Input from '../../ui/Input';
import Modal from '../../ui/Modal';
import Select from '../../ui/Select';
import { STATUSES } from './constants';

type AssignItem = { id: string; label: string };

type AssignmentPickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchValue: string;
  onSearchChange: (q: string) => void;
  items: AssignItem[];
  loading: boolean;
  triggerLabel: string;
  onSelect: (item: AssignItem) => void;
};

type ShipmentDetailInfoProps = {
  draft: Shipment;
  patchDraft: (patch: Partial<Shipment>) => void;
  canDeleteShipment: boolean;
  deleting: boolean;
  onDeleteClick: () => void;
  deleteConfirmOpen: boolean;
  onCloseDeleteModal: () => void;
  onConfirmDelete: () => void;
  showAssignment: boolean;
  assignmentPicker: AssignmentPickerProps;
  saving: boolean;
  onStatusChange: (status: ShipmentStatus) => void;
  onSave: () => void;
};

const ShipmentDetailInfo = ({
  draft,
  patchDraft,
  canDeleteShipment,
  deleting,
  onDeleteClick,
  deleteConfirmOpen,
  onCloseDeleteModal,
  onConfirmDelete,
  showAssignment,
  assignmentPicker,
  saving,
  onStatusChange,
  onSave,
}: ShipmentDetailInfoProps) => {
  const ap = assignmentPicker;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
        <div className="block">
          <div className="text-2xl font-bold font-mono">{draft.label}</div>
          <div className="text-sm text-gray-500">{draft.client_name}</div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={
              draft.status === 'OPEN'
                ? 'primary'
                : draft.status === 'IN_TRANSIT'
                  ? 'warning'
                  : 'success'
            }
            hasAnchor
          >
            {draft.status.replace('_', ' ')}
          </Badge>
          <div className="flex flex-col items-end gap-1 shrink-0 max-w-48">
            <span
              className="inline-block"
              title={
                !canDeleteShipment
                  ? 'Only shipments with status OPEN can be deleted.'
                  : undefined
              }
            >
              <Button
                variant="danger"
                outline
                disabled={deleting || !canDeleteShipment}
                onClick={onDeleteClick}
              >
                Delete
              </Button>
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            label="Warehouse ID"
            id="warehouse_id"
            readOnly
            value={draft.warehouse_id}
            onChange={() => {}}
          />
        </div>
        <div className="flex-1">
          <Input
            label="Arrival Date"
            id="arrival_date"
            readOnly
            value={dayjs(draft.arrival_date).format('MMM D, YYYY')}
            onChange={() => {}}
          />
        </div>
      </div>
      <div className="block">
        <Input
          label="Delivery By Date"
          id="delivery_by_date"
          type="date"
          value={dayjs(draft.delivery_by_date).format('YYYY-MM-DD')}
          onChange={(value) => patchDraft({ delivery_by_date: value })}
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            label="Latitude"
            id="lat"
            type="number"
            value={draft.lat.toString()}
            onChange={(value) =>
              patchDraft({ lat: parseFloat(value) })
            }
          />
        </div>
        <div className="flex-1">
          <Input
            label="Longitude"
            id="lng"
            type="number"
            value={draft.lng.toString()}
            onChange={(value) =>
              patchDraft({ lng: parseFloat(value) })
            }
          />
        </div>
      </div>

      <div className="block bg-gray-100 p-3 rounded-md">
        <div className="block">
          <label htmlFor="status" className="field-label">
            Status
          </label>
          <Select
            value={draft.status}
            onChange={(value) => onStatusChange(value as ShipmentStatus)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </Select>
        </div>
        {showAssignment && (
          <div className="mt-3 block">
            <p className="field-label">Assignment ID</p>
            <Dropdown
              open={ap.open}
              onOpenChange={ap.onOpenChange}
              placeholder="— select assignment —"
              triggerLabel={ap.triggerLabel}
              searchValue={ap.searchValue}
              onSearchChange={ap.onSearchChange}
              items={ap.items}
              loading={ap.loading}
              hasMore={false}
              onSelectItem={ap.onSelect}
            />
          </div>
        )}
        <div className="mt-4">
          <Button disabled={saving} onClick={onSave}>
            {saving ? 'Saving…' : 'Save change'}
          </Button>
        </div>
      </div>

      <Modal open={deleteConfirmOpen} onClose={onCloseDeleteModal} hideCloseButton>
        <div>
          <h3 className="font-semibold text-lg">Delete this shipment?</h3>
          <p className="text-sm text-gray-600 mt-2">
            This will remove{' '}
            <span className="font-mono">{draft.label}</span>. This cannot be
            undone.
          </p>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="secondary" size="sm" outline onClick={onCloseDeleteModal}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={onConfirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ShipmentDetailInfo;
