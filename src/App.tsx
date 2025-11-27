// App.tsx - 社内ポータルのトップ画面

import { FormEvent, useEffect, useState } from 'react';
import {
  Truck,
  Factory,
  Zap,
  FileWarning,
  FileX,
  AlertTriangle,
  Lightbulb,
  MessageSquare,
  Trophy,
  Newspaper,
  Image,
  Bell,
  QrCode,
  Globe,
  Youtube,
  Lock,
  // ★ 追記: PDF用のアイコン
  FileText, // ★
} from 'lucide-react';
import AppIcon from './components/AppIcon';

// ★ 追記：掲示板を読み込み
import BulletinBoard from './components/BulletinBoard'; // ★

// ★ 追記: GitHub Pagesのサブパス（/new-river-one/）に自動追従するためのbase
const base = import.meta.env.BASE_URL; // ★

const glassStyle = 'bg-white/20 backdrop-blur-md border border-white/30 shadow-sm text-gray-700';

const apps = [
  { name: 'トラモニ', icon: Truck, url: 'https://truck-monitor-26773.web.app/', color: glassStyle },
  { name: '生産モニター', icon: Factory, url: 'https://real-time-count-shinkawa.web.app/', color: glassStyle },
  { name: '溶接講習', icon: Zap, url: 'https://yousetu.pages.dev/', color: glassStyle },
  { name: 'フォトログ', icon: Image, url: 'https://manufacturing-log-shinkawa.web.app/', color: glassStyle },
  { name: '不適切', icon: FileWarning, url: 'https://futekisetsu.web.app/', color: glassStyle },
  { name: '不適合', icon: FileX, url: 'https://futekigou-shinkawa.web.app/', color: glassStyle },
  { name: '事故発生', icon: AlertTriangle, url: 'https://jiko-hassei.web.app/', color: glassStyle },
  { name: 'コールアプリ', icon: Bell, url: 'https://shinkawa-calling-app.web.app/', color: glassStyle },
  { name: '目安箱(社長)', icon: Lightbulb, url: 'https://forms.gle/TKGYmN5LGQzvrioq8', color: glassStyle },
  { name: '目安箱(DX)', icon: MessageSquare, url: 'https://forms.gle/62YPouEUw7CW7CY47', color: glassStyle },
  { name: 'MVP投票', icon: Trophy, url: 'https://forms.gle/VAPSUnLWn4GSYnsN9', color: glassStyle },
  { name: '社内新聞', icon: Newspaper, url: 'https://forms.gle/wCaF3fLXBigXoYw59', color: glassStyle },
  { name: '報連相', icon: FileText, url: `${base}files/報連相.pdf`, color: glassStyle },
  { name: 'QR生成', icon: QrCode, url: 'https://shinkawa-product-info-qr.web.app/', color: glassStyle },
  { name: 'HP', icon: Globe, url: 'https://shinkawa-g.jp/', color: glassStyle },
  { name: 'YouTube', icon: Youtube, url: 'https://www.youtube.com/channel/UC-z8G1TOqLh69NGauHlZH2A', color: glassStyle },
];

// --- ここから下はそのまま ---
function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (localStorage.getItem('nr-login') === 'true') {
      setAuthenticated(true);
    }
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.trim() === 'nr') {
      localStorage.setItem('nr-login', 'true');
      setAuthenticated(true);
      return;
    }
    setError('パスワードが正しくありません');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-800 to-indigo-200">
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* 左上の光 */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-sky-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-blob" />
        {/* 右下の光 */}
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-blob animation-delay-2000" />
        {/* 中央付近の光 */}
        <div className="absolute top-[40%] left-[40%] w-80 h-80 bg-purple-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob animation-delay-4000" />
      </div>
      <div className="relative z-10">
        {authenticated ? (
          <div className="container mx-auto px-3 py-5 max-w-7xl">
            <header className="text-center mb-4">
              <h1 className="text-3xl md:text-5xl font-bold text-slate-300 mb-1 italic">New River One</h1>
              <p className="text-slate-300 text-xs md:text-sm">総合アプリケーションポータル</p>
            </header>

            {/* ★ 追加：掲示板（縦幅コンパクトなカード） */}
            <BulletinBoard /> {/* ★ */}

            <div className="grid grid-cols-4 md:grid-cols-8 gap-4 md:gap-6 mb-5">
              {apps.map((app, index) => (
                <AppIcon
                  key={index}
                  name={app.name}
                  icon={app.icon}
                  url={app.url}
                  color={app.color}
                />
              ))}
            </div>
          </div>
        ) : (
          // --- ログイン前：ログイン画面（中央揃え） ---
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md">
              {/* ログインカード裏の装飾 */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-sky-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />

              {/* メインカード */}
              <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-xl">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-sky-200 mb-2 tracking-tighter">
                    New River One
                  </h2>
                  <p className="text-sm text-sky-100/70 font-medium">
                    認証が必要です
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-sky-100/80 uppercase tracking-wider ml-1">
                      Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-sky-200/50 transition-colors group-focus-within:text-sky-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(event) => {
                          setPassword(event.target.value);
                          setError('');
                        }}
                        className="block w-full rounded-xl border border-white/10 bg-black/20 pl-10 pr-4 py-3 text-white placeholder-white/20 shadow-inner transition-all focus:border-sky-400/50 focus:bg-black/30 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
                        placeholder="パスワードを入力"
                        autoFocus
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-rose-300 bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/20 animate-pulse">
                        ⚠️ {error}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 py-3.5 text-white font-bold shadow-lg transition-all hover:scale-[1.02] hover:shadow-sky-500/25 active:scale-[0.98]"
                  >
                    ログイン
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
