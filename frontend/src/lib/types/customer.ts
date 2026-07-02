export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  gst: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFormValues {
  name: string;
  email: string;
  phone: string;
  gst: string;
  address: string;
}
