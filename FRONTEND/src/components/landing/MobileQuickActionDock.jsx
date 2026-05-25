import React from 'react';
import { Home, Map, Heart, Activity, UserRound } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function MobileQuickActionDock() {
  const location = useLocation();
  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname.startsWith('/dashboard');
    return location.pathname === path;
  };

  const Item = ({ to, label, icon, active }) => (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center gap-1 text-[10px] font-extrabold transition-all rounded-2xl px-3 py-2 border ${
        active
          ? 'bg-lavender/15 border-lavender/30 text-lavender'
          : 'bg-white/0 border-transparent text-gray-500 dark:text-gray-400 hover:bg-lavender/10 hover:border-lavender/20'
      }`}
    >
      {icon}
      <span className="leading-none">{label}</span>
    </Link>
  );

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[2000] md:hidden">
      <div className="bg-white/80 dark:bg-dark/80 backdrop-blur-md border border-lavender/20 dark:border-white/10 rounded-[2rem] px-2.5 py-2 shadow-2xl">
        <div className="flex gap-2 items-center">
          <Item to="/" label="Home" icon={<Home className={`w-4 h-4 ${isActive('/') ? 'text-lavender' : 'text-gray-500 dark:text-gray-400'}`} />} active={isActive('/')} />
          <Item to="/map" label="Rescue" icon={<Activity className={`w-4 h-4 ${isActive('/map') ? 'text-lavender' : 'text-gray-500 dark:text-gray-400'}`} />} active={isActive('/map')} />
          <Item to="/map" label="Map" icon={<Map className={`w-4 h-4 ${isActive('/map') ? 'text-lavender' : 'text-gray-500 dark:text-gray-400'}`} />} active={isActive('/map')} />
          <Item to="/donations" label="Donate" icon={<Heart className={`w-4 h-4 ${isActive('/donations') ? 'text-lavender' : 'text-gray-500 dark:text-gray-400'}`} />} active={isActive('/donations')} />
          <Item to="/dashboard/citizen" label="Dashboard" icon={<UserRound className={`w-4 h-4 ${isActive('/dashboard') ? 'text-lavender' : 'text-gray-500 dark:text-gray-400'}`} />} active={isActive('/dashboard/citizen')} />
        </div>
      </div>
    </nav>
  );
}

