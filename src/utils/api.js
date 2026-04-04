const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

export const api = {
  async getOrders() {
    const res = await fetch(`${BASE_URL}/api/orders`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async getOrder(id) {
    const res = await fetch(`${BASE_URL}/api/orders/${id}`);
    if (!res.ok) throw new Error('Failed to fetch order');
    return res.json();
  },

  async createOrder(order) {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  },
};
