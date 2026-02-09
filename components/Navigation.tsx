
import React from 'react';
import { ICONS } from '../constants';

interface NavigationProps {
  activeTab: 'dashboard' | 'stress' | 'relax' | 'mood' | 'health';
  onTabChange: (tab: 'dashboard' | 'stress' | 'relax' | 'mood' | 'health') => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>, label: '首页' },
    { id: 'stress', icon: <ICONS.Microphone />, label: '压力' },
    { id: 'relax', icon: <ICONS.Lotus />, label: '放松' },
    { id: 'mood', icon: <ICONS.Brain />, label: '心情' },
    { id: 'health', icon: <ICONS.Activity />, label: '数据' },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/80 backdrop-blur-md border-t border-slate-100 flex justify-around items-center h-24 pb-4 px-4 z-40 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] rounded-t-[3rem]">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id as any)}
          className={`flex flex-col items-center gap-1.5 transition-all relative ${
            activeTab === tab.id ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-slate-500'
          }`}
        >
          <div className={`p-2 transition-all rounded-2xl ${activeTab === tab.id ? 'bg-indigo-50 text-indigo-600' : ''}`}>
            {tab.icon}
          </div>
          <span className={`text-[10px] font-black tracking-widest ${activeTab === tab.id ? 'opacity-100' : 'opacity-0'}`}>
            {tab.label}
          </span>
          {activeTab === tab.id && (
            <div className="absolute -top-1 w-1 h-1 bg-indigo-600 rounded-full"></div>
          )}
        </button>
      ))}
    </nav>
  );
};

export default Navigation;
