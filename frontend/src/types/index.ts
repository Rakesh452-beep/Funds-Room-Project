export type UserRole = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber?: string;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate?: string;
  createdAt: string;
  _count?: { followUps: number; challans: number };
}

export interface FollowUp {
  id: string;
  note: string;
  createdAt: string;
  creator: { id: string; name: string; role: UserRole };
}

export interface CustomerDetail extends Customer {
  followUps: FollowUp[];
  challans: Challan[];
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  location: string;
  createdAt: string;
  _count?: { stockMovements: number };
}

export type StockMovementType = 'IN' | 'OUT';

export interface StockMovement {
  id: string;
  quantityChanged: number;
  movementType: StockMovementType;
  reason: string;
  createdAt: string;
  productId: string;
  product?: { id: string; name: string; sku: string };
  creator?: { id: string; name: string; role: UserRole };
}

export interface ProductDetail extends Product {
  stockMovements: StockMovement[];
}

export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface ChallanItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  unitPrice: number;
  quantity: number;
}

export interface Challan {
  id: string;
  challanNumber: string;
  totalQuantity: number;
  status: ChallanStatus;
  createdAt: string;
  customerId: string;
  customer?: Partial<Customer>;
  items: ChallanItem[];
  creator?: { id: string; name: string; role: UserRole };
  _count?: { items: number };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  draftChallans: number;
  confirmedChallans: number;
  lowStockProducts: number;
  totalRevenue: number;
  customersByStatus: { status: CustomerStatus; _count: number }[];
  recentChallans: Challan[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: { field: string; message: string }[];
}