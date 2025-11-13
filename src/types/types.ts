export interface BubbleTea {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  image: string;
  category: 'milk-tea' | 'fruit-tea' | 'specialty';
}

export interface Customization {
  sugarLevel: 'no-sugar' | 'half-sugar' | 'normal';
  toppings: string[];
  size: 'small' | 'medium' | 'large';
}

export interface CartItem {
  id: string;
  tea: BubbleTea;
  customization: Customization;
  quantity: number;
}

// Manager reporting types
export interface SalesSummary {
  totalOrders: number;
  totalRevenue: string | number; // DB returns numeric string or number depending on parser
}

export interface ItemSales {
  menuItemId: number;
  itemName: string;
  quantitySold: number;
  revenue: string | number;
}

export interface DailySales {
  day: string; // e.g. '2025-11-01'
  orders: number;
  revenue: string | number;
}

export interface ManagerSalesReport {
  range: { start: string; end: string };
  summary: SalesSummary;
  items: ItemSales[];
}
