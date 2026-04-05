import { searchProducts, getProductById } from './searchService';
import { getMyOrders, placeFullOrder } from './orderService';

export async function executeToolCall(toolName, toolInput, cartItems, cartActions, user) {
  const requiresAuth = ['add_to_cart', 'remove_from_cart', 'get_cart', 'get_my_orders', 'place_order'];

  if (requiresAuth.includes(toolName) && !user) {
    return { error: 'LOGIN_REQUIRED', message: 'Please login to use this feature' };
  }

  switch (toolName) {
    case 'search_products': {
      try {
        const products = await searchProducts({
          query: toolInput.query || '',
          category: toolInput.category || 'all',
          minPrice: toolInput.min_price || 0,
          maxPrice: toolInput.max_price || 100000,
        });
        if (!products.length) return { found: false, message: 'No products found' };
        return {
          found: true, count: products.length,
          products: products.map(p => ({
            id: p.id, name: p.name, hindi: p.hindi, category: p.category,
            price: p.price, original_price: p.original_price, stock: p.stock,
            badge: p.badge, description: p.description?.slice(0, 100), image: p.image,
          }))
        };
      } catch (e) { return { error: e.message }; }
    }

    case 'get_product_details': {
      try {
        const p = await getProductById(toolInput.product_id);
        if (!p) return { error: 'Product not found' };
        return { id:p.id, name:p.name, hindi:p.hindi, category:p.category, price:p.price, original_price:p.original_price, stock:p.stock, description:p.description, badge:p.badge, image:p.image };
      } catch (e) { return { error: e.message }; }
    }

    case 'add_to_cart': {
      try {
        const p = await getProductById(toolInput.product_id);
        if (!p) return { error: 'Product not found' };
        if (p.stock < (toolInput.quantity || 1)) return { error: `Only ${p.stock} units available` };
        cartActions.addItem(p, toolInput.quantity || 1);
        const newTotal = cartItems.reduce((s,i) => s + i.price * i.qty, 0) + p.price * (toolInput.quantity || 1);
        return { success: true, added: p.name, price: p.price, quantity: toolInput.quantity || 1, cart_total: newTotal };
      } catch (e) { return { error: e.message }; }
    }

    case 'remove_from_cart': {
      const item = cartItems.find(i => i.id === toolInput.product_id);
      if (!item) return { error: 'Item not in cart' };
      cartActions.removeItem(toolInput.product_id);
      return { success: true, removed: item.name };
    }

    case 'get_cart': {
      if (!cartItems.length) return { empty: true, message: 'Cart is empty' };
      return {
        items: cartItems.map(i => ({ id:i.id, name:i.name, qty:i.qty, price:i.price, subtotal:i.price*i.qty })),
        total: cartItems.reduce((s,i) => s + i.price * i.qty, 0),
        count: cartItems.reduce((s,i) => s + i.qty, 0),
      };
    }

    case 'get_my_orders': {
      try {
        const orders = await getMyOrders(user.id);
        if (!orders.length) return { empty: true, message: 'No orders yet' };
        return {
          count: orders.length,
          orders: orders.slice(0, 5).map(o => ({
            id: o.id.slice(0,8).toUpperCase(), status: o.status,
            total: o.total_amount, items: o.items?.map(i => i.name).join(', '),
            date: new Date(o.created_at).toLocaleDateString('en-IN'),
          }))
        };
      } catch (e) { return { error: e.message }; }
    }

    case 'place_order': {
      if (!cartItems.length) return { error: 'Cart is empty. Add items first.' };
      try {
        const order = await placeFullOrder({
          user, items: cartItems,
          address: { name: toolInput.name, phone: toolInput.phone, street: toolInput.street, city: toolInput.city, state: toolInput.state, pincode: toolInput.pincode },
          paymentId: `AI_ORDER_${Date.now()}`,
          total: cartItems.reduce((s,i) => s + i.price * i.qty, 0),
        });
        cartActions.clearCart();
        return { success: true, order_id: order.id.slice(0,8).toUpperCase(), total: order.total_amount, message: 'Order placed! Confirmation email sent.' };
      } catch (e) { return { error: e.message }; }
    }

    default: return { error: 'Unknown tool' };
  }
}

export { getProductById };
