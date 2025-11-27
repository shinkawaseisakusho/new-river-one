// src/components/BulletinBoard.tsx - 社内掲示板。誰でも投稿可・最新5件表示・1件20文字/1行・縦幅コンパクト
// ★ 修正: 投稿日時を自動保存（DB既定）＋ UIでJST整形して表示

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Send } from 'lucide-react';

type Bullet = {
  id: string;
  content: string;
  created_at: string; // ISO文字列（UTC）
};

// ★ 追記: 全角数字(０-９)を半角数字(0-9)に変換するユーティリティ（送信時だけ使用）
function toHalfWidthDigits(src: string): string { // ★
  // Unicode全角数字は '０'(U+FF10)〜'９'(U+FF19) なので 0xFEE0 を引くと半角になります // ★
  return src.replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)); // ★
}

export default function BulletinBoard() {
  const [text, setText] = useState('');
  const [items, setItems] = useState<Bullet[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const maxLen = 30;

  // ★ 追記: 日本時間(JST)で "MM/DD HH:mm" に整形するフォーマッタ
  const dtf = useMemo(
    () =>
      new Intl.DateTimeFormat('ja-JP', {
        timeZone: 'Asia/Tokyo', // ★ JST
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    []
  ); // ★

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from('bulletin')
        .select('id, content, created_at') // ★ created_at を取得
        .order('created_at', { ascending: false })
        .limit(5);
      if (mounted) {
        if (!error && data) setItems(data);
        setLoading(false);
      }
    })();

    // ★ Realtime: INSERT を受けて先頭に追加（作成時刻はDBが自動付与）
    const channel = supabase
      .channel('realtime-bulletin')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bulletin' },
        (payload) => {
          const row = payload.new as Bullet; // ★ row.created_at はUTCのISO
          setItems((prev) => [row, ...prev].slice(0, 5));
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = text.trim();
    if (raw.length === 0) return;

    // ★ 修正: 送信時のみ全角数字→半角数字に正規化（入力欄の表示は変更しない）
    const normalized = toHalfWidthDigits(raw); // ★

    // ★ 修正: 文字数チェックも正規化後の内容で行う（DBのCHECKと整合）
    if (normalized.length > maxLen) return; // ★

    setPosting(true);
    // ★ 修正: DBへは正規化後の文字列を保存
    const { error } = await supabase.from('bulletin').insert({ content: normalized }); // ★
    setPosting(false);
    if (!error) setText(''); // 成功時のみ入力をクリア
  };

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:bg-white/10 max-w-3xl mx-auto mb-6"
      aria-label="社内掲示板"
    >
      {/* 装飾：上部のアクセントライン */}
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 opacity-70" />

      <div className="px-2 py-4 md:p-5">
        {/* 入力エリア：カプセル型でモダンに */}
        <form onSubmit={submit} className="relative flex items-center gap-2 group">
          <div className="relative flex-1">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, maxLen))}
              maxLength={maxLen}
              placeholder="掲示板に書き込む（最新5件表示）"
              className="w-full rounded-full border border-white/10 bg-black/20 px-5 py-3 text-sm text-slate-100 placeholder-slate-400 shadow-inner transition-all focus:border-sky-400/50 focus:bg-black/30 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
            />
            {/* 文字数カウンター（入力時のみ表示などの制御も可） */}
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
              {text.length}/{maxLen}
            </span>
          </div>
          
          <button
            type="submit"
            disabled={posting || text.trim().length === 0}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-indigo-400 to-purple-400 text-white shadow-lg transition-all hover:scale-105 hover:shadow-sky-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale"
            title="投稿する"
          >
            {posting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Send className="h-4 w-4 ml-0.5" aria-hidden />
            )}
          </button>
        </form>

        {/* リスト表示エリア */}
        <div className="mt-3">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-sky-500/30 border-t-sky-400" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-4 text-center text-sm text-slate-500">
              投稿がありません。
            </div>
          ) : (
            <ul className="space-y-2">
              {items.map((it) => {
                const when = dtf.format(new Date(it.created_at));
                
                return (
                  <li
                    key={it.id}
                    className="group flex items-center gap-1 rounded-xl bg-white/5 px-2 py-1.5 transition-all hover:bg-white/10 hover:shadow-md"
                  >
                    {/* 時刻：バッジスタイルで見やすく */}
                    <span className="flex-shrink-0 rounded bg-sky-500/10 px-1 py-0.5 text-[10px] md:text-sm font-bold tracking-wide text-sky-300 border border-sky-500/20 tabular-nums">
                      {when}
                    </span>

                    {/* テキスト：省略表示しつつ、ホバーで少し明るく */}
                    <span 
                      className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm md:text-base text-slate-300 group-hover:text-slate-100"
                      title={`${when} ${it.content}`}
                    >
                      {it.content}
                    </span>

                    {/* ホバー時に出現する矢印などの装飾（オプション） */}
                    <div className="opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_5px_rgba(56,189,248,0.8)]" />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
