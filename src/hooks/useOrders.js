import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

export function useOrders(pollInterval = 3000) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, pollInterval);
    return () => clearInterval(interval);
  }, [fetchOrders, pollInterval]);

  return { orders, loading, error, refetch: fetchOrders };
}
