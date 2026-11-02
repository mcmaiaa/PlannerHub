import React, { useState } from 'react';
import {
  GraduationCap,
  CalendarRange,
  BookOpen,
  Plus,
  Upload,
  FileText,
  Eye,
  Trash2,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  Circle,
  AlertTriangle,
  X,
  Tablet,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
} from 'lucide-react';
import { usePlannerStore } from '../store/usePlannerStore';
import { CollegeSubject, DayOfWeek, FixedClassSlot } from '../types';
import {
  DAY_OF_WEEK_LABELS,
  DAY_OF_WEEK_SHORT,
  formatCountdownBadge,
  formatReadableDate,
  getDaysDifference,
  toISODateString,
} from '../utils/dateUtils';

interface DraftScheduleRow {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room: string;
}

export const CollegeView: React.FC = () => {
  const {
    fixedClasses = [],
    collegeSubjects = [],
    addFixedClass,
    updateFixedClass,
    deleteFixedClass,
    addCollegeSubject,
    setSubjectSchedules,
    deleteCollegeSubject,
    uploadUnitTabletNote,
    deleteUnitTabletNote,
    addUnitAssessment,
    toggleUnitAssessment,
    deleteUnitAssessment,
    setPreviewAttachment,
  } = usePlannerStore();

  const [subTab, setSubTab] = useState<'units' | 'schedule'>('units');
  const [activeUnitBySubject, setActiveUnitBySubject] = useState<
    Record<string, 1 | 2 | 3>
  >({});

  // Por padrão todas as disciplinas vêm abertas (minimized = false)
  const [minimizedSubjects, setMinimizedSubjects] = useState<
    Record<string, boolean>
  >({});

  const allMinimized =
    collegeSubjects.length > 0 &&
    collegeSubjects.every((s) => minimizedSubjects[s.id]);

  const toggleSubjectMinimize = (subjectId: string) => {
    setMinimizedSubjects((prev) => ({
      ...prev,
      [subjectId]: !prev[subjectId],
    }));
  };

  const toggleMinimizeAll = () => {
    if (allMinimized) {
      setMinimizedSubjects({});
    } else {
      const next: Record<string, boolean> = {};
      for (const s of collegeSubjects) {
        next[s.id] = true;
      }
      setMinimizedSubjects(next);
    }
  };

  // Modal Aula Grade Fixa (suporta adicionar múltiplos dias/horários de uma vez)
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClassSlot, setEditingClassSlot] =
    useState<FixedClassSlot | null>(null);
  const [classSubjectName, setClassSubjectName] = useState('');
  const [classProfessor, setClassProfessor] = useState('');
  const [classDefaultRoom, setClassDefaultRoom] = useState('');
  const [classScheduleRows, setClassScheduleRows] = useState<DraftScheduleRow[]>(
    [{ dayOfWeek: 1, startTime: '08:00', endTime: '10:00', room: '' }]
  );

  // Modal Nova Disciplina (já com múltiplos horários de uma vez)
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjProf, setNewSubjProf] = useState('');
  const [newSubjRoom, setNewSubjRoom] = useState('');
  const [newSubjSchedules, setNewSubjSchedules] = useState<DraftScheduleRow[]>([
    { dayOfWeek: 1, startTime: '08:00', endTime: '10:00', room: '' },
    { dayOfWeek: 3, startTime: '10:00', endTime: '12:00', room: '' },
  ]);

  // Modal Editar Todos os Horários de uma Disciplina Existente
  const [scheduleEditorSubject, setScheduleEditorSubject] =
    useState<CollegeSubject | null>(null);
  const [editorRows, setEditorRows] = useState<DraftScheduleRow[]>([]);

  // Modal Upload Nota Tablet
  const [uploadTarget, setUploadTarget] = useState<{
    subjectId: string;
    unitNumber: 1 | 2 | 3;
  } | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteDate, setNoteDate] = useState(toISODateString(new Date()));
  const [noteFile, setNoteFile] = useState<File | null>(null);

  // Modal Prova / Trabalho
  const [assessmentTarget, setAssessmentTarget] = useState<{
    subjectId: string;
    unitNumber: 1 | 2 | 3;
  } | null>(null);
  const [assTitle, setAssTitle] = useState('');
  const [assDate, setAssDate] = useState(toISODateString(new Date()));
  const [assTime, setAssTime] = useState('10:00');
  const [assType, setAssType] = useState<'prova' | 'trabalho'>('prova');

  const todayIso = toISODateString(new Date());

  const getActiveUnit = (subjectId: string): 1 | 2 | 3 =>
    activeUnitBySubject[subjectId] || 2;

  const setActiveUnit = (subjectId: string, unitNum: 1 | 2 | 3) => {
    setActiveUnitBySubject((prev) => ({ ...prev, [subjectId]: unitNum }));
  };

  const openAddClassModal = (defaultDay?: DayOfWeek) => {
    const firstSubj = collegeSubjects[0];
    setEditingClassSlot(null);
    setClassSubjectName(firstSubj?.name || '');
    setClassDefaultRoom(firstSubj?.room || '');
    setClassProfessor(firstSubj?.professor || '');
    setClassScheduleRows([
      {
        dayOfWeek: defaultDay || 1,
        startTime: '08:00',
        endTime: '10:00',
        room: firstSubj?.room || '',
      },
    ]);
    setIsClassModalOpen(true);
  };

  const openEditClassModal = (slot: FixedClassSlot) => {
    setEditingClassSlot(slot);
    setClassSubjectName(slot.subjectName);
    setClassDefaultRoom(slot.room);
    setClassProfessor(slot.professor);
    setClassScheduleRows([
      {
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        room: slot.room,
      },
    ]);
    setIsClassModalOpen(true);
  };

  const openSubjectScheduleEditor = (subject: CollegeSubject) => {
    const existingSlots = fixedClasses
      .filter(
        (c) =>
          c.subjectId === subject.id ||
          c.subjectName.toLowerCase() === subject.name.toLowerCase()
      )
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek);

    setScheduleEditorSubject(subject);
    if (existingSlots.length > 0) {
      setEditorRows(
        existingSlots.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          room: s.room,
        }))
      );
    } else {
      setEditorRows([
        {
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '10:00',
          room: subject.room || '',
        },
      ]);
    }
  };

  const handleSaveSubjectSchedules = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleEditorSubject) return;
    await setSubjectSchedules(
      scheduleEditorSubject.id,
      editorRows.map((r) => ({
        dayOfWeek: r.dayOfWeek,
        startTime: r.startTime,
        endTime: r.endTime,
        room: r.room.trim() || scheduleEditorSubject.room || 'Sala',
        professor: scheduleEditorSubject.professor,
      }))
    );
    setScheduleEditorSubject(null);
  };

  const handleSaveClassSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classSubjectName.trim() || classScheduleRows.length === 0) return;

    const matchedSubj = collegeSubjects.find(
      (s) => s.name.toLowerCase() === classSubjectName.trim().toLowerCase()
    );

    if (editingClassSlot) {
      const firstRow = classScheduleRows[0];
      await updateFixedClass({
        ...editingClassSlot,
        subjectId: matchedSubj?.id || editingClassSlot.subjectId,
        subjectName: classSubjectName.trim(),
        dayOfWeek: firstRow.dayOfWeek,
        startTime: firstRow.startTime,
        endTime: firstRow.endTime,
        room: firstRow.room.trim() || classDefaultRoom.trim() || 'A definir',
        professor: classProfessor.trim() || 'Professor(a)',
      });
    } else {
      for (const row of classScheduleRows) {
        await addFixedClass({
          subjectId: matchedSubj?.id || `custom-${Date.now()}`,
          subjectName: classSubjectName.trim(),
          dayOfWeek: row.dayOfWeek,
          startTime: row.startTime,
          endTime: row.endTime,
          room: row.room.trim() || classDefaultRoom.trim() || 'A definir',
          professor: classProfessor.trim() || 'Professor(a)',
        });
      }
    }
    setIsClassModalOpen(false);
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjName.trim()) return;

    const validSchedules = newSubjSchedules.map((r) => ({
      dayOfWeek: r.dayOfWeek,
      startTime: r.startTime,
      endTime: r.endTime,
      room: r.room.trim() || newSubjRoom.trim() || 'Sala',
      professor: newSubjProf.trim() || 'Professor(a)',
    }));

    await addCollegeSubject(
      {
        name: newSubjName.trim(),
        code: '',
        professor: newSubjProf.trim() || 'Professor(a)',
        room: newSubjRoom.trim() || 'Sala',
        colorAccent: 'lavender',
      },
      validSchedules
    );

    setNewSubjName('');
    setNewSubjProf('');
    setNewSubjRoom('');
    setNewSubjSchedules([
      { dayOfWeek: 1, startTime: '08:00', endTime: '10:00', room: '' },
      { dayOfWeek: 3, startTime: '10:00', endTime: '12:00', room: '' },
    ]);
    setIsSubjectModalOpen(false);
  };

  const handleUploadTabletNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTarget || !noteFile) return;
    await uploadUnitTabletNote(
      uploadTarget.subjectId,
      uploadTarget.unitNumber,
      noteFile,
      noteTitle.trim() || noteFile.name,
      noteDate
    );
    setUploadTarget(null);
    setNoteTitle('');
    setNoteFile(null);
  };

  const handleAddAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessmentTarget || !assTitle.trim()) return;
    await addUnitAssessment(
      assessmentTarget.subjectId,
      assessmentTarget.unitNumber,
      {
        title: assTitle.trim(),
        dueDate: assDate,
        startTime: assTime,
        type: assType,
        completed: false,
      }
    );
    setAssessmentTarget(null);
    setAssTitle('');
  };

  return (
    <div className="space-y-6 pb-16 lg:pb-8">
      {/* Header do Módulo Faculdade */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-[#211C2B] border border-[#322B40] rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="shrink-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-400/30 text-purple-300 text-xs font-semibold mb-1">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Módulo Acadêmico</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#F5F2F8]">
            Faculdade & Unidades
          </h2>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 overflow-x-auto">
          <div className="flex items-center bg-[#16131D] p-1 rounded-xl border border-[#322B40] shrink-0">
            <button
              onClick={() => setSubTab('units')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                subTab === 'units'
                  ? 'bg-purple-400 text-[#16131D] shadow'
                  : 'text-[#A89FBD] hover:text-[#F5F2F8]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>Disciplinas & Unidades</span>
            </button>

            <button
              onClick={() => setSubTab('schedule')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                subTab === 'schedule'
                  ? 'bg-purple-400 text-[#16131D] shadow'
                  : 'text-[#A89FBD] hover:text-[#F5F2F8]'
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5 shrink-0" />
              <span>Grade Horária</span>
            </button>
          </div>

          {subTab === 'units' && collegeSubjects.length > 0 && (
            <button
              onClick={toggleMinimizeAll}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#16131D] text-[#A89FBD] hover:text-[#F5F2F8] border border-[#322B40] font-semibold text-xs whitespace-nowrap shrink-0 transition"
            >
              {allMinimized ? (
                <>
                  <ChevronsDown className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                  <span>Expandir Todas</span>
                </>
              ) : (
                <>
                  <ChevronsUp className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                  <span>Minimizar Todas</span>
                </>
              )}
            </button>
          )}

          {subTab === 'units' ? (
            <button
              onClick={() => setIsSubjectModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-500/20 text-purple-200 border border-purple-400/40 hover:bg-purple-500/30 font-bold text-xs whitespace-nowrap shrink-0 transition"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Nova Disciplina</span>
            </button>
          ) : (
            <button
              onClick={() => openAddClassModal(1)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-500/20 text-purple-200 border border-purple-400/40 hover:bg-purple-500/30 font-bold text-xs whitespace-nowrap shrink-0 transition"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Adicionar Horários</span>
            </button>
          )}
        </div>
      </div>

      {/* ABA 1: GRADE HORÁRIA FIXA (SEGUNDA A SEXTA-FEIRA) */}
      {subTab === 'schedule' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {([1, 2, 3, 4, 5] as DayOfWeek[]).map((day) => {
            const daySlots = fixedClasses
              .filter((c) => c.dayOfWeek === day)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));

            return (
              <div
                key={day}
                className="bg-[#211C2B] border border-[#322B40] rounded-2xl p-4 flex flex-col justify-between min-h-[290px]"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#322B40]">
                    <span className="text-sm font-bold text-purple-300">
                      {DAY_OF_WEEK_LABELS[day]}
                    </span>
                    <button
                      onClick={() => openAddClassModal(day)}
                      className="p-1.5 rounded-lg bg-[#16131D] text-[#A89FBD] hover:text-purple-300 border border-[#322B40]"
                      title="Adicionar aula neste dia"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {daySlots.length === 0 ? (
                      <div className="py-8 text-center text-xs text-[#A89FBD]/60 border border-dashed border-[#322B40] rounded-xl">
                        Sem aulas fixas
                      </div>
                    ) : (
                      daySlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="p-3.5 rounded-xl border-l-4 border-l-purple-400 bg-purple-500/15 border border-purple-400/25 hover:bg-purple-500/25 transition space-y-2 group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-500/25 text-purple-200">
                              <Clock className="w-3 h-3" />
                              {slot.startTime} - {slot.endTime}
                            </span>

                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                              <button
                                onClick={() => openEditClassModal(slot)}
                                className="text-[11px] text-[#A89FBD] hover:text-[#F5F2F8] px-1"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => deleteFixedClass(slot.id)}
                                className="text-[#A89FBD] hover:text-rose-300 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <h4 className="text-xs font-bold text-[#F5F2F8] leading-snug">
                            {slot.subjectName}
                          </h4>

                          <div className="text-[11px] text-[#A89FBD] space-y-0.5">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-pink-300" />
                              <span>{slot.room}</span>
                            </div>
                            {slot.professor && (
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3 text-purple-300" />
                                <span className="truncate">{slot.professor}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ABA 2: DISCIPLINAS, UNIDADES (1ª, 2ª, 3ª) E UPLOAD DE NOTAS DO TABLET */}
      {subTab === 'units' && (
        <div className="grid grid-cols-1 gap-5">
          {collegeSubjects.map((subject) => {
            const isMinimized = Boolean(minimizedSubjects[subject.id]);
            const currentUnitNum = getActiveUnit(subject.id);
            const currentUnit =
              subject.units.find((u) => u.unitNumber === currentUnitNum) ||
              subject.units[0];

            const subjectSlots = fixedClasses
              .filter(
                (c) =>
                  c.subjectId === subject.id ||
                  c.subjectName.toLowerCase() === subject.name.toLowerCase()
              )
              .sort((a, b) => a.dayOfWeek - b.dayOfWeek);

            return (
              <div
                key={subject.id}
                className="bg-[#211C2B] border border-[#322B40] rounded-2xl overflow-hidden shadow-lg"
              >
                {/* Cabeçalho da Disciplina (Com opção de Minimizar / Expandir e Editar Horários) */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-[#261D30] to-[#211C2B] border-b border-[#322B40] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div
                    onClick={() => toggleSubjectMinimize(subject.id)}
                    className="space-y-1.5 cursor-pointer flex-1 min-w-0"
                  >
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <button
                        type="button"
                        className="p-1 rounded-lg bg-[#16131D] border border-[#322B40] text-purple-300 hover:text-[#F5F2F8] transition"
                        title={isMinimized ? 'Expandir disciplina' : 'Minimizar disciplina'}
                      >
                        {isMinimized ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronUp className="w-4 h-4" />
                        )}
                      </button>
                      <h4 className="text-base sm:text-lg font-bold text-[#F5F2F8]">
                        {subject.name}
                      </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#A89FBD]">
                      {subject.professor && (
                        <span className="inline-flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-purple-300" />
                          {subject.professor}
                        </span>
                      )}
                      {subject.room && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-pink-300" />
                          {subject.room}
                        </span>
                      )}
                      {subjectSlots.map((slot) => (
                        <span
                          key={slot.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#16131D] border border-[#322B40] text-[11px] text-purple-200 font-semibold"
                        >
                          <Clock className="w-3 h-3 text-purple-300" />
                          {DAY_OF_WEEK_SHORT[slot.dayOfWeek]} {slot.startTime}–{slot.endTime}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Ações e Abas de Unidades */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => openSubjectScheduleEditor(subject)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#16131D] text-purple-300 hover:bg-[#292336] border border-[#322B40] transition"
                      title="Gerenciar todos os horários desta disciplina de uma vez"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Horários</span>
                    </button>

                    {!isMinimized && (
                      <div className="flex items-center bg-[#16131D] p-1 rounded-xl border border-[#322B40]">
                        {([1, 2, 3] as (1 | 2 | 3)[]).map((uNum) => {
                          const unitObj = subject.units.find(
                            (u) => u.unitNumber === uNum
                          );
                          const countNotes = unitObj?.tabletNotes.length || 0;
                          const countAss = unitObj?.assessments.length || 0;
                          const isSelected = currentUnitNum === uNum;

                          return (
                            <button
                              key={uNum}
                              onClick={() => setActiveUnit(subject.id, uNum)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-purple-400 text-[#16131D]'
                                  : 'text-[#A89FBD] hover:text-[#F5F2F8]'
                              }`}
                            >
                              <span>{uNum}ª Unid</span>
                              {(countNotes > 0 || countAss > 0) && (
                                <span
                                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                    isSelected
                                      ? 'bg-[#16131D]/20 text-[#16131D]'
                                      : 'bg-[#211C2B] text-purple-300'
                                  }`}
                                >
                                  {countNotes + countAss}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleSubjectMinimize(subject.id)}
                      className="px-2.5 py-2 rounded-xl text-xs font-semibold bg-[#16131D] text-[#A89FBD] hover:text-[#F5F2F8] border border-[#322B40] transition"
                    >
                      {isMinimized ? 'Abrir' : 'Minimizar'}
                    </button>

                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `Remover a disciplina "${subject.name}"?`
                          )
                        ) {
                          deleteCollegeSubject(subject.id);
                        }
                      }}
                      className="p-2 rounded-xl text-[#A89FBD] hover:text-rose-300 hover:bg-[#16131D] border border-transparent hover:border-[#322B40] transition"
                      title="Excluir disciplina"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Corpo da Unidade: exibido apenas quando a disciplina não está minimizada */}
                {!isMinimized && (
                  <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Coluna 1: Upload de Arquivos do Tablet */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tablet className="w-4 h-4 text-purple-300" />
                          <h5 className="text-sm font-bold text-[#F5F2F8]">
                            Caderno & Notas do Tablet ({currentUnit.title})
                          </h5>
                        </div>

                        <button
                          onClick={() => {
                            setUploadTarget({
                              subjectId: subject.id,
                              unitNumber: currentUnit.unitNumber,
                            });
                            setNoteTitle('');
                            setNoteDate(todayIso);
                            setNoteFile(null);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 border border-purple-400/30 transition"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>+ PDF / Print</span>
                        </button>
                      </div>

                      {currentUnit.tabletNotes.length === 0 ? (
                        <div className="p-6 rounded-2xl bg-[#16131D] border border-dashed border-[#322B40] text-center space-y-1.5">
                          <FileText className="w-6 h-6 text-purple-300/50 mx-auto" />
                          <p className="text-xs text-[#A89FBD]">
                            Nenhuma nota anexada na {currentUnit.title}.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {currentUnit.tabletNotes.map((note) => (
                            <div
                              key={note.id}
                              className="p-3.5 rounded-xl border-l-4 border-l-purple-400 bg-purple-500/15 border border-purple-400/25 hover:bg-purple-500/20 transition flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                  <h6 className="text-xs font-bold text-[#F5F2F8] truncate">
                                    {note.title}
                                  </h6>
                                  <p className="text-[11px] text-[#A89FBD] truncate">
                                    {note.fileName} •{' '}
                                    {formatReadableDate(note.date)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => setPreviewAttachment(note)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/25 text-purple-200 hover:bg-purple-500/35 border border-purple-400/30 transition"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Abrir</span>
                                </button>
                                <button
                                  onClick={() =>
                                    deleteUnitTabletNote(
                                      subject.id,
                                      currentUnit.unitNumber,
                                      note.id,
                                      note.storageKey
                                    )
                                  }
                                  className="p-1.5 rounded-lg text-[#A89FBD] hover:text-rose-300"
                                  title="Remover anexo"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Coluna 2: Provas e Trabalhos da Unidade */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                          <h5 className="text-sm font-bold text-[#F5F2F8]">
                            Provas & Trabalhos ({currentUnit.title})
                          </h5>
                        </div>

                        <button
                          onClick={() => {
                            setAssessmentTarget({
                              subjectId: subject.id,
                              unitNumber: currentUnit.unitNumber,
                            });
                            setAssTitle('');
                            setAssDate(todayIso);
                            setAssType('prova');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-400/35 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Entrega/Prova</span>
                        </button>
                      </div>

                      {currentUnit.assessments.length === 0 ? (
                        <div className="p-6 rounded-2xl bg-[#16131D] border border-dashed border-[#322B40] text-center">
                          <p className="text-xs text-[#A89FBD]">
                            Nenhuma entrega cadastrada na {currentUnit.title}.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {currentUnit.assessments.map((ass) => {
                            const diff = getDaysDifference(todayIso, ass.dueDate);
                            const isProva = ass.type === 'prova';
                            return (
                              <div
                                key={ass.id}
                                className={`p-3.5 rounded-xl border-l-4 transition flex items-start justify-between gap-3 ${
                                  ass.completed
                                    ? 'border-l-[#322B40] bg-[#16131D] border border-[#322B40] opacity-60'
                                    : isProva
                                    ? 'border-l-rose-400 bg-rose-500/20 border border-rose-400/30'
                                    : 'border-l-purple-400 bg-purple-500/15 border border-purple-400/25'
                                }`}
                              >
                                <button
                                  onClick={() =>
                                    toggleUnitAssessment(
                                      subject.id,
                                      currentUnit.unitNumber,
                                      ass.id
                                    )
                                  }
                                  className="mt-0.5 text-rose-300 hover:scale-110 transition shrink-0"
                                >
                                  {ass.completed ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                                  ) : (
                                    <Circle className="w-4 h-4" />
                                  )}
                                </button>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                        isProva
                                          ? 'bg-rose-500/25 text-rose-300'
                                          : 'bg-purple-500/25 text-purple-300'
                                      }`}
                                    >
                                      {ass.type}
                                    </span>
                                    {!ass.completed && (
                                      <span
                                        className={`text-[11px] font-bold ${
                                          isProva ? 'text-rose-300' : 'text-purple-300'
                                        }`}
                                      >
                                        {formatCountdownBadge(diff)}
                                      </span>
                                    )}
                                  </div>
                                  <p
                                    className={`text-xs font-bold mt-1 ${
                                      ass.completed
                                        ? 'line-through text-[#A89FBD]'
                                        : 'text-[#F5F2F8]'
                                    }`}
                                  >
                                    {ass.title}
                                  </p>
                                  <p className="text-[11px] text-[#A89FBD] mt-0.5">
                                    Data: {formatReadableDate(ass.dueDate)}
                                    {ass.startTime ? ` às ${ass.startTime}` : ''}
                                  </p>
                                </div>

                                <button
                                  onClick={() =>
                                    deleteUnitAssessment(
                                      subject.id,
                                      currentUnit.unitNumber,
                                      ass.id
                                    )
                                  }
                                  className="p-1 text-[#A89FBD] hover:text-rose-300"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Gerenciar Todos os Horários de uma Disciplina de uma vez */}
      {scheduleEditorSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#211C2B] border border-[#322B40] rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#322B40]">
              <div>
                <h3 className="text-base font-bold text-[#F5F2F8]">
                  Horários da Disciplina
                </h3>
                <p className="text-xs text-purple-300 font-semibold">
                  {scheduleEditorSubject.name}
                </p>
              </div>
              <button
                onClick={() => setScheduleEditorSubject(null)}
                className="text-[#A89FBD] hover:text-[#F5F2F8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubjectSchedules} className="space-y-4 mt-4">
              <div className="space-y-2.5">
                {editorRows.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl bg-[#16131D] border border-[#322B40]"
                  >
                    <div className="col-span-4">
                      <label className="block text-[10px] text-[#A89FBD] mb-0.5">
                        Dia
                      </label>
                      <select
                        value={row.dayOfWeek}
                        onChange={(e) => {
                          const val = Number(e.target.value) as DayOfWeek;
                          setEditorRows((prev) =>
                            prev.map((r, i) =>
                              i === idx ? { ...r, dayOfWeek: val } : r
                            )
                          );
                        }}
                        className="w-full px-2 py-1.5 rounded-lg bg-[#211C2B] border border-[#322B40] text-xs text-[#F5F2F8]"
                      >
                        {([1, 2, 3, 4, 5] as DayOfWeek[]).map((d) => (
                          <option key={d} value={d}>
                            {DAY_OF_WEEK_LABELS[d]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-3">
                      <label className="block text-[10px] text-[#A89FBD] mb-0.5">
                        Início
                      </label>
                      <input
                        type="time"
                        required
                        value={row.startTime}
                        onChange={(e) =>
                          setEditorRows((prev) =>
                            prev.map((r, i) =>
                              i === idx ? { ...r, startTime: e.target.value } : r
                            )
                          )
                        }
                        className="w-full px-2 py-1.5 rounded-lg bg-[#211C2B] border border-[#322B40] text-xs text-[#F5F2F8]"
                      />
                    </div>

                    <div className="col-span-3">
                      <label className="block text-[10px] text-[#A89FBD] mb-0.5">
                        Fim
                      </label>
                      <input
                        type="time"
                        required
                        value={row.endTime}
                        onChange={(e) =>
                          setEditorRows((prev) =>
                            prev.map((r, i) =>
                              i === idx ? { ...r, endTime: e.target.value } : r
                            )
                          )
                        }
                        className="w-full px-2 py-1.5 rounded-lg bg-[#211C2B] border border-[#322B40] text-xs text-[#F5F2F8]"
                      />
                    </div>

                    <div className="col-span-2 flex justify-end pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          setEditorRows((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="p-1.5 rounded-lg text-[#A89FBD] hover:text-rose-300"
                        title="Remover este horário"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditorRows((prev) => [
                    ...prev,
                    {
                      dayOfWeek: 1,
                      startTime: '08:00',
                      endTime: '10:00',
                      room: scheduleEditorSubject.room || '',
                    },
                  ])
                }
                className="w-full py-2 rounded-xl border border-dashed border-purple-400/40 text-xs font-bold text-purple-300 hover:bg-purple-500/10 transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Adicionar outro dia/horário</span>
              </button>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleEditorSubject(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#16131D] text-[#A89FBD]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-400 text-[#16131D]"
                >
                  Salvar Todos os Horários
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Upload de Nota do Tablet */}
      {uploadTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#211C2B] border border-[#322B40] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#322B40]">
              <h3 className="text-base font-bold text-[#F5F2F8]">
                Anexar Nota do Tablet ({uploadTarget.unitNumber}ª Unidade)
              </h3>
              <button
                onClick={() => setUploadTarget(null)}
                className="text-[#A89FBD] hover:text-[#F5F2F8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadTabletNote} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                  Título do Assunto / Aula *
                </label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Ex: Resumo Aula 04 - Arquitetura Limpa"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                  Data da Aula
                </label>
                <input
                  type="date"
                  required
                  value={noteDate}
                  onChange={(e) => setNoteDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                  Arquivo do Tablet (.pdf, .png, .jpg) *
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                  onChange={(e) => setNoteFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-[#A89FBD] file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-500/20 file:text-purple-300 cursor-pointer bg-[#16131D] p-2 rounded-xl border border-[#322B40]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUploadTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#16131D] text-[#A89FBD]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-400 text-[#16131D]"
                >
                  Salvar Nota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nova Prova ou Trabalho */}
      {assessmentTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#211C2B] border border-[#322B40] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#322B40]">
              <h3 className="text-base font-bold text-[#F5F2F8]">
                Agendar Prova ou Entrega ({assessmentTarget.unitNumber}ª Unidade)
              </h3>
              <button
                onClick={() => setAssessmentTarget(null)}
                className="text-[#A89FBD] hover:text-[#F5F2F8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAssessment} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAssType('prova')}
                  className={`py-2 rounded-xl text-xs font-bold border ${
                    assType === 'prova'
                      ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                      : 'bg-[#16131D] border-[#322B40] text-[#A89FBD]'
                  }`}
                >
                  Prova
                </button>
                <button
                  type="button"
                  onClick={() => setAssType('trabalho')}
                  className={`py-2 rounded-xl text-xs font-bold border ${
                    assType === 'trabalho'
                      ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                      : 'bg-[#16131D] border-[#322B40] text-[#A89FBD]'
                  }`}
                >
                  Trabalho / Entrega
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                  Título / Assunto *
                </label>
                <input
                  type="text"
                  required
                  value={assTitle}
                  onChange={(e) => setAssTitle(e.target.value)}
                  placeholder="Ex: Prova 1ª Unidade"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={assDate}
                    onChange={(e) => setAssDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                    Horário
                  </label>
                  <input
                    type="time"
                    value={assTime}
                    onChange={(e) => setAssTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssessmentTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#16131D] text-[#A89FBD]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-400 text-[#16131D]"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adicionar / Editar Horários na Grade Fixa */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#211C2B] border border-[#322B40] rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#322B40]">
              <h3 className="text-base font-bold text-[#F5F2F8]">
                {editingClassSlot
                  ? 'Editar Aula da Grade'
                  : 'Adicionar Horários da Disciplina'}
              </h3>
              <button
                onClick={() => setIsClassModalOpen(false)}
                className="text-[#A89FBD] hover:text-[#F5F2F8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClassSlot} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                  Nome da Disciplina *
                </label>
                <input
                  type="text"
                  required
                  list="subject-suggestions"
                  value={classSubjectName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setClassSubjectName(val);
                    const matched = collegeSubjects.find(
                      (s) => s.name.toLowerCase() === val.trim().toLowerCase()
                    );
                    if (matched) {
                      setClassDefaultRoom(matched.room);
                      setClassProfessor(matched.professor);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                />
                <datalist id="subject-suggestions">
                  {collegeSubjects.map((s) => (
                    <option key={s.id} value={s.name} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                    Sala Padrão
                  </label>
                  <input
                    type="text"
                    value={classDefaultRoom}
                    onChange={(e) => setClassDefaultRoom(e.target.value)}
                    placeholder="Ex: CAA 303"
                    className="w-full px-3 py-2 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                    Professor(a)
                  </label>
                  <input
                    type="text"
                    value={classProfessor}
                    onChange={(e) => setClassProfessor(e.target.value)}
                    placeholder="Ex: Profa. Helena"
                    className="w-full px-3 py-2 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#A89FBD]">
                  Dias e Horários das Aulas *
                </label>
                {classScheduleRows.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl bg-[#16131D] border border-[#322B40]"
                  >
                    <div className="col-span-4">
                      <select
                        value={row.dayOfWeek}
                        onChange={(e) => {
                          const d = Number(e.target.value) as DayOfWeek;
                          setClassScheduleRows((prev) =>
                            prev.map((r, i) =>
                              i === idx ? { ...r, dayOfWeek: d } : r
                            )
                          );
                        }}
                        className="w-full px-2 py-1.5 rounded-lg bg-[#211C2B] border border-[#322B40] text-xs text-[#F5F2F8]"
                      >
                        {([1, 2, 3, 4, 5] as DayOfWeek[]).map((d) => (
                          <option key={d} value={d}>
                            {DAY_OF_WEEK_LABELS[d]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <input
                        type="time"
                        required
                        value={row.startTime}
                        onChange={(e) =>
                          setClassScheduleRows((prev) =>
                            prev.map((r, i) =>
                              i === idx
                                ? { ...r, startTime: e.target.value }
                                : r
                            )
                          )
                        }
                        className="w-full px-2 py-1.5 rounded-lg bg-[#211C2B] border border-[#322B40] text-xs text-[#F5F2F8]"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="time"
                        required
                        value={row.endTime}
                        onChange={(e) =>
                          setClassScheduleRows((prev) =>
                            prev.map((r, i) =>
                              i === idx ? { ...r, endTime: e.target.value } : r
                            )
                          )
                        }
                        className="w-full px-2 py-1.5 rounded-lg bg-[#211C2B] border border-[#322B40] text-xs text-[#F5F2F8]"
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      {classScheduleRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setClassScheduleRows((prev) =>
                              prev.filter((_, i) => i !== idx)
                            )
                          }
                          className="p-1.5 text-[#A89FBD] hover:text-rose-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {!editingClassSlot && (
                  <button
                    type="button"
                    onClick={() =>
                      setClassScheduleRows((prev) => [
                        ...prev,
                        {
                          dayOfWeek: 3,
                          startTime: '10:00',
                          endTime: '12:00',
                          room: classDefaultRoom,
                        },
                      ])
                    }
                    className="w-full py-2 rounded-xl border border-dashed border-purple-400/40 text-xs font-bold text-purple-300 hover:bg-purple-500/10 transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Adicionar outro dia/horário desta disciplina</span>
                  </button>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#16131D] text-[#A89FBD]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-400 text-[#16131D]"
                >
                  Salvar na Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cadastrar Nova Disciplina + Todos os Horários de uma vez */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#211C2B] border border-[#322B40] rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#322B40]">
              <h3 className="text-base font-bold text-[#F5F2F8]">
                Cadastrar Nova Disciplina & Horários
              </h3>
              <button
                onClick={() => setIsSubjectModalOpen(false)}
                className="text-[#A89FBD] hover:text-[#F5F2F8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                  Nome da Disciplina *
                </label>
                <input
                  type="text"
                  required
                  value={newSubjName}
                  onChange={(e) => setNewSubjName(e.target.value)}
                  placeholder="Ex: Engenharia de Software"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                    Sala / Laboratório
                  </label>
                  <input
                    type="text"
                    value={newSubjRoom}
                    onChange={(e) => setNewSubjRoom(e.target.value)}
                    placeholder="Ex: CAA 303"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                    Professor(a)
                  </label>
                  <input
                    type="text"
                    value={newSubjProf}
                    onChange={(e) => setNewSubjProf(e.target.value)}
                    placeholder="Ex: Prof. Thiago"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                  />
                </div>
              </div>

              {/* Horários da Disciplina de uma só vez */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#A89FBD]">
                    Horários das Aulas na Semana
                  </label>
                  <span className="text-[11px] text-purple-300">
                    Cadastra todos de uma vez
                  </span>
                </div>

                {newSubjSchedules.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl bg-[#16131D] border border-[#322B40]"
                  >
                    <div className="col-span-4">
                      <select
                        value={row.dayOfWeek}
                        onChange={(e) => {
                          const d = Number(e.target.value) as DayOfWeek;
                          setNewSubjSchedules((prev) =>
                            prev.map((r, i) =>
                              i === idx ? { ...r, dayOfWeek: d } : r
                            )
                          );
                        }}
                        className="w-full px-2 py-1.5 rounded-lg bg-[#211C2B] border border-[#322B40] text-xs text-[#F5F2F8]"
                      >
                        {([1, 2, 3, 4, 5] as DayOfWeek[]).map((d) => (
                          <option key={d} value={d}>
                            {DAY_OF_WEEK_LABELS[d]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <input
                        type="time"
                        required
                        value={row.startTime}
                        onChange={(e) =>
                          setNewSubjSchedules((prev) =>
                            prev.map((r, i) =>
                              i === idx
                                ? { ...r, startTime: e.target.value }
                                : r
                            )
                          )
                        }
                        className="w-full px-2 py-1.5 rounded-lg bg-[#211C2B] border border-[#322B40] text-xs text-[#F5F2F8]"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="time"
                        required
                        value={row.endTime}
                        onChange={(e) =>
                          setNewSubjSchedules((prev) =>
                            prev.map((r, i) =>
                              i === idx ? { ...r, endTime: e.target.value } : r
                            )
                          )
                        }
                        className="w-full px-2 py-1.5 rounded-lg bg-[#211C2B] border border-[#322B40] text-xs text-[#F5F2F8]"
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          setNewSubjSchedules((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                        className="p-1.5 text-[#A89FBD] hover:text-rose-300"
                        title="Remover horário"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setNewSubjSchedules((prev) => [
                      ...prev,
                      {
                        dayOfWeek: 5,
                        startTime: '14:00',
                        endTime: '16:00',
                        room: newSubjRoom,
                      },
                    ])
                  }
                  className="w-full py-2 rounded-xl border border-dashed border-purple-400/40 text-xs font-bold text-purple-300 hover:bg-purple-500/10 transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Adicionar outro dia/horário</span>
                </button>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#16131D] text-[#A89FBD]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-400 text-[#16131D]"
                >
                  Salvar Disciplina e Horários
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
