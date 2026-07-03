export interface Customer {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  gst?: string | null;
  address?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFormValues {
  name: string;
  email?: string;
  phone?: string;
  gst?: string;
  address?: string;
}
