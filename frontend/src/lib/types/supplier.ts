export interface Supplier {
  id: string;
  companyName: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierFormValues {
  companyName: string;
  email?: string;
  phone?: string;
  address?: string;
}
