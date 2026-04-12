import { useState } from 'react';
import ShipmentAddForm from './ShipmentAddForm';
import ShipmentList from './ShipmentList';
import ShipmentDetail from '../../components/common/ShipmentDetail';
import Button from '../../components/ui/Button';

const Shipments = () => {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <>
      <div className="flex flex-1">
        <div className="sticky top-(--header-height) max-h-[calc(100vh-(var(--header-height)))] w-90 shrink-0 p-3">
          <div className="flex flex-col justify-baseline border border-gray-300 h-full rounded-md overflow-hidden">
            <div className="flex justify-between items-center px-3 py-2 border-b border-gray-300 bg-gray-200">
              <h1>Shipment</h1>
              <Button size="sm" onClick={() => setShowAddForm((prev) => !prev)}>
                {showAddForm ? 'Cancel' : 'New'}
              </Button>
            </div>
            {showAddForm && <ShipmentAddForm onClose={() => setShowAddForm(false)} />}
            <ShipmentList />
          </div>
        </div>
        <div className="flex-1">
          <ShipmentDetail />
        </div>
      </div>
    </>
  );
};

export default Shipments;
