// API Configuration
function resolveApiBase() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.length > 0) return envUrl;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:3001/api';
    return '/api';
  }
  // Fallback for SSR/build time
  return import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';
}

const API_BASE_URL = resolveApiBase();

// Types
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  image: string;
  category: string;
}

export interface Topping {
  id: string;
  name: string;
  price: number;
}

export interface OrderItem {
  menuItemId: string;
  menuItemName?: string;
  quantity: number;
  size: string;
  sugarLevel: string;
  toppings: string[];
  price: number;
}

export interface Order {
  id?: number;
  items: OrderItem[];
  totalPrice: number;
  status?: string;
  createdAt?: string;
}

export interface Manager {
  id: number;
  email: string;
  created_at?: string;
}

export interface InventoryItem {
  id: number;
  ingredient_name: string;
  quantity: number;
  unit: string;
  min_quantity: number;
  created_at?: string;
  updated_at?: string;
}

export interface InventoryUsageReport {
  reportType: 'basic' | 'detailed';
  dateRange: { startDate: string; endDate: string };
  summary: any;
  items?: any[];
  currentInventory?: InventoryItem[];
}

// API Error Handler
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(response.status, error.error || error.message || 'Request failed');
  }
  return response.json();
}

// Menu API
export const menuApi = {
  // Get all menu items
  async getAll(): Promise<MenuItem[]> {
    const response = await fetch(`${API_BASE_URL}/menu`);
    return handleResponse<MenuItem[]>(response);
  },

  // Get single menu item
  async getById(id: string): Promise<MenuItem> {
    const response = await fetch(`${API_BASE_URL}/menu?id=${id}`);
    return handleResponse<MenuItem>(response);
  },

  // Get all toppings
  async getToppings(): Promise<Topping[]> {
    const response = await fetch(`${API_BASE_URL}/toppings`);
    return handleResponse<Topping[]>(response);
  },

  // Add new menu item (admin)
  async create(item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    const response = await fetch(`${API_BASE_URL}/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return handleResponse<MenuItem>(response);
  },

  // Update menu item (admin)
  async update(id: string, item: Partial<MenuItem>): Promise<MenuItem> {
    const response = await fetch(`${API_BASE_URL}/menu?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return handleResponse<MenuItem>(response);
  },

  // Delete menu item (admin)
  async delete(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/menu?id=${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string }>(response);
  },
};

// Orders API
export const ordersApi = {
  async getSalesSummary(start?: string, end?: string) {
    const params = new URLSearchParams();
    if (start && end) {
      // Send both variants to be safe
      params.set('start', start);
      params.set('end', end);
      params.set('startDate', start);
      params.set('endDate', end);
    }
    // Cache-buster to avoid 304 and stale responses
    params.set('_ts', String(Date.now()));
    const qs = params.toString();
    const url = `${API_BASE}/reports/sales${qs ? `?${qs}` : ''}`;
    const res = await fetch(url, {
      credentials: 'include',
      headers: { 'Cache-Control': 'no-cache' },
    });

  // Create new order
  async create(order: { items: OrderItem[]; totalPrice: number }): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    return handleResponse<Order>(response);
  },

  // Update order status
  async updateStatus(id: number, status: string): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders?id=${id}&action=status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return handleResponse<Order>(response);
  },

  // Delete order (admin)
  async delete(id: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/orders?id=${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string }>(response);
  },
};

// Managers API
export const managersApi = {
  // Get all managers
  async getAll(): Promise<Manager[]> {
    const response = await fetch(`${API_BASE_URL}/managers`);
    return handleResponse<Manager[]>(response);
  },

  // Check if email is a manager
  async checkEmail(email: string): Promise<{ isManager: boolean; manager?: Manager }> {
    const response = await fetch(`${API_BASE_URL}/managers/check/${encodeURIComponent(email)}`);
    return handleResponse(response);
  },

  // Add new manager
  async add(email: string): Promise<Manager> {
    const response = await fetch(`${API_BASE_URL}/managers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse<Manager>(response);
  },

  // Delete manager
  async delete(id: number): Promise<{ message: string; email: string }> {
    const response = await fetch(`${API_BASE_URL}/managers/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string; email: string }>(response);
  },
};

// Health check
export const healthApi = {
  async check(): Promise<{ status: string; database: string; timestamp: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(response);
  },
};

// Reports API
export const reportsApi = {
  // Sales summary (optional start/end ISO strings)
  async getSalesSummary(start?: string, end?: string): Promise<any> {
    let url = `${API_BASE_URL}/reports/sales`;
    if (start && end) {
      const params = new URLSearchParams();
      params.set('start', start);
      params.set('end', end);
      // also include fallback names for compatibility
      params.set('startDate', start);
      params.set('endDate', end);
      url += `?${params.toString()}`;
    }
    const response = await fetch(url);
    return handleResponse(response);
  },

  // Most popular drinks (optional start/end ISO strings). If not provided, server defaults to today.
  async getPopularDrinks(start?: string, end?: string): Promise<any[]> {
    let url = `${API_BASE_URL}/reports/popular`;
    if (start && end) {
      const params = new URLSearchParams();
      params.set('start', start);
      params.set('end', end);
      params.set('startDate', start);
      params.set('endDate', end);
      url += `?${params.toString()}`;
    }
    const response = await fetch(url);
    return handleResponse<any[]>(response);
  },

  // Orders grouped by status (optional start/end). If not provided, server defaults to today.
  async getOrdersByStatus(start?: string, end?: string): Promise<any[]> {
    let url = `${API_BASE_URL}/reports/status`;
    if (start && end) {
      const params = new URLSearchParams();
      params.set('start', start);
      params.set('end', end);
      params.set('startDate', start);
      params.set('endDate', end);
      url += `?${params.toString()}`;
    }
    const response = await fetch(url);
    return handleResponse<any[]>(response);
  }
};

// Inventory API
export const inventoryApi = {
  async getAll(): Promise<InventoryItem[]> {
    const response = await fetch(`${API_BASE_URL}/inventory`);
    return handleResponse<InventoryItem[]>(response);
  },
  async getById(id: number): Promise<InventoryItem> {
    const response = await fetch(`${API_BASE_URL}/inventory/${id}`);
    return handleResponse<InventoryItem>(response);
  },
  async add(item: { ingredient_name: string; quantity: number; unit: string; min_quantity: number }): Promise<InventoryItem> {
    const response = await fetch(`${API_BASE_URL}/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return handleResponse<InventoryItem>(response);
  },
  async update(id: number, item: Partial<{ ingredient_name: string; quantity: number; unit: string; min_quantity: number }>): Promise<InventoryItem> {
    const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return handleResponse<InventoryItem>(response);
  },
  async delete(id: number): Promise<{ message: string; ingredient_name?: string }> {
    const response = await fetch(`${API_BASE_URL}/inventory/${id}`, { method: 'DELETE' });
    return handleResponse(response);
  },
  async getUsageReport(startDate: string, endDate: string): Promise<InventoryUsageReport> {
    const params = new URLSearchParams({ startDate, endDate });
    const response = await fetch(`${API_BASE_URL}/inventory/reports/usage?${params.toString()}`);
    return handleResponse<InventoryUsageReport>(response);
  }
};

export { ApiError };