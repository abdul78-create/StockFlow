export interface Supplier {
  id: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierFormValues {
  companyName: string;
  email: string;
  phone: string;
  address: string;
}
