import React, { useMemo, useState } from 'react';
import {
  Sparkles,
  Clock,
  GraduationCap,
  CalendarCheck2,
  StickyNote,
  Briefcase,
  Gift,
  AlertCircle,
  BookOpen,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Flame,
  Repeat,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { usePlannerStore } from '../store/usePlannerStore';
import {
  DAY_OF_WEEK_LABELS,
  DAY_OF_WEEK_SHORT,
  formatCountdownBadge,
  formatFullDatePtBR,
  formatReadableDate,
  getDaysDifference,
  getEventsForDate,
  getNextOccurrenceDate,
  getWeekDaysAround,
  toISODateString,
} from '../utils/dateUtils';
import { DayOfWeek, HighlightCountdownItem } from '../types';
import { getCategoryStyle, getHighlightStyle } from '../utils/categoryStyles';

export const DashboardView: React.FC = () => {
  const {
    events = [],
    fixedClasses = [],
    collegeSubjects = [],
    exams = [],
    quickNotes = '',
    quickNotesUpdatedAt = '',
    updateQuickNotes,
    setActiveTab,
  } = usePlannerStore();

  const todayIso = toISODateString(new Date());
  const jsDay = new Date().getDay();
  const defaultDayOfWeek: DayOfWeek =
    jsDay >= 1 && jsDay <= 5 ? (jsDay as DayOfWeek) : 1;

  const [selectedClassDay, setSelectedClassDay] =
    useState<DayOfWeek>(defaultDayOfWeek);
  const [highlightPage, setHighlightPage] = useState(0);
  const HIGHLIGHTS_PER_PAGE = 4;

  // 1. Destaques e Contagem Regressiva (ordenado pelas datas mais próximas primeiro)
  const countdownHighlights = useMemo<HighlightCountdownItem[]>(() => {
    const list: HighlightCountdownItem[] = [];

    for (const ev of events) {
      const isAutoHighlight =
        ev.category === 'entrevista' ||
        ev.category === 'concurso' ||
        ev.category === 'aniversario' ||
        ev.category === 'faculdade' ||
        ev.isHighlight;

      if (!isAutoHighlight) continue;

      const nextDate = getNextOccurrenceDate(ev, todayIso);
      if (!nextDate) continue;

      const diff = getDaysDifference(todayIso, nextDate);
      if (diff < 0 || diff > 180) continue;

      list.push({
        id: `ev-${ev.id}`,
        title: ev.title,
        date: nextDate,
        startTime: ev.startTime,
        daysRemaining: diff,
        badgeType:
          ev.category === 'entrevista'
            ? 'entrevista'
            : ev.category === 'concurso'
            ? 'concurso'
            : ev.category === 'aniversario'
            ? 'aniversario'
            : ev.category === 'faculdade'
            ? 'prova'
            : 'urgente',
        subtitle: ev.locationOrLink || 'Agenda & Calendário',
        source: 'agenda',
      });
    }

    for (const subj of collegeSubjects) {
      for (const unit of subj.units) {
        for (const ass of unit.assessments) {
          if (ass.completed) continue;
          const diff = getDaysDifference(todayIso, ass.dueDate);
          if (diff < 0 || diff > 180) continue;

          list.push({
            id: `ass-${ass.id}`,
            title: ass.title,
            date: ass.dueDate,
            startTime: ass.startTime,
            daysRemaining: diff,
            badgeType: ass.type === 'prova' ? 'prova' : 'trabalho',
            subtitle: `${subj.name} • ${unit.title}`,
            source: 'faculdade',
          });
        }
      }
    }

    return list.sort((a, b) => {
      if (a.daysRemaining !== b.daysRemaining) {
        return a.daysRemaining - b.daysRemaining;
      }
      return (a.startTime || '23:59').localeCompare(b.startTime || '23:59');
    });
  }, [events, collegeSubjects, todayIso]);

  const totalHighlightPages = Math.max(
    1,
    Math.ceil(countdownHighlights.length / HIGHLIGHTS_PER_PAGE)
  );
  const safeHighlightPage = Math.min(highlightPage, totalHighlightPages - 1);
  const visibleHighlights = countdownHighlights.slice(
    safeHighlightPage * HIGHLIGHTS_PER_PAGE,
    (safeHighlightPage + 1) * HIGHLIGHTS_PER_PAGE
  );

  // 2. Aulas de Hoje
  const todaysClasses = useMemo(() => {
    return fixedClasses
      .filter((c) => c.dayOfWeek === selectedClassDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [fixedClasses, selectedClassDay]);

  // 3. Agenda do Dia (Compromissos + Entregas da Faculdade de Hoje)
  const todaysEvents = useMemo(() => {
    const baseEvents = getEventsForDate(events, todayIso);
    const collegeToday = collegeSubjects.flatMap((subj) =>
      subj.units.flatMap((u) =>
        u.assessments
          .filter((a) => !a.completed && a.dueDate === todayIso)
          .map((a) => ({
            id: `today-ass-${a.id}`,
            title: a.title,
            date: a.dueDate,
            startTime: a.startTime || '23:59',
            endTime: a.startTime || '23:59',
            category: 'faculdade' as const,
            recurrence: 'unico' as const,
            isHighlight: true,
            locationOrLink: `${subj.name} • ${u.title}`,
          }))
      )
    );
    return [...baseEvents, ...collegeToday].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );
  }, [events, collegeSubjects, todayIso]);

  // 4. Resumo Semanal Aberto (Grade de 7 Colunas Segunda a Domingo — Apenas Compromissos e Entregas, sem aulas fixas)
  const openWeekDays = useMemo(() => {
    const days = getWeekDaysAround(new Date());
    return days.map((d) => {
      const dayEvents = getEventsForDate(events, d.isoDate);

      const dayAssessments: { id: string; title: string; time: string }[] = [];
      for (const subj of collegeSubjects) {
        for (const unit of subj.units) {
          for (const ass of unit.assessments) {
            if (!ass.completed && ass.dueDate === d.isoDate) {
              dayAssessments.push({
                id: ass.id,
                title: ass.title,
                time: ass.startTime || 'Entrega',
              });
            }
          }
        }
      }

      const combinedItems: {
        id: string;
        time: string;
        title: string;
        tag: string;
        styleClass: string;
        textClass: string;
      }[] = [
        ...dayAssessments.map((ass) => ({
          id: `ass-${ass.id}-${d.isoDate}`,
          time: ass.time,
          title: ass.title,
          tag: 'Entrega',
          styleClass:
            'border-l-4 border-l-purple-400 bg-purple-500/15 border border-purple-400/25',
          textClass: 'text-purple-300',
        })),
        ...dayEvents.map((ev) => {
          const st = getCategoryStyle(ev.category);
          return {
            id: `ev-${ev.id}-${d.isoDate}`,
            time: ev.startTime,
            title: ev.title,
            tag: st.shortLabel,
            styleClass: st.cardClass,
            textClass: st.textClass,
          };
        }),
      ].sort((a, b) => a.time.localeCompare(b.time));

      return {
        ...d,
        items: combinedItems,
      };
    });
  }, [events, collegeSubjects]);

  // Progresso médio dos Concursos
  const examProgressPercent = useMemo(() => {
    let totalChecks = 0;
    let completedChecks = 0;
    for (const ex of exams) {
      for (const s of ex.subjects) {
        for (const t of s.topics) {
          totalChecks += 4;
          if (t.teoria) completedChecks++;
          if (t.resumo) completedChecks++;
          if (t.questoes) completedChecks++;
          if (t.revisao) completedChecks++;
        }
      }
    }
    return totalChecks === 0
      ? 0
      : Math.round((completedChecks / totalChecks) * 100);
  }, [exams]);

  return (
    <div className="space-y-6 pb-16 lg:pb-8">
      {/* Cabeçalho com Resumo Rápido */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#211C2B] border border-[#322B40] rounded-2xl p-5 shadow-lg">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink-500/15 border border-pink-400/30 text-pink-300 text-xs font-semibold mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Visão Geral do Dia</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F5F2F8] capitalize">
            {formatFullDatePtBR(todayIso)}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab('college')}
            className="px-4 py-2.5 rounded-xl border-l-4 border-l-purple-400 bg-purple-500/15 border border-purple-400/25 hover:bg-purple-500/25 transition text-left"
          >
            <div className="text-[11px] text-[#A89FBD]">Aulas de Hoje</div>
            <div className="text-sm font-bold text-purple-300">
              {todaysClasses.length} disciplina(s)
            </div>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className="px-4 py-2.5 rounded-xl border-l-4 border-l-pink-400 bg-pink-500/15 border border-pink-400/25 hover:bg-pink-500/25 transition text-left"
          >
            <div className="text-[11px] text-[#A89FBD]">Agenda de Hoje</div>
            <div className="text-sm font-bold text-pink-300">
              {todaysEvents.length} compromisso(s)
            </div>
          </button>

          <button
            onClick={() => setActiveTab('concurso')}
            className="px-4 py-2.5 rounded-xl border-l-4 border-l-emerald-400 bg-emerald-500/15 border border-emerald-400/25 hover:bg-emerald-500/25 transition text-left"
          >
            <div className="text-[11px] text-[#A89FBD]">
              Meus Concursos ({exams.length})
            </div>
            <div className="text-sm font-bold text-emerald-300">
              {examProgressPercent}% concluído
            </div>
          </button>
        </div>
      </div>

      {/* 1. DESTAQUES E CONTAGEM REGRESSIVA (CARROSSEL) */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-rose-400" />
            <h3 className="text-base font-bold text-[#F5F2F8]">
              Destaques & Contagem Regressiva
            </h3>
            {countdownHighlights.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#211C2B] border border-[#322B40] text-[#A89FBD]">
                {safeHighlightPage * HIGHLIGHTS_PER_PAGE + 1}–
                {Math.min(
                  (safeHighlightPage + 1) * HIGHLIGHTS_PER_PAGE,
                  countdownHighlights.length
                )}{' '}
                de {countdownHighlights.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {totalHighlightPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    setHighlightPage((p) => Math.max(0, p - 1))
                  }
                  disabled={safeHighlightPage === 0}
                  title="Mais próximos (Anterior)"
                  className="w-8 h-8 rounded-xl bg-[#211C2B] border border-[#322B40] flex items-center justify-center text-[#F5F2F8] hover:border-pink-400/50 hover:text-pink-300 disabled:opacity-35 disabled:pointer-events-none transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-[#A89FBD] px-1">
                  {safeHighlightPage + 1} / {totalHighlightPages}
                </span>
                <button
                  onClick={() =>
                    setHighlightPage((p) =>
                      Math.min(totalHighlightPages - 1, p + 1)
                    )
                  }
                  disabled={safeHighlightPage >= totalHighlightPages - 1}
                  title="Próximos compromissos"
                  className="w-8 h-8 rounded-xl bg-[#211C2B] border border-[#322B40] flex items-center justify-center text-[#F5F2F8] hover:border-pink-400/50 hover:text-pink-300 disabled:opacity-35 disabled:pointer-events-none transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={() => setActiveTab('calendar')}
              className="text-xs font-medium text-pink-300 hover:underline inline-flex items-center gap-1"
            >
              <span>Gerenciar alertas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {countdownHighlights.length === 0 ? (
            <div className="col-span-full bg-[#211C2B] border border-[#322B40] rounded-2xl p-6 text-center text-sm text-[#A89FBD]">
              Nenhuma urgência, prova ou compromisso profissional pendente nos próximos dias. ✨
            </div>
          ) : (
            visibleHighlights.map((item) => {
              const style = getHighlightStyle(item.badgeType);
              const IconComp =
                item.badgeType === 'entrevista'
                  ? Briefcase
                  : item.badgeType === 'concurso'
                  ? BookOpen
                  : item.badgeType === 'aniversario'
                  ? Gift
                  : item.badgeType === 'prova' || item.badgeType === 'trabalho'
                  ? GraduationCap
                  : AlertCircle;

              return (
                <div
                  key={item.id}
                  onClick={() =>
                    setActiveTab(item.source === 'faculdade' ? 'college' : 'calendar')
                  }
                  className={`cursor-pointer rounded-2xl p-5 transition-all duration-150 shadow-md hover:-translate-y-0.5 flex flex-col justify-between gap-3 ${style.cardClass}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${style.badgeClass}`}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${style.badgeClass}`}
                    >
                      {formatCountdownBadge(item.daysRemaining)}
                    </span>
                  </div>

                  <div>
                    <span
                      className={`text-[11px] uppercase tracking-wider font-bold ${style.textClass}`}
                    >
                      {item.badgeType === 'entrevista'
                        ? 'Área Profissional'
                        : item.badgeType === 'concurso'
                        ? 'Concurso Público'
                        : item.badgeType === 'prova'
                        ? 'Prova da Faculdade'
                        : item.badgeType === 'trabalho'
                        ? 'Entrega da Faculdade'
                        : item.badgeType === 'aniversario'
                        ? 'Aniversário'
                        : 'Destaque'}
                    </span>
                    <h4 className="text-sm font-bold text-[#F5F2F8] mt-0.5 line-clamp-2">
                      {item.title}
                    </h4>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-[#A89FBD]">
                    <span className="truncate max-w-[65%]">{item.subtitle}</span>
                    <span className="font-semibold text-[#F5F2F8]">
                      {formatReadableDate(item.date)}
                      {item.startTime ? ` • ${item.startTime}` : ''}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bolinhas indicadoras de páginas do Carrossel */}
        {totalHighlightPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {Array.from({ length: totalHighlightPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setHighlightPage(idx)}
                aria-label={`Ir para página ${idx + 1} dos destaques`}
                className={`h-1.5 rounded-full transition-all ${
                  safeHighlightPage === idx
                    ? 'w-6 bg-pink-400'
                    : 'w-1.5 bg-[#322B40] hover:bg-[#A89FBD]'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* 2. GRID PRINCIPAL: AULAS DE HOJE + AGENDA DO DIA + QUICK NOTES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Aulas da Faculdade */}
        <div className="lg:col-span-4 bg-[#211C2B] border border-[#322B40] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F5F2F8]">
                    Aulas da Faculdade
                  </h3>
                  <p className="text-xs text-[#A89FBD]">
                    {DAY_OF_WEEK_LABELS[selectedClassDay]}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-[#16131D] p-1 rounded-xl border border-[#322B40]">
                {([1, 2, 3, 4, 5] as DayOfWeek[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedClassDay(d)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${
                      selectedClassDay === d
                        ? 'bg-purple-400 text-[#16131D]'
                        : 'text-[#A89FBD] hover:text-[#F5F2F8]'
                    }`}
                  >
                    {DAY_OF_WEEK_SHORT[d]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {todaysClasses.length === 0 ? (
                <div className="p-6 rounded-xl bg-[#16131D] border border-[#322B40] text-center space-y-2">
                  <BookOpen className="w-6 h-6 text-purple-300/60 mx-auto" />
                  <p className="text-xs text-[#A89FBD]">
                    Sem aulas cadastradas para {DAY_OF_WEEK_LABELS[selectedClassDay]}.
                  </p>
                </div>
              ) : (
                todaysClasses.map((cls) => (
                  <div
                    key={cls.id}
                    onClick={() => setActiveTab('college')}
                    className="cursor-pointer p-4 rounded-xl border-l-4 border-l-purple-400 bg-purple-500/15 border border-purple-400/25 hover:bg-purple-500/25 transition space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/25 text-purple-200 border border-purple-400/30">
                        <Clock className="w-3 h-3" />
                        {cls.startTime} - {cls.endTime}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-200">
                        <MapPin className="w-3 h-3 text-purple-300" />
                        {cls.room}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#F5F2F8]">
                      {cls.subjectName}
                    </h4>
                    {cls.professor && (
                      <p className="text-xs text-[#A89FBD] flex items-center gap-1">
                        <User className="w-3 h-3 text-purple-300" />
                        {cls.professor}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('college')}
            className="mt-4 w-full py-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/30 text-xs font-semibold text-purple-300 transition flex items-center justify-center gap-1.5"
          >
            <span>Abrir Grade & Notas do Tablet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Agenda do Dia */}
        <div className="lg:col-span-4 bg-[#211C2B] border border-[#322B40] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-400/30 flex items-center justify-center text-pink-300">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F5F2F8]">
                    Agenda do Dia
                  </h3>
                  <p className="text-xs text-[#A89FBD]">
                    Compromissos de hoje por horário
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('calendar')}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-pink-500/15 text-pink-300 border border-pink-400/30 hover:bg-pink-500/25 transition"
              >
                + Novo
              </button>
            </div>

            <div className="space-y-3">
              {todaysEvents.length === 0 ? (
                <div className="p-6 rounded-xl bg-[#16131D] border border-[#322B40] text-center space-y-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-300/70 mx-auto" />
                  <p className="text-xs text-[#A89FBD]">
                    Agenda livre para hoje!
                  </p>
                </div>
              ) : (
                todaysEvents.map((ev) => {
                  const st = getCategoryStyle(ev.category);
                  return (
                    <div
                      key={ev.id}
                      onClick={() => setActiveTab('calendar')}
                      className={`cursor-pointer p-3.5 rounded-xl transition space-y-1.5 ${st.cardClass}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-bold ${st.textClass}`}>
                          {ev.startTime} - {ev.endTime}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {ev.recurrence !== 'unico' && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-[#16131D]/60 text-[#A89FBD]">
                              <Repeat className="w-2.5 h-2.5" />
                              {ev.recurrence}
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${st.badgeClass}`}
                          >
                            {st.shortLabel}
                          </span>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-[#F5F2F8]">
                        {ev.title}
                      </h4>

                      {ev.locationOrLink && (
                        <p className="text-[11px] text-[#A89FBD] truncate">
                          📍 {ev.locationOrLink}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('calendar')}
            className="mt-4 w-full py-2.5 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-400/30 text-xs font-semibold text-pink-300 transition flex items-center justify-center gap-1.5"
          >
            <span>Ver Calendário Completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bloco de Notas Rápidas (Quick Notes) */}
        <div className="lg:col-span-4 bg-gradient-to-b from-[#261D30] to-[#211C2B] border-l-4 border-l-pink-400 border border-pink-400/30 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-pink-300">
                <StickyNote className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#F5F2F8]">
                  Bloco de Notas Rápidas
                </h3>
                <p className="text-[11px] text-pink-300">
                  Post-it Pessoal • Auto-save
                </p>
              </div>
            </div>

            <span className="text-[11px] text-[#A89FBD] bg-[#16131D]/80 px-2.5 py-1 rounded-full border border-[#322B40]">
              Salvo às {quickNotesUpdatedAt}
            </span>
          </div>

          <textarea
            value={quickNotes}
            onChange={(e) => updateQuickNotes(e.target.value)}
            placeholder="Digite lembretes rápidos, ideias, links ou tarefas urgentes aqui..."
            rows={8}
            className="w-full flex-1 rounded-xl bg-[#16131D]/90 border border-pink-400/30 focus:border-pink-400 focus:outline-none p-3.5 text-sm text-[#F5F2F8] placeholder-[#A89FBD]/50 leading-relaxed resize-none"
          />

          <div className="mt-3 flex items-center justify-between text-[11px] text-[#A89FBD]">
            <span>✨ Salvo automaticamente</span>
            <button
              onClick={() => updateQuickNotes('')}
              className="text-[#A89FBD] hover:text-rose-300 transition"
            >
              Limpar nota
            </button>
          </div>
        </div>
      </div>

      {/* 3. RESUMO SEMANAL ABERTO (7 COLUNAS SEGUNDA A DOMINGO JÁ ABERTAS) */}
      <section className="bg-[#211C2B] border border-[#322B40] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck2 className="w-5 h-5 text-pink-300" />
            <h3 className="text-base font-bold text-[#F5F2F8]">
              Resumo Semanal (Segunda a Domingo)
            </h3>
          </div>
          <span className="text-xs text-[#A89FBD]">
            Visão completa da semana sem precisar clicar
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
          {openWeekDays.map((day) => (
            <div
              key={day.isoDate}
              className={`rounded-2xl p-3.5 border flex flex-col min-h-[230px] ${
                day.isToday
                  ? 'bg-[#1B1624] border-pink-400 ring-1 ring-pink-400/40 shadow-md'
                  : 'bg-[#16131D] border-[#322B40]'
              }`}
            >
              {/* Cabeçalho do Dia */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#322B40]">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs font-bold uppercase ${
                      day.isToday ? 'text-pink-300' : 'text-[#A89FBD]'
                    }`}
                  >
                    {day.dayNameShort}
                  </span>
                  <span className="text-base font-bold text-[#F5F2F8]">
                    {day.dayNumber}
                  </span>
                </div>
                {day.isToday ? (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-pink-400 text-[#16131D]">
                    HOJE
                  </span>
                ) : (
                  day.items.length > 0 && (
                    <span className="text-[10px] font-semibold text-[#A89FBD]">
                      {day.items.length} item(s)
                    </span>
                  )
                )}
              </div>

              {/* Lista Direta das Atividades do Dia */}
              <div className="space-y-2 flex-1">
                {day.items.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-[#A89FBD]/40 py-6">
                    Livre
                  </div>
                ) : (
                  day.items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-xl text-left ${item.styleClass}`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-[10px] font-bold ${item.textClass}`}
                        >
                          {item.time}
                        </span>
                        <span className="text-[9px] text-[#A89FBD] truncate">
                          {item.tag}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-[#F5F2F8] line-clamp-2 leading-snug mt-0.5">
                        {item.title}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
