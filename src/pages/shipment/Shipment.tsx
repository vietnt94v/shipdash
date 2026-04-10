import ShipmentList from './ShipmentList';
import ShipmentDetail from '../../components/common/ShipmentDetail';

const Shipments = () => {
  return (
    <>
      <div className="flex h-full gap-3 p-3">
        <div className="w-90 shrink-0 flex flex-col gap-3 border border-gray-200 rounded-md p-3">
          <ShipmentList />
        </div>
        <div className="flex-1 border border-gray-200 rounded-md p-3">
          <ShipmentDetail />
        </div>
      </div>
    </>
  );
};

export default Shipments;
