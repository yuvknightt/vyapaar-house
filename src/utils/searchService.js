import { supabase } from './supabase';

export async function searchProducts({ query = '', category = 'all', minPrice = 0, maxPrice = 100000 }) {
  let supabaseQuery = supabase
    .from('products')
    .select('*')
    .gte('price', minPrice)
    .lte('price', maxPrice);

  if (category && category !== 'all') {
    supabaseQuery = supabaseQuery.eq('category', category);
  }

  if (query && query.trim().length >= 2) {
    const q = query.trim();
    supabaseQuery = supabaseQuery.or(
      `name.ilike.%${q}%,hindi.ilike.%${q}%,category.ilike.%${q}%,description.ilike.%${q}%,badge.ilike.%${q}%`
    );
  }

  const { data, error } = await supabaseQuery.order('price', { ascending: true });

  if (error) {
    console.error('Search error:', error);
    return [];
  }

  return data || [];
}

export async function getProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('id', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}
