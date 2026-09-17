export type UserRole = 
  | 'CUSTOMER' 
  | 'ADMIN' 
  | 'STORE_MANAGER' 
  | 'DELIVERY_PARTNER' 
  | 'VENDOR';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  defaultStoreId: string;
  addresses: Address[];
}

export interface Address {
  id: string;
  label: string; // Home, Work, Other
  street: string;
  area: string;
  city: string;
  pincode: string;
  coordinates: { lat: number; lng: number };
  isDefault?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  bannerColor: string;
  itemCount: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  description: string;
  mrp: number;
  sellingPrice: number;
  discountPercentage: number;
  unit: string;
  weight: string;
  rating: number;
  reviewsCount: number;
  tags: string[];
  image: string;
  isVegetarian?: boolean;
  shelfLife?: string;
  countryOfOrigin?: string;
  inStock: boolean;
  storeInventory: Record<string, number>; // storeId -> quantity
}

export interface Store {
  id: string;
  name: string;
  code: string;
  address: string;
  zone: string;
  etaMinutes: number;
  isActive: boolean;
  coordinates: { lat: number; lng: number };
  operationalHours: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Coupon {
  code: string;
  discountType: 'PERCENT' | 'FLAT';
  value: number;
  minOrderValue: number;
  description: string;
}

export type OrderStatus = 
  | 'CREATED'
  | 'PAYMENT_PENDING'
  | 'CONFIRMED'
  | 'STORE_ACCEPTED'
  | 'PICKING'
  | 'PACKED'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  price: number;
  mrp: number;
  quantity: number;
  image: string;
  unit: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  storeId: string;
  storeName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  deliveryFee: number;
  handlingFee: number;
  total: number;
  status: OrderStatus;
  deliveryAddress: Address;
  paymentMethod: 'UPI' | 'CREDIT_CARD' | 'COD' | 'WALLET';
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  deliveryPartner?: {
    id: string;
    name: string;
    phone: string;
    vehicleType: string;
    rating: number;
    currentLocation?: { lat: number; lng: number };
  };
  createdAt: string;
  estimatedDeliveryTime: string;
  deliveredAt?: string;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note: string;
  }[];
}

export interface AgentTrace {
  id: string;
  timestamp: string;
  query: string;
  perception: {
    intent: string;
    detectedEntities: Record<string, any>;
    confidence: number;
  };
  workingMemory: {
    cartItemsCount: number;
    activeStoreId: string;
    budgetLimit?: number;
  };
  reasoning: string;
  plan: string[];
  selectedAgents: string[];
  toolsCalled: {
    tool: string;
    input: any;
    outputSummary: string;
    durationMs: number;
  }[];
  decision: string;
  verification: {
    inventoryVerified: boolean;
    pricingVerified: boolean;
    businessRulesPassed: boolean;
  };
  finalResponse: string;
  recommendedProducts?: Product[];
}

export interface DemandForecast {
  id?: string;
  sku: string;
  name: string;
  productName?: string;
  category: string;
  storeId?: string;
  currentStock: number;
  hourlyDemandRate?: number;
  hoursUntilStockout: number;
  stockoutRisk: 'CRITICAL' | 'ELEVATED' | 'OPTIMAL' | 'OVERSTOCKED';
  predictedTomorrowDemand: number;
  recommendedReplenish?: number;
  recommendedRestockQuantity?: number;
  historicalDemand?: number[];
}

export type ForecastItem = DemandForecast;

export interface AnomalySignal {
  id: string;
  type: 'COUPON_ABUSE' | 'ORDER_SURGE' | 'DELIVERY_LATENCY' | 'INVENTORY_DISCREPANCY' | string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title?: string;
  description: string;
  timestamp?: string;
  detectedAt?: string;
  impactScore?: number;
  actionRecommended?: string;
  resolved: boolean;
  storeId?: string;
  metadata?: Record<string, any>;
}
