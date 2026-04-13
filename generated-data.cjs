const fs = require('fs');

const clients = ['Sony', 'Samsung', 'DHL', 'CargoTrans', 'ShipCo', 'Logix', 'Oceanic'];
const warehouses = ['EWR', 'LAX', 'JFK', 'SFO', 'SEA'];
const statusList = ['OPEN', 'IN_TRANSIT', 'DELIVERED'];

const baseDate = new Date();
const minLat = 32.55,
  maxLat = 33.05;
const minLng = -97.4,
  maxLng = -96.5;

// Assignments — only id, label, status, clients, shipment_count stored.
// clients[] and shipment_count are synced from shipments (Approach B).
// We seed them accurately here; after that, all mutations keep them in sync.
const assignmentDefs = [
  { id: 'as_001', label: 'TX-001', status: 'OPEN' },
  { id: 'as_002', label: 'TX-002', status: 'OPEN' },
  { id: 'as_003', label: 'LAX-A1', status: 'IN_TRANSIT' },
  { id: 'as_004', label: 'LAX-A2', status: 'IN_TRANSIT' },
  { id: 'as_005', label: 'EWR-B1', status: 'DELIVERED' },
];

const transitPool = assignmentDefs
  .filter((a) => a.status === 'IN_TRANSIT')
  .map((a) => a.id);
const deliveredPool = assignmentDefs
  .filter((a) => a.status === 'DELIVERED')
  .map((a) => a.id);

const assignmentLabelById = Object.fromEntries(
  assignmentDefs.map((a) => [a.id, a.label]),
);

const shipments = [];

for (let i = 1; i <= 100; i++) {
  const arrival = new Date(baseDate);
  arrival.setDate(arrival.getDate() - Math.floor(Math.random() * 10));
  const eta = new Date(arrival);
  eta.setHours(eta.getHours() + Math.floor(Math.random() * 48));

  const status = statusList[i % 3];
  let assignment_id = null;
  if (status === 'IN_TRANSIT') assignment_id = transitPool[i % transitPool.length];
  else if (status === 'DELIVERED') assignment_id = deliveredPool[0];

  shipments.push({
    id: `shp_${String(i).padStart(3, '0')}`,
    client_name: clients[i % clients.length],
    label: `${warehouses[i % warehouses.length]}-581-2505${20 + (i % 10)}-${i}`,
    status,
    arrival_date: arrival.toISOString(),
    delivery_by_date: new Date(arrival.getTime() + 2 * 86400000).toISOString(),
    eta: eta.toISOString(),
    warehouse_id: '581',
    assignment_id,
    assignment_label: assignment_id ? assignmentLabelById[assignment_id] : null,
    lat: Math.random() * (maxLat - minLat) + minLat,
    lng: Math.random() * (maxLng - minLng) + minLng,
  });
}

// Compute accurate clients + shipment_count for each assignment (Approach B seed)
const assignments = assignmentDefs.map((a) => {
  const linked = shipments.filter((s) => s.assignment_id === a.id);
  return {
    ...a,
    clients: [...new Set(linked.map((s) => s.client_name))],
    shipment_count: linked.length,
  };
});

fs.writeFileSync('db.json', JSON.stringify({ shipments, assignments }, null, 2));
console.log(`✅ Generated ${shipments.length} shipments, ${assignments.length} assignments`);
assignments.forEach((a) =>
  console.log(
    `   ${a.id}  ${a.label.padEnd(8)}  ${a.status.padEnd(12)}  ${a.shipment_count} shipments  clients: [${a.clients.join(', ')}]`,
  ),
);
