// src/lib/supabase.ts - Supabaseクライアントの初期化。フロントエンドから公開Anonキーで接続
// ★ 新規ファイル

import { createClient } from '@supabase/supabase-js';

// ★ 環境変数（Viteの命名規則：VITE_～）
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;   // ★
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string; // ★

// ★ クライアントを作成してエクスポート
export const supabase = createClient(supabaseUrl, supabaseAnonKey); // ★
