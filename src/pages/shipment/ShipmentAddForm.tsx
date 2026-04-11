import { useState } from 'react';
import { createShipment } from '../../api/shipment';
import dayjs from 'dayjs';

const ShipmentAddForm = ({ onClose }: { onClose: () => void }) => {
  const [form, setForm] = useState({
    client_name: '',
    label: '',
    warehouse_id: '581',
  });

  const handleAddNewShipment = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.client_name.trim() || !form.label.trim()) return;

    try {
      const now = dayjs().toISOString();
      await createShipment({
        client_name: form.client_name.trim(),
        label: form.label.trim(),
        warehouse_id: form.warehouse_id || '581',
        status: 'OPEN',
        assignment_id: null,
        arrival_date: now,
        delivery_by_date: dayjs().add(2, 'day').toISOString(),
        eta: dayjs().add(1, 'day').toISOString(),
        lat: 32.55 + Math.random() * 0.5,
        lng: -97.4 + Math.random() * 0.9,
        id: `shp_${Math.random().toString(36).substring(2, 15)}`,
      });
      setForm({ client_name: '', label: '', warehouse_id: '581' });
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <form onSubmit={handleAddNewShipment}>
        <div className="flex flex-col gap-2 p-3">
          <input
            placeholder="Client name"
            value={form.client_name}
            onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))}
            className="input-base"
            autoFocus
          />
          <input
            placeholder="Label e.g. LAX-581-001"
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            className="input-base"
          />
          <input
            placeholder="Warehouse ID"
            value={form.warehouse_id}
            onChange={(e) => setForm((f) => ({ ...f, warehouse_id: e.target.value }))}
            className="input-base"
          />
          <button type="submit" className="button-base">
            Create shipment
          </button>
        </div>
      </form>
    </>
  );
};

export default ShipmentAddForm;
