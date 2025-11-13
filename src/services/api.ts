// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
    const response = await fetch(`${API_BASE_URL}/menu/${id}`);
    return handleResponse<MenuItem>(response);
  },

  // Get all toppings
  async getToppings(): Promise<Topping[]> {
    const response = await fetch(`${API_BASE_URL}/menu/toppings/all`);
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
    const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return handleResponse<MenuItem>(response);
  },

  // Delete menu item (admin)
  async delete(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string }>(response);
  },
};

// Orders API
export const ordersApi = {
  // Get all orders
  async getAll(): Promise<Order[]> {
    const response = await fetch(`${API_BASE_URL}/orders`);
    return handleResponse<Order[]>(response);
  },

  // Get single order
  async getById(id: number): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`);
    return handleResponse<Order>(response);
  },

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
    const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return handleResponse<Order>(response);
  },

  // Delete order (admin)
  async delete(id: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string }>(response);
  },
};

// Health check
export const healthApi = {
  async check(): Promise<{ status: string; database: string; timestamp: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(response);
  },
};

export { ApiError };
