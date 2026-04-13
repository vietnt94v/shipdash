import { useState } from 'react';
import dayjs from 'dayjs';
import { createShipment } from '../../api/shipment';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ShipmentAddForm = ({ onClose }: { onClose: () => void }) => {
  const [form, setForm] = useState({
    client_name: '',
    label: '',
    warehouse_id: '581',
  });
  const [validationError, setValidationError] = useState('');

  const handleAddNewShipment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !form.client_name.trim() ||
      !form.label.trim() ||
      !form.warehouse_id.trim()
    ) {
      setValidationError(
        'Please fill in Client name, Label, and Warehouse ID.',
      );
      return;
    }
    setValidationError('');

    try {
      const now = dayjs().toISOString();
      await createShipment({
        client_name: form.client_name.trim(),
        label: form.label.trim(),
        warehouse_id: form.warehouse_id || '581',
        status: 'OPEN',
        assignment_id: null,
        assignment_label: null,
        arrival_date: now,
        delivery_by_date: dayjs().add(2, 'day').toISOString(),
        eta: dayjs().add(1, 'day').toISOString(),
        lat: 32.55 + Math.random() * 0.5,
        lng: -97.4 + Math.random() * 0.9,
        id: `shp_${Math.random().toString(36).substring(2, 15)}`,
      });
      setForm({ client_name: '', label: '', warehouse_id: '581' });
      setValidationError('');
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <form onSubmit={handleAddNewShipment} className="border-b border-gray-300 bg-gray-200">
        <div className="flex flex-col gap-2 p-3">
          <Input
            placeholder="Client name"
            size="sm"
            autoFocus
            value={form.client_name}
            onChange={(value) => {
              setForm((f) => ({ ...f, client_name: value }));
              setValidationError('');
            }}
          />
          <Input
            placeholder="Label e.g. LAX-581-001"
            size="sm"
            value={form.label}
            onChange={(value) => {
              setForm((f) => ({ ...f, label: value }));
              setValidationError('');
            }}
          />
          <Input
            placeholder="Warehouse ID"
            size="sm"
            value={form.warehouse_id}
            onChange={(value) => {
              setForm((f) => ({ ...f, warehouse_id: value }));
              setValidationError('');
            }}
          />
          <Button size="sm">Create shipment</Button>
          {validationError ? (
            <p className="text-red-500 text-sm">{validationError}</p>
          ) : null}
        </div>
      </form>
    </>
  );
};

export default ShipmentAddForm;
