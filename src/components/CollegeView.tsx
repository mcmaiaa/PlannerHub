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
} from 'lucide-react';
import { usePlannerStore } from '../store/usePlannerStore';
import { DayOfWeek, FixedClassSlot } from '../types';
import {
  DAY_OF_WEEK_LABELS,
  formatCountdownBadge,
  formatReadableDate,
  getDaysDifference,
  toISODateString,
} from '../utils/dateUtils';

export const CollegeView: React.FC = () => {
  const {
    fixedClasses = [],
    collegeSubjects = [],
    addFixedClass,
    updateFixedClass,
    deleteFixedClass,
    addCollegeSubject,
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

  // Modal Aula Grade Fixa
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClassSlot, setEditingClassSlot] =
    useState<FixedClassSlot | null>(null);
  const [classSubjectName, setClassSubjectName] = useState('');
  const [classSelectedDays, setClassSelectedDays] = useState<DayOfWeek[]>([1]);
  const [classStartTime, setClassStartTime] = useState('08:00');
  const [classEndTime, setClassEndTime] = useState('10:00');
  const [classRoom, setClassRoom] = useState('');
  const [classProfessor, setClassProfessor] = useState('');

  // Modal Nova Disciplina
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjCode, setNewSubjCode] = useState('');
  const [newSubjProf, setNewSubjProf] = useState('');
  const [newSubjRoom, setNewSubjRoom] = useState('');

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
    activeUnitBySubject[subjectId] || 1;

  const setActiveUnit = (subjectId: string, unitNum: 1 | 2 | 3) => {
    setActiveUnitBySubject((prev) => ({ ...prev, [subjectId]: unitNum }));
  };

  const openAddClassModal = (defaultDay?: DayOfWeek) => {
    setEditingClassSlot(null);
    setClassSubjectName(collegeSubjects[0]?.name || '');
    setClassSelectedDays([defaultDay || 1]);
    setClassStartTime('08:00');
    setClassEndTime('10:00');
    setClassRoom(collegeSubjects[0]?.room || 'Sala 101');
    setClassProfessor(collegeSubjects[0]?.professor || '');
    setIsClassModalOpen(true);
  };

  const openEditClassModal = (slot: FixedClassSlot) => {
    setEditingClassSlot(slot);
    setClassSubjectName(slot.subjectName);
    setClassSelectedDays([slot.dayOfWeek]);
    setClassStartTime(slot.startTime);
    setClassEndTime(slot.endTime);
    setClassRoom(slot.room);
    setClassProfessor(slot.professor);
    setIsClassModalOpen(true);
  };

  const handleSaveClassSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classSubjectName.trim() || classSelectedDays.length === 0) return;

    const matchedSubj = collegeSubjects.find(
      (s) => s.name.toLowerCase() === classSubjectName.trim().toLowerCase()
    );

    if (editingClassSlot) {
      await updateFixedClass({
        ...editingClassSlot,
        subjectId: matchedSubj?.id || editingClassSlot.subjectId,
        subjectName: classSubjectName.trim(),
        dayOfWeek: classSelectedDays[0],
        startTime: classStartTime,
        endTime: classEndTime,
        room: classRoom.trim() || 'A definir',
        professor: classProfessor.trim() || 'Professor(a)',
      });
    } else {
      for (const d of classSelectedDays) {
        await addFixedClass({
          subjectId: matchedSubj?.id || `custom-${Date.now()}`,
          subjectName: classSubjectName.trim(),
          dayOfWeek: d,
          startTime: classStartTime,
          endTime: classEndTime,
          room: classRoom.trim() || 'A definir',
          professor: classProfessor.trim() || 'Professor(a)',
        });
      }
    }
    setIsClassModalOpen(false);
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjName.trim()) return;
    await addCollegeSubject({
      name: newSubjName.trim(),
      code: newSubjCode.trim() || 'DISC',
      professor: newSubjProf.trim() || 'Professor(a)',
      room: newSubjRoom.trim() || 'Sala',
      colorAccent: 'lavender',
    });
    setNewSubjName('');
    setNewSubjCode('');
    setNewSubjProf('');
    setNewSubjRoom('');
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#211C2B] border border-[#322B40] rounded-2xl p-5 shadow-lg">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-400/30 text-purple-300 text-xs font-semibold mb-1.5">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Módulo Acadêmico</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F5F2F8]">
            Faculdade • Grade, Unidades & Notas do Tablet
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-[#16131D] p-1 rounded-xl border border-[#322B40]">
            <button
              onClick={() => setSubTab('units')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                subTab === 'units'
                  ? 'bg-purple-400 text-[#16131D] shadow'
                  : 'text-[#A89FBD] hover:text-[#F5F2F8]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Disciplinas, Unidades & Tablet</span>
            </button>

            <button
              onClick={() => setSubTab('schedule')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                subTab === 'schedule'
                  ? 'bg-purple-400 text-[#16131D] shadow'
                  : 'text-[#A89FBD] hover:text-[#F5F2F8]'
              }`}
            >
              <CalendarRange className="w-4 h-4" />
              <span>Grade Horária Fixa (Seg-Sex)</span>
            </button>
          </div>

          {subTab === 'units' ? (
            <button
              onClick={() => setIsSubjectModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-500/20 text-purple-200 border border-purple-400/40 hover:bg-purple-500/30 font-bold text-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Disciplina</span>
            </button>
          ) : (
            <button
              onClick={() => openAddClassModal(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-500/20 text-purple-200 border border-purple-400/40 hover:bg-purple-500/30 font-bold text-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Aula</span>
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
        <div className="grid grid-cols-1 gap-6">
          {collegeSubjects.map((subject) => {
            const currentUnitNum = getActiveUnit(subject.id);
            const currentUnit =
              subject.units.find((u) => u.unitNumber === currentUnitNum) ||
              subject.units[0];

            return (
              <div
                key={subject.id}
                className="bg-[#211C2B] border border-[#322B40] rounded-2xl overflow-hidden shadow-lg"
              >
                {/* Cabeçalho Rico da Disciplina */}
                <div className="p-5 sm:p-6 bg-gradient-to-r from-[#261F33] to-[#211C2B] border-b border-[#322B40] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {subject.code && !subject.code.startsWith('2026.2') && (
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-400/35">
                          {subject.code}
                        </span>
                      )}
                      <h4 className="text-lg font-bold text-[#F5F2F8]">
                        {subject.name}
                      </h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#A89FBD]">
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
                    </div>
                  </div>

                  {/* Abas de Unidades (1ª Unidade, 2ª Unidade, 3ª Unidade) */}
                  <div className="flex items-center gap-2 flex-wrap">
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
                            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-purple-400 text-[#16131D]'
                                : 'text-[#A89FBD] hover:text-[#F5F2F8]'
                            }`}
                          >
                            <span>{uNum}ª Unidade</span>
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

                {/* Corpo da Unidade: 2 Colunas (Notas do Tablet + Provas/Trabalhos) */}
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
                        <span>+ PDF / Print do Tablet</span>
                      </button>
                    </div>

                    {currentUnit.tabletNotes.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-[#16131D] border border-dashed border-[#322B40] text-center space-y-1.5">
                        <FileText className="w-6 h-6 text-purple-300/50 mx-auto" />
                        <p className="text-xs text-[#A89FBD]">
                          Nenhuma nota do tablet anexada na {currentUnit.title}.
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
                                  {note.fileName} • Aula de{' '}
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
                                <span>Abrir Nota</span>
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
                        <span>Agendar Prova/Entrega</span>
                      </button>
                    </div>

                    {currentUnit.assessments.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-[#16131D] border border-dashed border-[#322B40] text-center">
                        <p className="text-xs text-[#A89FBD]">
                          Nenhuma prova ou entrega cadastrada na {currentUnit.title}.
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
              </div>
            );
          })}
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

      {/* Modal: Aula na Grade */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#211C2B] border border-[#322B40] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#322B40]">
              <h3 className="text-base font-bold text-[#F5F2F8]">
                {editingClassSlot
                  ? 'Editar Aula da Grade'
                  : 'Adicionar Aula na Grade Fixa'}
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
                  onChange={(e) => setClassSubjectName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                />
                <datalist id="subject-suggestions">
                  {collegeSubjects.map((s) => (
                    <option key={s.id} value={s.name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A89FBD] mb-1.5">
                  Dias da Semana *
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {([1, 2, 3, 4, 5] as DayOfWeek[]).map((d) => {
                    const selected = classSelectedDays.includes(d);
                    return (
                      <button
                        type="button"
                        key={d}
                        onClick={() => {
                          if (editingClassSlot) {
                            setClassSelectedDays([d]);
                          } else {
                            setClassSelectedDays((prev) =>
                              prev.includes(d)
                                ? prev.length > 1
                                  ? prev.filter((x) => x !== d)
                                  : prev
                                : [...prev, d]
                            );
                          }
                        }}
                        className={`py-2 rounded-xl text-xs font-bold border transition ${
                          selected
                            ? 'bg-purple-400 text-[#16131D] border-purple-400'
                            : 'bg-[#16131D] text-[#A89FBD] border-[#322B40]'
                        }`}
                      >
                        {DAY_OF_WEEK_LABELS[d].split('-')[0]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                    Início *
                  </label>
                  <input
                    type="time"
                    required
                    value={classStartTime}
                    onChange={(e) => setClassStartTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                    Término *
                  </label>
                  <input
                    type="time"
                    required
                    value={classEndTime}
                    onChange={(e) => setClassEndTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                    Sala / Laboratório
                  </label>
                  <input
                    type="text"
                    value={classRoom}
                    onChange={(e) => setClassRoom(e.target.value)}
                    placeholder="Ex: Lab 204"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
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
                    className="w-full px-3 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                  />
                </div>
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

      {/* Modal: Cadastrar Nova Disciplina */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#211C2B] border border-[#322B40] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#322B40]">
              <h3 className="text-base font-bold text-[#F5F2F8]">
                Cadastrar Nova Disciplina
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
                  placeholder="Ex: Banco de Dados II"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                    Código
                  </label>
                  <input
                    type="text"
                    value={newSubjCode}
                    onChange={(e) => setNewSubjCode(e.target.value)}
                    placeholder="Ex: INF-302"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                    Sala Padrão
                  </label>
                  <input
                    type="text"
                    value={newSubjRoom}
                    onChange={(e) => setNewSubjRoom(e.target.value)}
                    placeholder="Ex: Sala 202"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                  Professor(a)
                </label>
                <input
                  type="text"
                  value={newSubjProf}
                  onChange={(e) => setNewSubjProf(e.target.value)}
                  placeholder="Ex: Prof. Dr. Ricardo"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                />
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
                  Criar com 1ª, 2ª e 3ª Unidades
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
