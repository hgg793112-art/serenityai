import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Serenity: 未設定 Supabase 環境變數。請在 .env 或 .env.local 中設定 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY，否則將使用 localStorage。'
  );
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseEnabled = (): boolean => !!supabase;
