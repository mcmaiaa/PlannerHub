import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronsDownUp,
  ChevronsUpDown,
  Plus,
  CheckSquare,
  Square,
  Trash2,
  FileText,
  ArrowLeft,
  Calendar,
  X,
} from 'lucide-react';
import { usePlannerStore } from '../store/usePlannerStore';
import { ExamPlan } from '../types';
import { formatReadableDate, toISODateString } from '../utils/dateUtils';

function calculateExamProgress(exam: ExamPlan) {
  let totalTopics = 0;
  let teoriaCount = 0;
  let resumoCount = 0;
  let questoesCount = 0;
  let revisaoCount = 0;

  for (const subj of exam.subjects) {
    for (const t of subj.topics) {
      totalTopics++;
      if (t.teoria) teoriaCount++;
      if (t.resumo) resumoCount++;
      if (t.questoes) questoesCount++;
      if (t.revisao) revisaoCount++;
    }
  }

  const totalPossible = totalTopics * 4;
  const totalDone = teoriaCount + resumoCount + questoesCount + revisaoCount;
  const percent =
    totalPossible === 0 ? 0 : Math.round((totalDone / totalPossible) * 100);

  return {
    totalTopics,
    teoriaCount,
    resumoCount,
    questoesCount,
    revisaoCount,
    percent,
  };
}

