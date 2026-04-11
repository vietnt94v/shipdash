import { useState } from 'react';
import ShipmentAddForm from './ShipmentAddForm';
import ShipmentList from './ShipmentList';
import ShipmentDetail from '../../components/common/ShipmentDetail';

const Shipments = () => {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <>
      <div className="flex flex-1">
        <div className="sticky top-(--header-height) max-h-[calc(100vh-(var(--header-height)))] w-90 shrink-0 flex flex-col gap-3 border-r border-gray-500 ">
          <button
            type="button"
            className="button-base shrink-0"
            onClick={() => setShowAddForm((prev) => !prev)}
          >
            {showAddForm ? 'Cancel' : 'New'}
          </button>
          {showAddForm && <ShipmentAddForm onClose={() => setShowAddForm(false)} />}
          <ShipmentList />
        </div>
        <div className="flex-1">
          <ShipmentDetail />
        </div>
      </div>
    </>
  );
};

export default Shipments;
