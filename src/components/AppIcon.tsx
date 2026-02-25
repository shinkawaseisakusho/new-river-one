import { LucideIcon } from 'lucide-react';

interface AppIconProps {
  name: string;
  icon: LucideIcon;
  url: string;
  color: string;
}

function AppIcon({ name, icon: Icon, url, color }: AppIconProps) {
  const handleClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleClick}
      className="flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 group"
    >
      <div className={`${color} w-16 h-16 md:w-20 md:h-20 rounded-2xl shadow-lg flex items-center justify-center transition-all duration-200 group-hover:shadow-xl`}>
        <Icon className="w-8 h-8 md:w-10 md:h-10 text-slate-200" strokeWidth={2} />
      </div>
      <span className="block w-full whitespace-nowrap overflow-hidden text-ellipsis text-xs md:text-sm text-white/95 font-semibold text-center leading-tight px-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
        {name}
      </span>
    </button>
  );
}

export default AppIcon;
