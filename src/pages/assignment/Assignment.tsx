import AssignmentList from './AssignmentList';

const Assignment = () => {
  return (
    <>
      <div className="flex h-full gap-3 p-3">
        <div className="w-64 flex-shrink-0 flex flex-col gap-3 border border-gray-200 rounded-md p-3">
          <AssignmentList />
        </div>
        <div className="w-64 flex-shrink-0 flex flex-col gap-3 border border-gray-200 rounded-md p-3">
          Assignment details
        </div>
        <div className="flex-1 border border-gray-200 rounded-md p-3">Shipments details</div>
      </div>
    </>
  );
};

export default Assignment;
