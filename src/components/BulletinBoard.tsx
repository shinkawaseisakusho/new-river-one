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
    const value = text.trim();
    if (value.length === 0) return;
    if (value.length > maxLen) return; // 二重チェック（DB側にもCHECKあり）
    setPosting(true);
    // ★ created_at は指定不要（DBが自動で now() を入れる）
    const { error } = await supabase.from('bulletin').insert({ content: value });
    setPosting(false);
    if (!error) setText('');
  };

  return (
    <section
      className="rounded-2xl bg-white/80 backdrop-blur shadow-lg px-3 py-2 md:px-4 md:py-3 mb-6 border border-slate-100"
      aria-label="社内掲示板"
    >
      <form onSubmit={submit} className="flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, maxLen))}
          maxLength={maxLen}
          placeholder="掲示板に書き込む"
          className="flex-1 rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring focus:ring-sky-200 focus:border-sky-500"
        />
        <button
          type="submit"
          disabled={posting || text.trim().length === 0}
          className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-3 py-2 text-white text-sm font-medium hover:bg-sky-700 disabled:opacity-50 transition"
          title="投稿する"
        >
          <Send className="w-4 h-4" aria-hidden />
        </button>
      </form>

      <ul className="mt-2 space-y-1">
        {loading ? (
          <li className="text-xs text-slate-400 px-1 py-1">読み込み中…</li>
        ) : items.length === 0 ? (
          <li className="text-xs text-slate-400 px-1 py-1">最初の投稿を書き込んでください。</li>
        ) : (
          items.map((it) => {
            // ★ JST で "MM/DD HH:mm" を作成
            const when = dtf.format(new Date(it.created_at)); // ★
            return (
              <li
                key={it.id}
                className="text-sm text-slate-800 px-2 py-1 rounded-md bg-slate-50 hover:bg-slate-100 transition
                           whitespace-nowrap overflow-hidden text-ellipsis" // 1行表示
                title={`${when} ${it.content}`} // ★ ツールチップにフル文字列
              >
                {/* ★ 先頭に時刻を小さく表示 → 1行＆省略は維持 */}
                <span className="mr-2 text-xs text-sky-400 tabular-nums align-middle">{when}</span> {/* ★ */}
                <span className="align-middle text-xs sm:text-base">{it.content}</span>
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}
