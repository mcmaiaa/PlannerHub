import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  GraduationCap,
  Award,
  Briefcase,
  Sparkles,
  Cloud,
  HardDrive,
  LogOut,
  Palette,
  Check,
} from 'lucide-react';
import { NavigationTab } from '../types';
import { usePlannerStore } from '../store/usePlannerStore';
import { THEME_OPTIONS } from '../utils/themeConfig';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    syncStatus,
    currentUser,
    theme,
    setTheme,
    logout,
    sharedJobsReceived = [],
  } = usePlannerStore();

  const pendingSharedJobsCount = sharedJobsReceived.filter(
    (s) => s.status === 'pending'
  ).length;

  const navItems: {
    id: NavigationTab;
    label: string;
    icon: React.FC<{ className?: string }>;
    accentColor: string;
    activeClass: string;
    badgeCount?: number;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      accentColor: 'text-pink-300',
      activeClass: 'border-l-4 border-l-pink-400 bg-pink-500/15 text-[#F5F2F8]',
    },
    {
      id: 'calendar',
      label: 'Agenda & Calendário',
      icon: CalendarDays,
      accentColor: 'text-rose-300',
      activeClass: 'border-l-4 border-l-rose-400 bg-rose-500/15 text-[#F5F2F8]',
    },
    {
      id: 'college',
      label: 'Faculdade',
      icon: GraduationCap,
      accentColor: 'text-purple-300',
      activeClass: 'border-l-4 border-l-purple-400 bg-purple-500/15 text-[#F5F2F8]',
    },
    {
      id: 'concurso',
      label: 'Concursos',
      icon: Award,
      accentColor: 'text-emerald-300',
      activeClass: 'border-l-4 border-l-emerald-400 bg-emerald-500/15 text-[#F5F2F8]',
    },
    {
      id: 'vagas',
      label: 'Vagas & Carreira',
      icon: Briefcase,
      accentColor: 'text-sky-300',
      activeClass: 'border-l-4 border-l-sky-400 bg-sky-500/15 text-[#F5F2F8]',
      badgeCount: pendingSharedJobsCount,
    },
  ];

  return (
    <>
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-[#211C2B] border-r border-[#322B40] min-h-screen sticky top-0 select-none">
        <div className="px-5 py-5 border-b border-[#322B40] space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-500/15 border border-pink-400/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-pink-300" />
            </div>
            <h1 className="text-base font-bold tracking-tight text-[#F5F2F8]">
              Planner Hub
            </h1>
          </div>

          {currentUser && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#16131D] border border-[#322B40]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] text-[#16131D] shrink-0"
                  style={{ backgroundColor: 'var(--theme-accent)' }}
                >
                  {currentUser.displayName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#F5F2F8] truncate">
                    {currentUser.displayName}
                  </div>
                  <div className="text-[10px] text-[#A89FBD] truncate">
                    @{currentUser.username}
                  </div>
                </div>
              </div>
              <button
                onClick={logout}
                title="Trocar de conta ou sair"
                className="p-1.5 rounded-lg text-[#A89FBD] hover:text-rose-300 hover:bg-[#292336] transition shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? item.activeClass
                    : 'text-[#A89FBD] hover:bg-[#292336] hover:text-[#F5F2F8]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? item.accentColor : ''}`} />
                  <span>{item.label}</span>
                </div>
                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white">
                    {item.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Seletor de Tema + Status + Sair */}
        <div className="p-3.5 border-t border-[#322B40] space-y-3">
          <div className="p-2.5 rounded-xl bg-[#16131D] border border-[#322B40] space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-[#F5F2F8] flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-pink-300" />
                <span>Tema do Site</span>
              </span>
              <span className="text-[#A89FBD]">
                {THEME_OPTIONS.find((t) => t.id === theme)?.shortName}
              </span>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {THEME_OPTIONS.map((t) => {
                const isSelected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    title={t.name}
                    className={`h-6 rounded-lg border flex items-center justify-center transition ${
                      isSelected
                        ? 'border-white scale-105 shadow-sm'
                        : 'border-[#322B40] opacity-75 hover:opacity-100'
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${t.swatchMain} 45%, ${t.swatchAccent} 100%)`,
                    }}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white drop-shadow" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between px-2 py-1 text-[11px] text-[#A89FBD]">
            <span className="flex items-center gap-1.5">
              {syncStatus === 'cloud' ? (
                <Cloud className="w-3.5 h-3.5 text-emerald-300" />
              ) : (
                <HardDrive className="w-3.5 h-3.5 text-purple-300" />
              )}
              {syncStatus === 'cloud' ? 'Sincronizado na Nuvem' : 'Salvo Localmente'}
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                syncStatus === 'cloud' ? 'bg-emerald-400' : 'bg-purple-400'
              }`}
            />
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#A89FBD] hover:text-rose-300 bg-[#16131D] hover:bg-[#292336] border border-[#322B40] transition"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-300" />
            <span>Trocar Conta / Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header & Bottom Nav */}
      <div className="lg:hidden sticky top-0 z-30 bg-[#211C2B]/95 backdrop-blur-md border-b border-[#322B40] px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-4 h-4 text-pink-300 shrink-0" />
          <span className="font-bold text-sm text-[#F5F2F8] truncate">
            {currentUser ? currentUser.displayName : 'Planner Hub'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-[#16131D] px-1.5 py-1 rounded-lg border border-[#322B40]">
            {THEME_OPTIONS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                title={t.shortName}
                className={`w-4 h-4 rounded-full border ${
                  theme === t.id ? 'border-white scale-110' : 'border-transparent opacity-70'
                }`}
                style={{ backgroundColor: t.swatchAccent }}
              />
            ))}
          </div>
          <button
            onClick={logout}
            title="Trocar Conta / Sair"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-rose-300 bg-[#16131D] border border-[#322B40]"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#211C2B]/95 backdrop-blur-md border-t border-[#322B40] px-1.5 py-1.5 grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl transition ${
                isActive ? `bg-white/5 ${item.accentColor}` : 'text-[#A89FBD]'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="text-[10px] font-medium truncate">
                {item.label.split(' ')[0]}
              </span>
              {item.badgeCount !== undefined && item.badgeCount > 0 && (
                <span className="absolute top-1 right-2 w-4 h-4 rounded-full text-[9px] font-extrabold bg-rose-500 text-white flex items-center justify-center">
                  {item.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
