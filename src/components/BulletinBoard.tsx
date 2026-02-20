// src/components/BulletinBoard.tsx - 社内掲示板。誰でも投稿可・最新5件表示・1件200文字/1行・縦幅コンパクト
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

function renderContentWithLinks(content: string): React.ReactNode { // ★ URLをリンク化
  const regex = /https?:\/\/[^\s]+|www\.[^\s]+/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    const urlText = match[0];
    const href = urlText.startsWith('http') ? urlText : `https://${urlText}`;
    parts.push(
      <a
        key={`link-${match.index}-${urlText}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-sky-300 underline decoration-sky-400/60 underline-offset-2 hover:text-sky-200"
      >
        {urlText}
      </a>
    );
    lastIndex = match.index + urlText.length;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts.length > 0 ? parts : content;
}

export default function BulletinBoard() {
  const [text, setText] = useState('');
  const [items, setItems] = useState<Bullet[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null); // ★ 追記: 展開中のID
  const maxLen = 200;
  const visibleCount = 5;

  // ★ 追記: 日本時間(JST)で "MM/DD（曜）HH:mm" に整形するフォーマッタ
  const dateTimeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('ja-JP', {
        timeZone: 'Asia/Tokyo', // ★ JST
        month: '2-digit',
        day: '2-digit',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    []
  ); // ★

  const formatWhen = (isoDate: string) => {
    const parts = dateTimeFormatter.formatToParts(new Date(isoDate));
    const month = parts.find((part) => part.type === 'month')?.value ?? '';
    const day = parts.find((part) => part.type === 'day')?.value ?? '';
    const weekday = parts.find((part) => part.type === 'weekday')?.value ?? '';
    const hour = parts.find((part) => part.type === 'hour')?.value ?? '';
    const minute = parts.find((part) => part.type === 'minute')?.value ?? '';
    return `${month}/${day}（${weekday}） ${hour}:${minute}`;
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from('bulletin')
        .select('id, content, created_at') // ★ created_at を取得
        .order('created_at', { ascending: false })
        .limit(visibleCount);
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
          setItems((prev) => [row, ...prev].slice(0, visibleCount));
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

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const visibleItems = items.slice(0, visibleCount);
  const placeholderCount = Math.max(0, visibleCount - visibleItems.length);

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
              className="w-full rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs md:text-sm text-slate-100 placeholder-slate-400 shadow-inner transition-all focus:border-sky-400/50 focus:bg-black/30 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
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
        <div className="relative mt-3">
          <ul className="space-y-2">
            {loading ? (
              Array.from({ length: visibleCount }).map((_, index) => (
                <li
                  key={`loading-${index}`}
                  className="min-h-10 rounded-xl bg-white/5 px-2 py-1.5"
                  aria-hidden
                >
                  <span className="mb-1 block h-5 w-28 animate-pulse rounded bg-sky-500/20" />
                  <span className="block h-4 w-full animate-pulse rounded bg-white/10" />
                </li>
              ))
            ) : (
              <>
                {visibleItems.map((it) => {
                  const when = formatWhen(it.created_at);
                  const isExpanded = expandedId === it.id;

                  return (
                    <li
                      key={it.id}
                      onClick={() => toggleExpand(it.id)}
                      className={`group min-h-10 rounded-xl bg-white/5 px-2 py-1.5 transition-all hover:bg-white/10 hover:shadow-md cursor-pointer ${isExpanded ? 'bg-white/10' : ''}`}
                    >
                      <div className="mb-1 flex w-full items-center justify-between">
                        {/* 日付/曜日/時刻 */}
                        <span className="rounded bg-sky-500/10 px-1.5 py-0.5 text-xs md:text-sm font-bold tracking-wide text-sky-200 border border-sky-500/20 tabular-nums">
                          {when}
                        </span>
                        {/* ホバー時に出現するアクセント */}
                        <div className={`opacity-0 transition-opacity group-hover:opacity-100 ${isExpanded ? 'opacity-100' : ''}`}>
                          <div className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_5px_rgba(56,189,248,0.8)]" />
                        </div>
                      </div>

                      {/* テキスト：省略表示しつつ、ホバーで少し明るく（縦配置） */}
                      <span
                        className={`block w-full text-sm md:text-base text-slate-200 group-hover:text-slate-100 ${isExpanded
                            ? 'whitespace-normal break-words'
                            : 'overflow-hidden [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] break-words'
                          }`}
                        title={!isExpanded ? `${when} ${it.content}` : ''}
                      >
                        {renderContentWithLinks(it.content)}
                      </span>
                    </li>
                  );
                })}
                {Array.from({ length: placeholderCount }).map((_, index) => (
                  <li
                    key={`placeholder-${index}`}
                    className="min-h-10 rounded-xl border border-white/5 bg-white/5 px-2 py-1.5"
                    aria-hidden
                  />
                ))}
              </>
            )}
          </ul>
          {!loading && visibleItems.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-slate-500">
              投稿がありません。
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
