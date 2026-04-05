const ORDER_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
const STOCK_URL = import.meta.env.VITE_STOCK_API_URL || 'http://localhost:8082';

export const api = {
  async getOrders() {
    const res = await fetch(`${ORDER_URL}/api/orders`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async getOrder(id) {
    const res = await fetch(`${ORDER_URL}/api/orders/${id}`);
    if (!res.ok) throw new Error('Failed to fetch order');
    return res.json();
  },

  async createOrder(order) {
    const res = await fetch(`${ORDER_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!res.ok) {
      let errMsg = `Order service error ${res.status}`;
      try {
        const errData = await res.json();
        errMsg = errData.message || errData.error || errMsg;
      } catch {}
      throw new Error(errMsg);
    }
    return res.json();
  },

  async getProducts() {
    const res = await fetch(`${STOCK_URL}/api/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getProduct(id) {
    const res = await fetch(`${STOCK_URL}/api/products/${id}`);
    if (!res.ok) throw new Error('Failed to fetch product');
    return res.json();
  },
};
