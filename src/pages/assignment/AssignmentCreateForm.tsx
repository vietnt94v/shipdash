import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createAssignment } from '../../api/assignment';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

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
      <div className="flex flex-col border-b border-gray-300 gap-2 p-3">
        <Input
          placeholder="Label e.g. TX-999"
          size="sm"
          value={label}
          onChange={(value) => setLabel(value)}
          autoFocus
        />
        <Button size="sm" disabled={saving}>
          {saving ? 'Creating…' : 'Create assignment'}
        </Button>
      </div>
    </form>
  );
};

export default AssignmentCreateForm;
