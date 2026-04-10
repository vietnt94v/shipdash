import { create } from 'zustand';

interface ShipmentStoreType {
  shipmentSelectedId: string;
  setShipmentSelectedId: (shipmentSelectedId: string) => void;
}

export const useShipmentStore = create<ShipmentStoreType>((set) => ({
  shipmentSelectedId: '',
  setShipmentSelectedId: (shipmentSelectedId: string) => set({ shipmentSelectedId }),
}));
