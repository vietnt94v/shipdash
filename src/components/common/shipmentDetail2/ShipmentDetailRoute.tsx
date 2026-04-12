import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from 'react-leaflet';
import type { Shipment } from '../../../types/shipment';

const defaultIcon = L.icon({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedIcon = L.divIcon({
  className: 'leaflet-marker-selected',
  html: '<div class="h-3 w-3 rounded-full border-2 border-white bg-red-600 shadow-md box-content"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const MapFocus = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], Math.max(map.getZoom(), 9));
  }, [map, lat, lng]);
  return null;
};

type ShipmentDetailRouteProps = {
  assignmentContext?: boolean;
  routeShipmentsPending?: boolean;
  routeShipments?: Shipment[];
  shipment: Shipment;
};

const RouteMapInner = ({
  shipments,
  selectedShipmentId,
}: {
  shipments: Shipment[];
  selectedShipmentId: string;
}) => {
  const sorted = useMemo(
    () =>
      [...shipments].sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { numeric: true }),
      ),
    [shipments],
  );

  const selected = useMemo(() => {
    const byId = sorted.find((s) => s.id === selectedShipmentId);
    return byId ?? sorted[0];
  }, [sorted, selectedShipmentId]);

  const positions = useMemo(
    () => sorted.map((s) => [s.lat, s.lng] as [number, number]),
    [sorted],
  );

  if (sorted.length === 0) {
    return (
      <div className="text-sm text-gray-500 p-2 border border-gray-200 rounded-md">
        No stops to display.
      </div>
    );
  }

  const center: [number, number] = [selected.lat, selected.lng];

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        Route · {sorted.length} stop{sorted.length === 1 ? '' : 's'}
      </div>
      <MapContainer
        center={center}
        zoom={9}
        className="h-80 w-full rounded-md z-0 border border-gray-200"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapFocus lat={selected.lat} lng={selected.lng} />
        {positions.length >= 2 ? (
          <Polyline
            positions={positions}
            pathOptions={{ color: '#2563eb', weight: 3, opacity: 0.85 }}
          />
        ) : null}
        {sorted.map((s) => (
          <Marker
            key={s.id}
            position={[s.lat, s.lng]}
            icon={s.id === selectedShipmentId ? selectedIcon : defaultIcon}
          />
        ))}
      </MapContainer>
    </div>
  );
};

const ShipmentDetailRoute = ({
  assignmentContext,
  routeShipmentsPending,
  routeShipments,
  shipment,
}: ShipmentDetailRouteProps) => {
  if (assignmentContext) {
    if (routeShipmentsPending) {
      return <div className="text-sm text-gray-500 p-2">Loading route…</div>;
    }
    return (
      <RouteMapInner
        shipments={routeShipments ?? []}
        selectedShipmentId={shipment.id}
      />
    );
  }
  return (
    <RouteMapInner shipments={[shipment]} selectedShipmentId={shipment.id} />
  );
};

export default ShipmentDetailRoute;
