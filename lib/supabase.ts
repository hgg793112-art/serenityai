import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Serenity: 未设定 Supabase 环境变数。请在 .env 或 .env.local 中设定 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY，否则将使用 localStorage。'
  );
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseEnabled = (): boolean => !!supabase;
