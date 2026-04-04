import { supabase } from './supabase';
import { api } from './api';

export async function placeFullOrder({ user, items, address, paymentId, total }) {
  const orderItems = items.map(item => ({
    productId: item.id,
    name: item.name,
    hindi: item.hindi,
    price: item.price,
    qty: item.qty,
    image: item.image,
    subtotal: item.price * item.qty,
  }));

  const springOrderIds = [];
  for (const item of items) {
    const order = await api.createOrder({
      productId: item.id,
      qty: item.qty,
      customerEmail: user.email,
    });
    springOrderIds.push(order.id);
  }

  const { data, error } = await supabase
    .from('marketplace_orders')
    .insert({
      user_id: user.id,
      customer_email: user.email,
      payment_id: paymentId,
      payment_status: 'SUCCESS',
      total_amount: total,
      items: orderItems,
      address: address,
      status: 'PLACED',
      spring_order_ids: springOrderIds,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getMyOrders(userId) {
  const { data, error } = await supabase
    .from('marketplace_orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getOrderById(orderId) {
  const { data, error } = await supabase
    .from('marketplace_orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}
