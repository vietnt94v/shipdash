import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createAssignment } from '../../api/assignment';

const AssignmentCreateForm = ({ onClose }: { onClose: () => void }) => {
  const queryClient = useQueryClient();
  const [label, setLabel] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed || saving) {
      return;
    }
    setSaving(true);
    try {
      await createAssignment({
        id: `as_${Math.random().toString(36).substring(2, 12)}`,
        label: trimmed,
        status: 'OPEN',
        clients: [],
        shipment_count: 0,
      });
      setLabel('');
      await queryClient.invalidateQueries({ queryKey: ['assignments'] });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)}>
      <div className="flex flex-col gap-2 p-3">
        <input
          className="input-base w-full"
          placeholder="Label e.g. TX-999"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          autoFocus
        />
        <button type="submit" className="button-base" disabled={saving}>
          {saving ? 'Creating…' : 'Create assignment'}
        </button>
      </div>
    </form>
  );
};

export default AssignmentCreateForm;
