import { supabase } from '../supaBaseClient.js';

export async function getChildStats(childId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('name, rewards, progress, parental_control, playtimeHistory, totalPlaytime')  // ← now camelCase
      .eq('id', childId)
      .single();

    if (error) throw error;
    return data;  // ← no conversion needed
  } catch (err) {
    console.error('Error fetching child stats:', err);
    return null;
  }
}
