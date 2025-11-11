// App.tsx - 社内ポータルのトップ画面。PDF(報連相)を開くタイルを追加

import { FormEvent, useEffect, useState } from 'react';
import {
  Truck,
  Factory,
  Flame,
  FileWarning,
  FileX,
  AlertTriangle,
  Mail,
  MessageSquare,
  Trophy,
  Newspaper,
  Globe,
  Youtube,
  // ★ 追記: PDF用のアイコン
  FileText, // ★
} from 'lucide-react';
import AppIcon from './components/AppIcon';

// ★ 追記: GitHub Pagesのサブパス（/new-river-one/）に自動追従するためのbase
const base = import.meta.env.BASE_URL; // ★

const apps = [
    { name: 'トラックモニター', icon: Truck, url: 'https://truck-monitor-26773.web.app/', color: 'bg-blue-200' },
    { name: '生産モニター', icon: Factory, url: 'https://real-time-count-shinkawa.web.app/', color: 'bg-green-200' },
    { name: '溶接講習', icon: Flame, url: 'https://yousetu.pages.dev/', color: 'bg-red-200' },
    { name: '不適切報告書', icon: FileWarning, url: 'https://futekisetsu.web.app/', color: 'bg-rose-200' },
    { name: '不適合報告書', icon: FileX, url: 'https://futekigou-shinkawa.web.app/', color: 'bg-orange-200' },
    { name: '事故発生報告書', icon: AlertTriangle, url: 'https://jiko-hassei.web.app/', color: 'bg-purple-200' },
    // ★ 追記: 報連相.pdf を開くタイル（public/files/報連相.pdf）
    { name: '報連相ガイド', icon: FileText, url: `${base}files/報連相.pdf`, color: 'bg-teal-200' }, // ★
    { name: '目安箱(社長宛)', icon: Mail, url: 'https://forms.gle/TKGYmN5LGQzvrioq8', color: 'bg-indigo-200' },
    { name: '目安箱(DX宛)', icon: MessageSquare, url: 'https://forms.gle/62YPouEUw7CW7CY47', color: 'bg-cyan-200' },
    { name: 'MVP投票', icon: Trophy, url: 'https://forms.gle/VAPSUnLWn4GSYnsN9', color: 'bg-yellow-200' },
    { name: '新聞アンケート', icon: Newspaper, url: 'https://forms.gle/wCaF3fLXBigXoYw59', color: 'bg-lime-200' },
    { name: 'HP', icon: Globe, url: 'https://shinkawa-g.jp/', color: 'bg-teal-200' },
    { name: 'YouTube', icon: Youtube, url: 'https://www.youtube.com/channel/UC-z8G1TOqLh69NGauHlZH2A', color: 'bg-red-200' },
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
    <div className="min-h-screen bg-gradient-to-br from-sky-800 to-sky-100">
      {authenticated ? (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-200 mb-2 italic">New River One</h1>
            <p className="text-slate-200">統合アプリケーションポータル</p>
          </header>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-6 md:gap-8">
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
        <div className="bg-white/90 backdrop-blur rounded-3xl p-10 shadow-2xl w-full max-w-md mx-4">
          <h2 className="text-2xl font-semibold text-slate-700 mb-4">ログインして続行</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm text-slate-500">パスワード</span>
              <input
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError('');
                }}
                className="mt-1 block w-full rounded-lg border border-slate-200 px-4 py-2 text-base text-slate-700 focus:border-sky-500 focus:outline-none focus:ring focus:ring-sky-200"
                autoFocus
              />
            </label>
            {error && <p className="text-sm text-rose-500">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-lg bg-sky-600 px-4 py-2 text-white font-semibold hover:bg-sky-700 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
            >
              ログイン
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
