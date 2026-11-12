import React, { useMemo, useRef, useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Repeat,
  Star,
  Trash2,
  Edit3,
  MapPin,
  X,
  Maximize2,
  Minimize2,
  Smartphone,
} from 'lucide-react';
import { usePlannerStore } from '../store/usePlannerStore';
import { CalendarEvent, EventCategory, RecurrenceRule } from '../types';
import {
  formatFullDatePtBR,
  getEventsForDate,
  toISODateString,
} from '../utils/dateUtils';
import { CATEGORY_STYLES, getCategoryStyle } from '../utils/categoryStyles';

const RECURRENCE_LABELS: Record<RecurrenceRule, string> = {
  unico: 'Único (Não se repete)',
  semanal: 'Semanal (Toda semana)',
  quinzenal: 'Quinzenal (A cada 14 dias)',
  mensal: 'Mensal (Todo mês neste dia)',
  anual: 'Anual (Aniversários / Datas fixas)',
};

export const CalendarView: React.FC = () => {
  const {
    events = [],
    collegeSubjects = [],
    jobs = [],
    addEvent,
    updateEvent,
    deleteEvent,
  } = usePlannerStore();

  const todayIso = toISODateString(new Date());
  const [selectedDateIso, setSelectedDateIso] = useState<string>(todayIso);
  const [isFullWidthCalendar, setIsFullWidthCalendar] = useState(false);
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // Modal de Compromissos do Dia (aberto ao segurar o dia no celular/tablet)
  const [dayDetailsModalIso, setDayDetailsModalIso] = useState<string | null>(
    null
  );
  const longPressTimerRef = useRef<number | null>(null);
  const longPressTriggeredRef = useRef<boolean>(false);

  // Modal de Criar/Editar Compromisso
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayIso);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [category, setCategory] = useState<EventCategory>('rotina');
  const [recurrence, setRecurrence] = useState<RecurrenceRule>('unico');
  const [isHighlight, setIsHighlight] = useState(false);
  const [locationOrLink, setLocationOrLink] = useState('');
  const [notes, setNotes] = useState('');

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleTouchStartDay = (isoDate: string) => {
    clearLongPressTimer();
    longPressTriggeredRef.current = false;
    longPressTimerRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true;
      setSelectedDateIso(isoDate);
      setDayDetailsModalIso(isoDate);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(30);
      }
    }, 420);
  };

  const handleTouchEndDay = () => {
    clearLongPressTimer();
  };

  const handleTouchMoveDay = () => {
    clearLongPressTimer();
  };

  const openNewEventModal = (defaultDate?: string) => {
    setEditingEventId(null);
    setTitle('');
    setDate(defaultDate || selectedDateIso);
    setStartTime('09:00');
    setEndTime('10:00');
    setCategory('rotina');
    setRecurrence('unico');
    setIsHighlight(false);
    setLocationOrLink('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditEventModal = (ev: CalendarEvent) => {
    setEditingEventId(ev.id);
    setTitle(ev.title);
    setDate(ev.date);
    setStartTime(ev.startTime);
    setEndTime(ev.endTime);
    setCategory(ev.category);
    setRecurrence(ev.recurrence);
    setIsHighlight(ev.isHighlight);
    setLocationOrLink(ev.locationOrLink || '');
    setNotes(ev.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const autoHighlight =
      isHighlight || category === 'entrevista' || category === 'aniversario';

    if (editingEventId) {
      await updateEvent({
        id: editingEventId,
        title: title.trim(),
        date,
        startTime,
        endTime,
        category,
        recurrence,
        isHighlight: autoHighlight,
        locationOrLink: locationOrLink.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      await addEvent({
        title: title.trim(),
        date,
        startTime,
        endTime,
        category,
        recurrence,
        isHighlight: autoHighlight,
        locationOrLink: locationOrLink.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    }
    setIsModalOpen(false);
  };

  // Mapeia Provas e Trabalhos das Unidades da Faculdade como eventos visuais no calendário
  const collegeCalendarEvents = useMemo<CalendarEvent[]>(() => {
    const list: CalendarEvent[] = [];
    for (const subj of collegeSubjects) {
      for (const unit of subj.units) {
        for (const ass of unit.assessments) {
          if (ass.completed) continue;
          list.push({
            id: `college-ass-${ass.id}`,
            title: `${ass.type === 'prova' ? 'Prova' : 'Entrega'}: ${ass.title}`,
            date: ass.dueDate,
            startTime: ass.startTime || '23:59',
            endTime: ass.startTime || '23:59',
            category: 'faculdade',
            recurrence: 'unico',
            isHighlight: true,
            locationOrLink: `${subj.name} • ${unit.title}`,
          });
        }
      }
    }
    return list;
  }, [collegeSubjects]);

  const allCombinedEvents = useMemo(() => {
    const jobEvents: CalendarEvent[] = jobs
      .filter(
        (j) =>
          j.nextStepDate && !['reprovado', 'desistencia'].includes(j.status)
      )
      .map((j) => ({
        id: `job-step-${j.id}`,
        title: `${j.company}: ${j.nextStep || j.title}`,
        date: j.nextStepDate!,
        startTime: '09:00',
        endTime: '10:00',
        category: 'entrevista' as const,
        recurrence: 'unico' as const,
        isHighlight: true,
        locationOrLink: `Vaga: ${j.title}`,
      }));

    return [...events, ...collegeCalendarEvents, ...jobEvents];
  }, [events, collegeCalendarEvents, jobs]);

  const calendarDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startOffset = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();

    const cells: {
      isoDate: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      dayEvents: CalendarEvent[];
    }[] = [];

    for (let i = startOffset - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      const iso = toISODateString(d);
      cells.push({
        isoDate: iso,
        dayNumber: d.getDate(),
        isCurrentMonth: false,
        isToday: iso === todayIso,
        dayEvents: getEventsForDate(allCombinedEvents, iso),
      });
    }

    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(year, month, day);
      const iso = toISODateString(d);
      cells.push({
        isoDate: iso,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: iso === todayIso,
        dayEvents: getEventsForDate(allCombinedEvents, iso),
      });
    }

    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const iso = toISODateString(d);
      cells.push({
        isoDate: iso,
        dayNumber: d.getDate(),
        isCurrentMonth: false,
        isToday: iso === todayIso,
        dayEvents: getEventsForDate(allCombinedEvents, iso),
      });
    }

    return cells;
  }, [currentMonthDate, allCombinedEvents, todayIso]);

  const selectedDayEvents = useMemo(
    () => getEventsForDate(allCombinedEvents, selectedDateIso),
    [allCombinedEvents, selectedDateIso]
  );

  const modalDayEvents = useMemo(
    () =>
      dayDetailsModalIso
        ? getEventsForDate(allCombinedEvents, dayDetailsModalIso)
        : [],
    [allCombinedEvents, dayDetailsModalIso]
  );

  const monthTitle = currentMonthDate.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-4 sm:space-y-6 pb-16 lg:pb-8">
      {/* Header do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-[#211C2B] border border-[#322B40] rounded-2xl p-4 sm:p-5 shadow-lg">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-400/30 text-rose-300 text-xs font-semibold mb-1.5">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Agenda & Recorrência Automática</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-[#F5F2F8]">
            Agenda & Calendário
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsFullWidthCalendar((prev) => !prev)}
            className="hidden xl:inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#16131D] text-[#A89FBD] hover:text-[#F5F2F8] border border-[#322B40] text-xs font-semibold transition"
            title="Alternar largura total do calendário"
          >
            {isFullWidthCalendar ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-pink-300" />
                <span>Mostrar Painel Lateral</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-pink-300" />
                <span>Calendário Tela Cheia</span>
              </>
            )}
          </button>

          <button
            onClick={() => openNewEventModal(selectedDateIso)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-pink-400 hover:bg-pink-300 text-[#16131D] font-bold text-xs shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Compromisso</span>
          </button>
        </div>
      </div>

      {/* Layout Principal: Calendário Responsivo + Linha do Tempo */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
        {/* CALENDÁRIO MENSAL OTIMIZADO PARA CELULAR, TABLET E DESKTOP */}
        <div
          className={`${
            isFullWidthCalendar ? 'xl:col-span-12' : 'xl:col-span-9'
          } bg-[#211C2B] border border-[#322B40] rounded-2xl p-2.5 sm:p-5 lg:p-6 shadow-lg`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 sm:mb-5 px-1 sm:px-0">
            <div>
              <h3 className="text-base sm:text-xl font-bold text-[#F5F2F8] capitalize">
                {monthTitle}
              </h3>
              <p className="xl:hidden flex items-center gap-1 text-[11px] text-[#A89FBD] mt-0.5">
                <Smartphone className="w-3 h-3 text-pink-300 shrink-0" />
                <span>
                  Aperte e segure em um dia para abrir os compromissos
                </span>
              </p>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2">
              <button
                onClick={() => {
                  const now = new Date();
                  setCurrentMonthDate(
                    new Date(now.getFullYear(), now.getMonth(), 1)
                  );
                  setSelectedDateIso(todayIso);
                }}
                className="px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#16131D] text-pink-300 border border-pink-400/30 hover:bg-pink-500/15 transition"
              >
                Hoje
              </button>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    setCurrentMonthDate(
                      new Date(
                        currentMonthDate.getFullYear(),
                        currentMonthDate.getMonth() - 1,
                        1
                      )
                    )
                  }
                  className="p-2 rounded-xl bg-[#16131D] text-[#A89FBD] hover:text-[#F5F2F8] border border-[#322B40]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setCurrentMonthDate(
                      new Date(
                        currentMonthDate.getFullYear(),
                        currentMonthDate.getMonth() + 1,
                        1
                      )
                    )
                  }
                  className="p-2 rounded-xl bg-[#16131D] text-[#A89FBD] hover:text-[#F5F2F8] border border-[#322B40]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Cabeçalho Dias da Semana */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:gap-2.5 mb-1.5 sm:mb-2.5 text-center">
            {[
              { mobile: 'D', short: 'Dom', full: 'Domingo' },
              { mobile: 'S', short: 'Seg', full: 'Segunda' },
              { mobile: 'T', short: 'Ter', full: 'Terça' },
              { mobile: 'Q', short: 'Qua', full: 'Quarta' },
              { mobile: 'Q', short: 'Qui', full: 'Quinta' },
              { mobile: 'S', short: 'Sex', full: 'Sexta' },
              { mobile: 'S', short: 'Sáb', full: 'Sábado' },
            ].map((d, idx) => (
              <div
                key={`${d.short}-${idx}`}
                className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#A89FBD] py-1 sm:py-1.5 bg-[#16131D]/60 rounded-lg border border-[#322B40]/60"
              >
                <span className="sm:hidden">{d.short}</span>
                <span className="hidden sm:inline lg:hidden">{d.short}</span>
                <span className="hidden lg:inline">{d.full}</span>
              </div>
            ))}
          </div>

          {/* Grade de Dias do Mês */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:gap-2.5 select-none">
            {calendarDays.map((cell) => {
              const isSelected = cell.isoDate === selectedDateIso;
              return (
                <button
                  key={cell.isoDate}
                  type="button"
                  onClick={() => {
                    if (longPressTriggeredRef.current) {
                      longPressTriggeredRef.current = false;
                      return;
                    }
                    setSelectedDateIso(cell.isoDate);
                  }}
                  onDoubleClick={() => openNewEventModal(cell.isoDate)}
                  onTouchStart={() => handleTouchStartDay(cell.isoDate)}
                  onTouchEnd={handleTouchEndDay}
                  onTouchMove={handleTouchMoveDay}
                  onTouchCancel={handleTouchEndDay}
                  onContextMenu={(e) => {
                    // Ao segurar em telas touch (Android/iOS/Tablet), evita o menu nativo e abre os compromissos do dia
                    e.preventDefault();
                    setSelectedDateIso(cell.isoDate);
                    setDayDetailsModalIso(cell.isoDate);
                  }}
                  className={`min-h-[76px] sm:min-h-[112px] lg:min-h-[150px] p-1 sm:p-2.5 lg:p-3 rounded-xl sm:rounded-2xl border text-left flex flex-col justify-between transition-all overflow-hidden ${
                    isSelected
                      ? 'bg-[#292336] border-pink-400 ring-1 ring-pink-400/50 shadow-md'
                      : cell.isToday
                      ? 'bg-[#1B1624] border-purple-400/70'
                      : cell.isCurrentMonth
                      ? 'bg-[#16131D] border-[#322B40] hover:border-[#A89FBD]/50'
                      : 'bg-[#16131D]/40 border-[#322B40]/40 opacity-40'
                  }`}
                >
                  {/* Topo da célula: número do dia + contador */}
                  <div className="flex items-center justify-between w-full mb-1">
                    <span
                      className={`text-[11px] sm:text-sm font-bold w-5 h-5 sm:w-7 sm:h-7 rounded-md sm:rounded-lg flex items-center justify-center ${
                        cell.isToday
                          ? 'bg-pink-400 text-[#16131D]'
                          : isSelected
                          ? 'bg-pink-500/20 text-pink-300'
                          : 'text-[#F5F2F8]'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>
                    {cell.dayEvents.length > 0 && (
                      <span className="px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-[#211C2B] text-pink-300 sm:text-[#A89FBD] border border-[#322B40]">
                        {cell.dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Visualização Mobile (< 640px): Pílulas ultra-compactas + pontos de cor */}
                  <div className="sm:hidden space-y-0.5 w-full overflow-hidden flex-1">
                    {cell.dayEvents.slice(0, 2).map((ev) => {
                      const st = getCategoryStyle(ev.category);
                      return (
                        <div
                          key={`mob-${ev.id}-${cell.isoDate}`}
                          className={`px-1 py-0.5 rounded text-[9px] leading-tight font-semibold truncate ${st.cardClass}`}
                        >
                          <span className="text-[#F5F2F8]">{ev.title}</span>
                        </div>
                      );
                    })}
                    {cell.dayEvents.length > 2 && (
                      <div className="text-[8.5px] text-pink-300 font-bold pl-0.5 leading-tight">
                        +{cell.dayEvents.length - 2} mais
                      </div>
                    )}
                  </div>

                  {/* Visualização Tablet & Desktop (>= 640px): Pílulas completas com horário */}
                  <div className="hidden sm:block space-y-1.5 w-full overflow-hidden flex-1">
                    {cell.dayEvents.slice(0, 3).map((ev) => {
                      const st = getCategoryStyle(ev.category);
                      return (
                        <div
                          key={`${ev.id}-${cell.isoDate}`}
                          className={`px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-lg text-[10px] lg:text-[11px] font-semibold truncate ${st.cardClass}`}
                        >
                          <span className={`font-bold mr-1 ${st.textClass}`}>
                            {ev.startTime}
                          </span>
                          <span className="text-[#F5F2F8]">{ev.title}</span>
                        </div>
                      );
                    })}
                    {cell.dayEvents.length > 3 && (
                      <div className="text-[10px] text-pink-300 font-semibold pl-1">
                        +{cell.dayEvents.length - 3} compromisso(s)
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* LINHA DO TEMPO DE HORÁRIOS DO DIA SELECIONADO */}
        <div
          className={`${
            isFullWidthCalendar ? 'xl:col-span-12' : 'xl:col-span-3'
          } bg-[#211C2B] border border-[#322B40] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-lg`}
        >
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#322B40]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-pink-300">
                  Linha do Tempo do Dia
                </span>
                <h3 className="text-base font-bold text-[#F5F2F8] capitalize mt-0.5">
                  {formatFullDatePtBR(selectedDateIso)}
                </h3>
              </div>
              <button
                onClick={() => openNewEventModal(selectedDateIso)}
                className="p-2.5 rounded-xl bg-pink-500/15 text-pink-300 hover:bg-pink-500/25 border border-pink-400/30 transition"
                title="Adicionar compromisso neste dia"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {selectedDayEvents.length === 0 ? (
              <div className="py-10 sm:py-12 px-4 text-center rounded-2xl bg-[#16131D] border border-[#322B40] space-y-2">
                <p className="text-sm font-medium text-[#F5F2F8]">
                  Dia livre na agenda
                </p>
                <p className="text-xs text-[#A89FBD]">
                  Clique em "+ Novo Compromisso" (ou segure em um dia no celular/tablet) para ver ou agendar.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayEvents.map((ev) => {
                  const st = getCategoryStyle(ev.category);
                  const isFromCollegeUnit =
                    ev.id.startsWith('college-ass-') ||
                    ev.id.startsWith('job-step-');

                  return (
                    <div
                      key={ev.id}
                      className={`p-4 rounded-xl space-y-2 transition ${st.cardClass}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold ${st.badgeClass}`}
                          >
                            <Clock className="w-3 h-3" />
                            {ev.startTime}
                            {ev.endTime !== ev.startTime ? ` - ${ev.endTime}` : ''}
                          </span>

                          {ev.recurrence !== 'unico' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#16131D]/70 text-[#F5F2F8]">
                              <Repeat className="w-3 h-3" />
                              {ev.recurrence === 'quinzenal'
                                ? '14 dias'
                                : ev.recurrence}
                            </span>
                          )}

                          {ev.isHighlight && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/25 text-rose-300">
                              <Star className="w-2.5 h-2.5 fill-current" />
                            </span>
                          )}
                        </div>

                        {!isFromCollegeUnit && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => openEditEventModal(ev)}
                              className="p-1 rounded-lg text-[#A89FBD] hover:text-[#F5F2F8]"
                              title="Editar"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteEvent(ev.id)}
                              className="p-1 rounded-lg text-[#A89FBD] hover:text-rose-300"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-[#F5F2F8]">
                        {ev.title}
                      </h4>

                      {ev.locationOrLink && (
                        <div className="flex items-center gap-1.5 text-xs text-[#A89FBD]">
                          <MapPin className="w-3.5 h-3.5 text-pink-300 shrink-0" />
                          <span>{ev.locationOrLink}</span>
                        </div>
                      )}

                      {ev.notes && (
                        <p className="text-xs text-[#A89FBD] bg-[#16131D]/70 p-2.5 rounded-xl">
                          {ev.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL / BOTTOM SHEET DE COMPROMISSOS DO DIA (AO APERTAR E SEGURAR NO CELULAR/TABLET) */}
      {dayDetailsModalIso && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4"
          onClick={() => setDayDetailsModalIso(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#211C2B] border-t sm:border border-[#322B40] rounded-t-3xl sm:rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4"
          >
            {/* Indicador de puxar no mobile */}
            <div className="w-12 h-1.5 bg-[#322B40] rounded-full mx-auto sm:hidden" />

            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#322B40]">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-pink-300">
                  Compromissos do Dia
                </span>
                <h3 className="text-lg font-bold text-[#F5F2F8] capitalize mt-0.5">
                  {formatFullDatePtBR(dayDetailsModalIso)}
                </h3>
              </div>
              <button
                onClick={() => setDayDetailsModalIso(null)}
                className="p-1.5 rounded-xl bg-[#16131D] text-[#A89FBD] hover:text-[#F5F2F8] border border-[#322B40]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalDayEvents.length === 0 ? (
              <div className="py-8 px-4 text-center rounded-2xl bg-[#16131D] border border-[#322B40] space-y-1.5">
                <p className="text-sm font-semibold text-[#F5F2F8]">
                  Nenhum compromisso neste dia
                </p>
                <p className="text-xs text-[#A89FBD]">
                  Toque no botão abaixo para adicionar um compromisso nesta data.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {modalDayEvents.map((ev) => {
                  const st = getCategoryStyle(ev.category);
                  const isFromCollegeUnit =
                    ev.id.startsWith('college-ass-') ||
                    ev.id.startsWith('job-step-');

                  return (
                    <div
                      key={`modal-${ev.id}`}
                      className={`p-4 rounded-xl space-y-2 ${st.cardClass}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold ${st.badgeClass}`}
                          >
                            <Clock className="w-3 h-3" />
                            {ev.startTime}
                            {ev.endTime !== ev.startTime ? ` - ${ev.endTime}` : ''}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#16131D]/80 text-[#A89FBD]">
                            {st.label}
                          </span>
                        </div>

                        {!isFromCollegeUnit && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setDayDetailsModalIso(null);
                                openEditEventModal(ev);
                              }}
                              className="p-1.5 rounded-lg bg-[#16131D]/60 text-[#A89FBD] hover:text-[#F5F2F8]"
                              title="Editar"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteEvent(ev.id)}
                              className="p-1.5 rounded-lg bg-[#16131D]/60 text-[#A89FBD] hover:text-rose-300"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-[#F5F2F8]">
                        {ev.title}
                      </h4>

                      {ev.locationOrLink && (
                        <div className="flex items-center gap-1.5 text-xs text-[#A89FBD]">
                          <MapPin className="w-3.5 h-3.5 text-pink-300 shrink-0" />
                          <span>{ev.locationOrLink}</span>
                        </div>
                      )}

                      {ev.notes && (
                        <p className="text-xs text-[#A89FBD] bg-[#16131D]/70 p-2.5 rounded-xl">
                          {ev.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDayDetailsModalIso(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#16131D] text-[#A89FBD] border border-[#322B40]"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetDate = dayDetailsModalIso;
                  setDayDetailsModalIso(null);
                  openNewEventModal(targetDate);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-pink-400 text-[#16131D] hover:bg-pink-300 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Compromisso neste dia</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criar/Editar Compromisso */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#211C2B] border border-[#322B40] rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#322B40]">
              <h3 className="text-lg font-bold text-[#F5F2F8]">
                {editingEventId ? 'Editar Compromisso' : 'Novo Compromisso na Agenda'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-[#A89FBD] hover:text-[#F5F2F8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-[#A89FBD] mb-1.5">
                  Título do Compromisso *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Entrevista Front-end, Consulta, Reunião Quinzenal..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] focus:border-pink-400 focus:outline-none text-sm text-[#F5F2F8]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A89FBD] mb-1.5">
                    Data (Início) *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A89FBD] mb-1.5">
                    Início *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A89FBD] mb-1.5">
                    Término *
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A89FBD] mb-1.5">
                    Categoria com Cor
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as EventCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                  >
                    {Object.entries(CATEGORY_STYLES).map(([key, cfg]) => (
                      <option key={key} value={key}>
                        {cfg.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A89FBD] mb-1.5">
                    Regra de Recorrência
                  </label>
                  <select
                    value={recurrence}
                    onChange={(e) =>
                      setRecurrence(e.target.value as RecurrenceRule)
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                  >
                    {Object.entries(RECURRENCE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A89FBD] mb-1.5">
                  Local ou Link (Opcional)
                </label>
                <input
                  type="text"
                  value={locationOrLink}
                  onChange={(e) => setLocationOrLink(e.target.value)}
                  placeholder="Ex: Google Meet, Sala 204, Clínica..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A89FBD] mb-1.5">
                  Observações (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detalhes importantes..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8] resize-none"
                />
              </div>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#16131D] border border-rose-400/35 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-[#F5F2F8] block">
                    Marcar como Importante / Destaque no Dashboard
                  </span>
                  <span className="text-[11px] text-[#A89FBD]">
                    Exibe card com contagem regressiva ("Faltam X dias") no topo do Dashboard
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={
                    isHighlight ||
                    category === 'entrevista' ||
                    category === 'aniversario'
                  }
                  onChange={(e) => setIsHighlight(e.target.checked)}
                  className="w-5 h-5 accent-rose-400 rounded cursor-pointer"
                />
              </label>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#16131D] text-[#A89FBD] border border-[#322B40]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-pink-400 text-[#16131D] hover:bg-pink-300 transition"
                >
                  Salvar Compromisso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
