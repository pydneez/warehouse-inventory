import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useInventory() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('item_code', { ascending: true });

    if (error) setError(error.message);
    else setItems(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const withdraw = async ({ itemId, quantity, userId, userEmail }) => {
    const { data: current, error: fetchErr } = await supabase
      .from('items')
      .select('quantity')
      .eq('id', itemId)
      .single();

    if (fetchErr) return { error: fetchErr.message };
    if (current.quantity < quantity) return { error: 'Insufficient stock.' };

    const { error: updateErr } = await supabase
      .from('items')
      .update({ quantity: current.quantity - quantity })
      .eq('id', itemId);

    if (updateErr) return { error: updateErr.message };

    const { error: logErr } = await supabase
      .from('withdrawal_logs')
      .insert({
        item_id:      itemId,
        quantity:     quantity,
        user_id:      userId,
        user_email:   userEmail,
        withdrawn_at: new Date().toISOString(),
      });

    if (logErr) return { error: logErr.message };

    await fetchItems();
    return { error: null };
  };

  const addItem = async ({ itemCode, name, quantity }) => {
    const { error } = await supabase
      .from('items')
      .insert({ item_code: itemCode, name, quantity: Number(quantity) });

    if (error) return { error: error.message };
    await fetchItems();
    return { error: null };
  };

  const updateStock = async ({ itemId, newQuantity }) => {
    const { error } = await supabase
      .from('items')
      .update({ quantity: Number(newQuantity) })
      .eq('id', itemId);

    if (error) return { error: error.message };
    await fetchItems();
    return { error: null };
  };

  return { items, loading, error, withdraw, addItem, updateStock, refetch: fetchItems };
}