export type TransactionType = 
  | 'PURCHASE' 
  | 'SALE' 
  | 'RETURN' 
  | 'TRANSFER' 
  | 'ADJUSTMENT' 
  | 'DAMAGE' 
  | 'EXPIRED' 
  | 'OPENING_STOCK';

export interface Warehouse {
  id: string;
  name: string;
  location?: string;
  isActive: boolean;
}

export interface InventoryBalance {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  product: {
    name: string;
    sku: string;
    minimumStock: number;
    maximumStock: number;
    sellingPrice: number;
    costPrice: number;
  };
  warehouse: {
    name: string;
  };
  batches?: {
    id: string;
    batchNumber: string;
    quantity: number;
    manufacturingDate?: string;
    expiryDate?: string;
  }[];
  serialNumbers?: {
    id: string;
    serialNumber: string;
    status: string;
  }[];
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  warehouseId: string;
  type: TransactionType;
  quantity: number; // positive or negative
  referenceId?: string;
  reason?: string;
  createdAt: string;
  inventory?: {
    product?: {
      name: string;
      sku: string;
    };
    warehouse?: {
      name: string;
    };
  };
}

// Responses
export interface PaginatedBalances {
  data: InventoryBalance[];
  total: number;
}

export interface PaginatedHistory {
  data: InventoryTransaction[];
  total: number;
}

export interface StockHealth {
  score: number; // 0-100
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  overstockedCount: number;
  totalProducts: number;
}