export const ExamView: React.FC = () => {
  const {
    exams = [],
    addExamPlan,
    updateExamPlan,
    deleteExamPlan,
    addExamSubject,
    deleteExamSubject,
    addExamTopic,
    toggleExamTopicCheck,
    deleteExamTopic,
    uploadExamTopicTabletNote,
    deleteExamTopicTabletNote,
    setPreviewAttachment,
  } = usePlannerStore();

  // null = Tela de Seleção "Meus Concursos" | string = ID do Concurso aberto
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

  // Modal Novo Concurso
  const [isNewExamModalOpen, setIsNewExamModalOpen] = useState(false);
  const [newExamName, setNewExamName] = useState('');
  const [newExamBoard, setNewExamBoard] = useState('');
  const [newExamDate, setNewExamDate] = useState('');

  // Estados da tela interna do Edital
  const [expandedSubjects, setExpandedSubjects] = useState<
    Record<string, boolean>
  >({});
  const [isNewSubjOpen, setIsNewSubjOpen] = useState(false);
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjTag, setNewSubjTag] = useState('Específicas • Peso 2');
  const [newTopicTextBySubj, setNewTopicTextBySubj] = useState<
    Record<string, string>
  >({});

  // Modal Upload Resumo do Tablet por Tópico
  const [topicUploadModal, setTopicUploadModal] = useState<{
    subjectId: string;
    topicId: string;
    topicTitle: string;
  } | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteFile, setNoteFile] = useState<File | null>(null);

  const selectedExam = exams.find((e) => e.id === selectedExamId) || null;

  const handleCreateExamPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamName.trim()) return;
    await addExamPlan(newExamName, newExamBoard, newExamDate || undefined);
    setNewExamName('');
    setNewExamBoard('');
    setNewExamDate('');
    setIsNewExamModalOpen(false);
  };

  // ============================================================================
  // TELA 1: MEUS CONCURSOS (SELEÇÃO DE CONCURSOS)
  // ============================================================================
  if (!selectedExam) {
    return (
      <div className="space-y-6 pb-16 lg:pb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#F5F2F8]">Meus Concursos</h2>
          <button
            onClick={() => setIsNewExamModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 hover:bg-emerald-500/25 font-semibold text-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Concurso</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {exams.map((exam) => {
            const st = calculateExamProgress(exam);
            return (
              <div
                key={exam.id}
                onClick={() => setSelectedExamId(exam.id)}
                className="cursor-pointer rounded-2xl p-5 border-l-4 border-l-emerald-400 bg-emerald-500/15 border border-emerald-400/25 hover:bg-emerald-500/20 transition hover:-translate-y-0.5 flex flex-col justify-between gap-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      {exam.boardOrAgency}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Excluir "${exam.name}"?`)) {
                          deleteExamPlan(exam.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#A89FBD] hover:text-rose-300 transition"
                      title="Excluir concurso"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-[#F5F2F8]">
                    {exam.name}
                  </h3>

                  {exam.examDate && (
                    <div className="inline-flex items-center gap-1.5 text-xs text-emerald-300 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Prova: {formatReadableDate(exam.examDate)}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-emerald-400/20">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#A89FBD]">
                      {exam.subjects.length} matéria(s) • {st.totalTopics} tópicos
                    </span>
                    <span className="font-bold text-emerald-300">
                      {st.percent}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#16131D] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                      style={{ width: `${st.percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Novo Concurso */}
        {isNewExamModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div className="bg-[#211C2B] border border-[#322B40] rounded-2xl w-full max-w-md p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#322B40]">
                <h3 className="text-sm font-bold text-[#F5F2F8]">
                  Novo Concurso
                </h3>
                <button
                  onClick={() => setIsNewExamModalOpen(false)}
                  className="text-[#A89FBD] hover:text-[#F5F2F8]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateExamPlan} className="space-y-3.5 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                    Nome do Concurso *
                  </label>
                  <input
                    type="text"
                    required
                    value={newExamName}
                    onChange={(e) => setNewExamName(e.target.value)}
                    placeholder="Ex: Concurso Banco do Brasil, TRE, Prefeitura..."
                    className="w-full px-3 py-2 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                    Banca / Órgão *
                  </label>
                  <input
                    type="text"
                    required
                    value={newExamBoard}
                    onChange={(e) => setNewExamBoard(e.target.value)}
                    placeholder="Ex: FGV • Analista, Cesgranrio..."
                    className="w-full px-3 py-2 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                    Data da Prova (Opcional)
                  </label>
                  <input
                    type="date"
                    value={newExamDate}
                    onChange={(e) => setNewExamDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#16131D] border border-[#322B40] text-xs text-[#F5F2F8]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewExamModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-xs bg-[#16131D] text-[#A89FBD]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-400 text-[#16131D]"
                  >
                    Criar Concurso
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // TELA 2: EDITAL DETALHADO DO CONCURSO SELECIONADO (MATÉRIAS, CHECKBOXES E PDF)
  // ============================================================================
  const stats = calculateExamProgress(selectedExam);

  const toggleExpand = (id: string) => {
    setExpandedSubjects((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? true),
    }));
  };

  const areAllSubjectsExpanded =
    selectedExam.subjects.length > 0 &&
    selectedExam.subjects.every((s) => expandedSubjects[s.id] ?? true);

  const toggleAllSubjects = () => {
    const nextState = !areAllSubjectsExpanded;
    const nextMap: Record<string, boolean> = {};
    for (const s of selectedExam.subjects) {
      nextMap[s.id] = nextState;
    }
    setExpandedSubjects(nextMap);
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjName.trim()) return;
    await addExamSubject(selectedExam.id, newSubjName.trim(), newSubjTag.trim());
    setNewSubjName('');
    setIsNewSubjOpen(false);
  };

  const handleAddTopic = async (subjectId: string) => {
    const title = (newTopicTextBySubj[subjectId] || '').trim();
    if (!title) return;
    await addExamTopic(selectedExam.id, subjectId, title);
    setNewTopicTextBySubj((prev) => ({ ...prev, [subjectId]: '' }));
  };

  const handleUploadTopicFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicUploadModal || !noteFile) return;
    await uploadExamTopicTabletNote(
      selectedExam.id,
      topicUploadModal.subjectId,
      topicUploadModal.topicId,
      noteFile,
      noteTitle.trim() || `Resumo: ${topicUploadModal.topicTitle}`,
      toISODateString(new Date())
    );
    setTopicUploadModal(null);
    setNoteTitle('');
    setNoteFile(null);
  };

  return (
    <div className="space-y-6 pb-16 lg:pb-8">
      {/* Barra de Topo com botão Voltar para Concursos */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setSelectedExamId(null)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#211C2B] hover:bg-[#292336] border border-[#322B40] text-xs font-semibold text-[#F5F2F8] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-emerald-300" />
          <span>Voltar para Concursos</span>
        </button>

        <div className="flex items-center gap-2">
          {selectedExam.subjects.length > 0 && (
            <button
              onClick={toggleAllSubjects}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#211C2B] hover:bg-[#292336] text-[#A89FBD] hover:text-[#F5F2F8] border border-[#322B40] font-semibold text-xs transition"
            >
              {areAllSubjectsExpanded ? (
                <>
                  <ChevronsDownUp className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Minimizar Todas</span>
                </>
              ) : (
                <>
                  <ChevronsUpDown className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Expandir Todas</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={() => setIsNewSubjOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 hover:bg-emerald-500/25 font-semibold text-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Matéria</span>
          </button>
        </div>
      </div>

      {/* Painel de Progresso do Concurso Selecionado */}
      <div className="bg-[#211C2B] border-l-4 border-l-emerald-400 border border-[#322B40] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-emerald-300">
              {selectedExam.boardOrAgency}
            </span>
            <input
              type="text"
              value={selectedExam.name}
              onChange={(e) =>
                updateExamPlan(selectedExam.id, { name: e.target.value })
              }
              className="block text-xl font-bold text-[#F5F2F8] bg-transparent border-b border-transparent focus:border-emerald-400 focus:outline-none"
            />
          </div>
          <span className="text-2xl font-extrabold text-emerald-300">
            {stats.percent}%
          </span>
        </div>

        <div className="w-full h-3 bg-[#16131D] rounded-full overflow-hidden border border-[#322B40]">
          <div
            className="h-full bg-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${stats.percent}%` }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-2.5 rounded-xl bg-[#16131D] border border-[#322B40]">
            <div className="text-[11px] text-[#A89FBD]">Teoria</div>
            <div className="text-xs font-bold text-emerald-300">
              {stats.teoriaCount} / {stats.totalTopics}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#16131D] border border-[#322B40]">
            <div className="text-[11px] text-[#A89FBD]">Resumo</div>
            <div className="text-xs font-bold text-purple-300">
              {stats.resumoCount} / {stats.totalTopics}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#16131D] border border-[#322B40]">
            <div className="text-[11px] text-[#A89FBD]">Questões</div>
            <div className="text-xs font-bold text-pink-300">
              {stats.questoesCount} / {stats.totalTopics}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#16131D] border border-[#322B40]">
            <div className="text-[11px] text-[#A89FBD]">Revisão</div>
            <div className="text-xs font-bold text-rose-300">
              {stats.revisaoCount} / {stats.totalTopics}
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Matérias do Concurso */}
      <div className="space-y-4">
        {selectedExam.subjects.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#211C2B] border border-[#322B40] text-center text-xs text-[#A89FBD]">
            Nenhuma matéria cadastrada neste concurso. Clique em "+ Matéria" acima.
          </div>
        ) : (
          selectedExam.subjects.map((subject) => {
            const isExpanded = expandedSubjects[subject.id] ?? true;
            const totalChecks = subject.topics.length * 4;
            const doneChecks = subject.topics.reduce(
              (acc, t) =>
                acc +
                (t.teoria ? 1 : 0) +
                (t.resumo ? 1 : 0) +
                (t.questoes ? 1 : 0) +
                (t.revisao ? 1 : 0),
              0
            );
            const subjPercent =
              totalChecks === 0
                ? 0
                : Math.round((doneChecks / totalChecks) * 100);

            return (
              <div
                key={subject.id}
                className="bg-[#211C2B] border border-[#322B40] rounded-2xl overflow-hidden"
              >
                <div
                  onClick={() => toggleExpand(subject.id)}
                  className="cursor-pointer px-5 py-4 bg-[#251F30] hover:bg-[#292336] transition flex items-center justify-between gap-4 border-b border-[#322B40]"
                >
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      {subject.categoryTag}
                    </span>
                    <h3 className="text-sm font-bold text-[#F5F2F8]">
                      {subject.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-emerald-300">
                      {subjPercent}%
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Excluir "${subject.name}"?`)) {
                          deleteExamSubject(selectedExam.id, subject.id);
                        }
                      }}
                      className="p-1 text-[#A89FBD] hover:text-rose-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#A89FBD]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#A89FBD]" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#322B40] text-[11px] font-bold uppercase tracking-wider text-[#A89FBD]">
                            <th className="py-2.5 px-3 min-w-[220px]">Tópico</th>
                            <th className="py-2.5 px-2 text-center w-20">
                              Teoria
                            </th>
                            <th className="py-2.5 px-2 text-center w-20">
                              Resumo
                            </th>
                            <th className="py-2.5 px-2 text-center w-20">
                              Questões
                            </th>
                            <th className="py-2.5 px-2 text-center w-20">
                              Revisão
                            </th>
                            <th className="py-2.5 px-3 text-right min-w-[160px]">
                              Arquivo
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#322B40]/60 text-xs">
                          {subject.topics.map((topic) => {
                            const allDone =
                              topic.teoria &&
                              topic.resumo &&
                              topic.questoes &&
                              topic.revisao;

                            return (
                              <tr
                                key={topic.id}
                                className="hover:bg-[#16131D]/60 transition"
                              >
                                <td className="py-3 px-3 font-medium">
                                  <span
                                    className={
                                      allDone
                                        ? 'text-emerald-300 font-semibold'
                                        : 'text-[#F5F2F8]'
                                    }
                                  >
                                    {topic.title}
                                  </span>
                                </td>

                                {(
                                  [
                                    { key: 'teoria', color: 'text-emerald-300' },
                                    { key: 'resumo', color: 'text-purple-300' },
                                    { key: 'questoes', color: 'text-pink-300' },
                                    { key: 'revisao', color: 'text-rose-300' },
                                  ] as const
                                ).map((step) => {
                                  const checked = topic[step.key];
                                  return (
                                    <td
                                      key={step.key}
                                      className="py-3 px-2 text-center"
                                    >
                                      <button
                                        onClick={() =>
                                          toggleExamTopicCheck(
                                            selectedExam.id,
                                            subject.id,
                                            topic.id,
                                            step.key
                                          )
                                        }
                                        className={`inline-flex items-center justify-center p-1 rounded transition ${
                                          checked
                                            ? step.color
                                            : 'text-[#A89FBD]/40 hover:text-[#F5F2F8]'
                                        }`}
                                      >
                                        {checked ? (
                                          <CheckSquare className="w-4 h-4" />
                                        ) : (
                                          <Square className="w-4 h-4" />
                                        )}
                                      </button>
                                    </td>
                                  );
                                })}

                                <td className="py-3 px-3 text-right">
                                  <div className="inline-flex items-center justify-end gap-1.5">
                                    {topic.tabletNote ? (
                                      <>
                                        <button
                                          onClick={() =>
                                            setPreviewAttachment(topic.tabletNote!)
                                          }
                                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-400/30 transition"
                                        >
                                          Ver arquivo
                                        </button>
                                        <button
                                          onClick={() =>
                                            deleteExamTopicTabletNote(
                                              selectedExam.id,
                                              subject.id,
                                              topic.id,
                                              topic.tabletNote!.storageKey
                                            )
                                          }
                                          className="p-1 text-[#A89FBD] hover:text-rose-300"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setTopicUploadModal({
                                            subjectId: subject.id,
                                            topicId: topic.id,
                                            topicTitle: topic.title,
                                          });
                                          setNoteTitle(`Resumo: ${topic.title}`);
                                          setNoteFile(null);
                                        }}
                                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#16131D] text-[#A89FBD] hover:text-emerald-300 border border-[#322B40] transition"
                                      >
                                        + PDF
                                      </button>
                                    )}

                                    <button
                                      onClick={() =>
                                        deleteExamTopic(
                                          selectedExam.id,
                                          subject.id,
                                          topic.id
                                        )
                                      }
                                      className="p-1 text-[#A89FBD]/50 hover:text-rose-300"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={newTopicTextBySubj[subject.id] || ''}
                        onChange={(e) =>
                          setNewTopicTextBySubj((prev) => ({
                            ...prev,
                            [subject.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTopic(subject.id);
                          }
                        }}
                        placeholder="Novo tópico..."
                        className="flex-1 px-3 py-2 rounded-xl bg-[#16131D] border border-[#322B40] focus:border-emerald-400 focus:outline-none text-xs text-[#F5F2F8]"
                      />
                      <button
                        onClick={() => handleAddTopic(subject.id)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-400/30 text-xs font-bold transition"
                      >
                        + Tópico
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Nova Matéria */}
      {isNewSubjOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#211C2B] border border-[#322B40] rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#322B40]">
              <h3 className="text-sm font-bold text-[#F5F2F8]">Nova Matéria</h3>
              <button
                onClick={() => setIsNewSubjOpen(false)}
                className="text-[#A89FBD] hover:text-[#F5F2F8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubject} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  required
                  value={newSubjName}
                  onChange={(e) => setNewSubjName(e.target.value)}
                  placeholder="Ex: Raciocínio Lógico"
                  className="w-full px-3 py-2 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                  Tag / Peso
                </label>
                <input
                  type="text"
                  value={newSubjTag}
                  onChange={(e) => setNewSubjTag(e.target.value)}
                  placeholder="Ex: Básicas • Peso 1"
                  className="w-full px-3 py-2 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewSubjOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs bg-[#16131D] text-[#A89FBD]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-400 text-[#16131D]"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Upload de Resumo */}
      {topicUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#211C2B] border border-[#322B40] rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#322B40]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-300" />
                <h3 className="text-sm font-bold text-[#F5F2F8]">
                  Anexar Resumo
                </h3>
              </div>
              <button
                onClick={() => setTopicUploadModal(null)}
                className="text-[#A89FBD] hover:text-[#F5F2F8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadTopicFile} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                  Título
                </label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                  Arquivo (.pdf, .png, .jpg) *
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                  onChange={(e) => setNoteFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-[#A89FBD] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-500/20 file:text-emerald-300 cursor-pointer bg-[#16131D] p-2 rounded-xl border border-[#322B40]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTopicUploadModal(null)}
                  className="px-3.5 py-2 rounded-xl text-xs bg-[#16131D] text-[#A89FBD]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-400 text-[#16131D]"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
