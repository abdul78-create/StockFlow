export interface Warehouse {
  id: string;
  name: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseFormValues {
  name: string;
  address: string;
}
