import React, { useState } from 'react';
import {
  Sparkles,
  User,
  Lock,
  LogIn,
  UserPlus,
  Palette,
  Cloud,
  Check,
  CalendarDays,
  GraduationCap,
  Award,
  ShieldCheck,
} from 'lucide-react';
import { usePlannerStore } from '../store/usePlannerStore';
import { THEME_OPTIONS, applyThemeToDOM } from '../utils/themeConfig';
import { AppTheme } from '../types';

export const AuthView: React.FC = () => {
  const { login, register, theme, isLoading } = usePlannerStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<AppTheme>(theme || 'rose');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectThemePreview = (t: AppTheme) => {
    setSelectedTheme(t);
    applyThemeToDOM(t);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        await register(displayName, username, password, selectedTheme);
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Não foi possível autenticar.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#16131D] text-[#F5F2F8] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Brilho decorativo de fundo */}
      <div
        className="pointer-events-none fixed -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{ background: 'var(--theme-accent)' }}
      />
      <div
        className="pointer-events-none fixed -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-15"
        style={{ background: 'var(--theme-accent)' }}
      />

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-[#211C2B] border border-[#322B40] rounded-3xl shadow-2xl overflow-hidden relative z-10">
        {/* Coluna Esquerda: Apresentação & Seletor de Tema */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#261D30] to-[#211C2B] p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-[#322B40] flex flex-col justify-between gap-6">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#16131D]/80 border border-[#322B40] text-xs font-semibold text-pink-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Planner & Study Hub</span>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[#F5F2F8] tracking-tight">
                Organização pessoal, faculdade e estudos ✨
              </h1>
              <p className="text-xs text-[#A89FBD] mt-2 leading-relaxed">
                Cada conta possui espaço 100% privado e sincronizado na nuvem
                para acessar do computador, tablet ou celular.
              </p>
            </div>

            {/* Destaques dos Módulos */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#16131D]/80 border border-[#322B40]">
                <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-400/30 flex items-center justify-center text-rose-300 shrink-0">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#F5F2F8]">
                    Agenda & Contagem Regressiva
                  </div>
                  <div className="text-[11px] text-[#A89FBD]">
                    Prazos, área profissional, rotina e resumo semanal
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#16131D]/80 border border-[#322B40]">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#F5F2F8]">
                    Faculdade & Notas do Tablet
                  </div>
                  <div className="text-[11px] text-[#A89FBD]">
                    Grade horária fixa, unidades, entregas e PDFs
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#16131D]/80 border border-[#322B40]">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#F5F2F8]">
                    Controle de Concursos
                  </div>
                  <div className="text-[11px] text-[#A89FBD]">
                    Editais verticalizados com progresso por tópico
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seletor Rápido de Cores/Temas na Tela Inicial */}
          <div className="pt-4 border-t border-[#322B40] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#F5F2F8] flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-pink-300" />
                <span>Personalize o Tema</span>
              </span>
              <span className="text-[11px] text-[#A89FBD]">
                {THEME_OPTIONS.find((t) => t.id === selectedTheme)?.shortName}
              </span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {THEME_OPTIONS.map((t) => {
                const isSelected = selectedTheme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectThemePreview(t.id)}
                    title={t.name}
                    className={`h-8 rounded-xl border flex items-center justify-center transition ${
                      isSelected
                        ? 'border-white scale-105 shadow-md'
                        : 'border-[#322B40] opacity-75 hover:opacity-100'
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${t.swatchMain} 45%, ${t.swatchAccent} 100%)`,
                    }}
                  >
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-white drop-shadow" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Coluna Direita: Formulário de Login ou Cadastro */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            {/* Abas Entrar / Criar Conta */}
            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#16131D] border border-[#322B40] mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition ${
                  mode === 'login'
                    ? 'bg-[#211C2B] text-[#F5F2F8] border border-[#322B40] shadow-sm'
                    : 'text-[#A89FBD] hover:text-[#F5F2F8]'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Entrar na Conta</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg(null);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition ${
                  mode === 'register'
                    ? 'bg-[#211C2B] text-[#F5F2F8] border border-[#322B40] shadow-sm'
                    : 'text-[#A89FBD] hover:text-[#F5F2F8]'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Criar Nova Conta</span>
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-400/35 text-xs font-medium text-rose-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-[#A89FBD] mb-1.5">
                    Seu Nome *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#A89FBD] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Como quer ser chamada(o)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] focus:border-pink-400 focus:outline-none text-sm text-[#F5F2F8]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#A89FBD] mb-1.5">
                  Nome de Usuário *
                </label>
                <div className="relative">
                  <span className="text-xs font-bold text-[#A89FBD] absolute left-3.5 top-1/2 -translate-y-1/2">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="seu_usuario"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] focus:border-pink-400 focus:outline-none text-sm text-[#F5F2F8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A89FBD] mb-1.5">
                  Senha *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A89FBD] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    autoComplete={
                      mode === 'login' ? 'current-password' : 'new-password'
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] focus:border-pink-400 focus:outline-none text-sm text-[#F5F2F8]"
                  />
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-[#A89FBD] mb-1.5">
                    Escolha o Tema da sua Conta
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {THEME_OPTIONS.map((t) => {
                      const active = selectedTheme === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleSelectThemePreview(t.id)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-semibold transition ${
                            active
                              ? 'bg-[#292336] border-white/60 text-[#F5F2F8]'
                              : 'bg-[#16131D] border-[#322B40] text-[#A89FBD] hover:text-[#F5F2F8]'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full shrink-0 border border-white/20"
                            style={{ backgroundColor: t.swatchAccent }}
                          />
                          <span className="truncate">{t.shortName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl font-bold text-sm text-[#16131D] transition shadow-lg hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                style={{ backgroundColor: 'var(--theme-accent)' }}
              >
                {mode === 'login' ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{isLoading ? 'Entrando...' : 'Entrar no Planner'}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>
                      {isLoading ? 'Criando Conta...' : 'Criar Minha Conta'}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="pt-5 mt-6 border-t border-[#322B40] flex items-center justify-between text-[11px] text-[#A89FBD]">
            <span className="inline-flex items-center gap-1.5 text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Contas isoladas e protegidas por senha</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[#A89FBD]">
              <Cloud className="w-3.5 h-3.5" />
              <span>Sync em Nuvem</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
