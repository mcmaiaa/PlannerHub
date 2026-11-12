import React, { useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  ExternalLink,
  Share2,
  Eye,
  Edit3,
  Trash2,
  Calendar,
  MapPin,
  Building2,
  CheckCircle2,
  LayoutGrid,
  Columns3,
  Table as TableIcon,
  Inbox,
  Send,
  History,
  Lock,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  UserCheck,
  MessageSquare,
  Award,
  TrendingUp,
} from 'lucide-react';
import { usePlannerStore } from '../store/usePlannerStore';
import {
  JobApplicationStatus,
  JobOpportunity,
  JobOpportunityType,
  JobWorkMode,
  PublicUserSummary,
} from '../types';
import { formatReadableDate, toISODateString } from '../utils/dateUtils';
import { storageService } from '../services/storageService';

export interface StatusStyleConfig {
  label: string;
  shortLabel: string;
  cardBorderClass: string;
  badgeClass: string;
  textClass: string;
  dotClass: string;
  order: number;
}

export const JOB_STATUS_CONFIG: Record<JobApplicationStatus, StatusStyleConfig> =
  {
    interessado: {
      label: 'Interessado / Salva',
      shortLabel: 'Interessado',
      cardBorderClass:
        'border-l-4 border-l-sky-400 bg-[#211C2B] border border-[#322B40]',
      badgeClass: 'bg-sky-500/20 text-sky-300 border border-sky-400/35',
      textClass: 'text-sky-300',
      dotClass: 'bg-sky-400',
      order: 1,
    },
    inscrito: {
      label: 'Inscrição Realizada',
      shortLabel: 'Inscrito',
      cardBorderClass:
        'border-l-4 border-l-purple-400 bg-[#211C2B] border border-[#322B40]',
      badgeClass:
        'bg-purple-500/20 text-purple-300 border border-purple-400/35',
      textClass: 'text-purple-300',
      dotClass: 'bg-purple-400',
      order: 2,
    },
    em_analise: {
      label: 'Em Análise / Triagem',
      shortLabel: 'Em Análise',
      cardBorderClass:
        'border-l-4 border-l-amber-300 bg-[#211C2B] border border-[#322B40]',
      badgeClass: 'bg-amber-400/20 text-amber-200 border border-amber-300/35',
      textClass: 'text-amber-200',
      dotClass: 'bg-amber-300',
      order: 3,
    },
    teste_tecnico: {
      label: 'Teste Técnico / Case',
      shortLabel: 'Teste Técnico',
      cardBorderClass:
        'border-l-4 border-l-pink-400 bg-[#211C2B] border border-[#322B40]',
      badgeClass: 'bg-pink-500/20 text-pink-300 border border-pink-400/35',
      textClass: 'text-pink-300',
      dotClass: 'bg-pink-400',
      order: 4,
    },
    entrevista: {
      label: 'Entrevista',
      shortLabel: 'Entrevista',
      cardBorderClass:
        'border-l-4 border-l-rose-400 bg-[#211C2B] border border-[#322B40]',
      badgeClass: 'bg-rose-500/25 text-rose-300 border border-rose-400/40',
      textClass: 'text-rose-300',
      dotClass: 'bg-rose-400',
      order: 5,
    },
    aprovado: {
      label: 'Aprovado / Proposta',
      shortLabel: 'Aprovado',
      cardBorderClass:
        'border-l-4 border-l-emerald-400 bg-[#211C2B] border border-[#322B40]',
      badgeClass:
        'bg-emerald-500/20 text-emerald-300 border border-emerald-400/35',
      textClass: 'text-emerald-300',
      dotClass: 'bg-emerald-400',
      order: 6,
    },
    reprovado: {
      label: 'Reprovado / Encerrado',
      shortLabel: 'Reprovado',
      cardBorderClass:
        'border-l-4 border-l-slate-500 bg-[#211C2B]/80 border border-[#322B40]',
      badgeClass: 'bg-slate-500/20 text-slate-300 border border-slate-400/30',
      textClass: 'text-slate-300',
      dotClass: 'bg-slate-400',
      order: 7,
    },
    desistencia: {
      label: 'Desistência',
      shortLabel: 'Desistência',
      cardBorderClass:
        'border-l-4 border-l-slate-500 bg-[#211C2B]/80 border border-[#322B40]',
      badgeClass: 'bg-slate-500/20 text-slate-300 border border-slate-400/30',
      textClass: 'text-slate-300',
      dotClass: 'bg-slate-400',
      order: 8,
    },
  };

export const WORK_MODE_LABELS: Record<JobWorkMode, string> = {
  remoto: 'Remoto',
  hibrido: 'Híbrido',
  presencial: 'Presencial',
};

export const OPPORTUNITY_TYPE_LABELS: Record<JobOpportunityType, string> = {
  estagio: 'Estágio',
  efetivo: 'Efetivo (CLT/PJ)',
  trainee: 'Trainee',
  bolsa: 'Bolsa / Pesquisa',
  freelance: 'Freelance / Projeto',
};

const KANBAN_STAGE_ORDER: JobApplicationStatus[] = [
  'interessado',
  'inscrito',
  'em_analise',
  'teste_tecnico',
  'entrevista',
  'aprovado',
  'reprovado',
  'desistencia',
];

type ViewMode = 'cards' | 'kanban' | 'table';
type SectionTab = 'my_jobs' | 'shared';
type SortOption = 'updated_desc' | 'applied_desc' | 'next_step_asc' | 'status_order' | 'company_asc';

function formatDateTimePtBR(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export const JobsView: React.FC = () => {
  const {
    jobs = [],
    sharedJobsReceived = [],
    sharedJobsSent = [],
    currentUser,
    addJobOpportunity,
    updateJobOpportunity,
    updateJobStatus,
    addJobHistoryNote,
    deleteJobOpportunity,
    refreshSharedJobs,
    shareJob,
    acceptSharedJob,
    dismissSharedJob,
  } = usePlannerStore();

  const [sectionTab, setSectionTab] = useState<SectionTab>('my_jobs');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // Busca, Filtros e Ordenação
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [workModeFilter, setWorkModeFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('updated_desc');

  // Modal Criar / Editar Vaga
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  const [area, setArea] = useState('');
  const [workMode, setWorkMode] = useState<JobWorkMode>('remoto');
  const [location, setLocation] = useState('');
  const [opportunityType, setOpportunityType] =
    useState<JobOpportunityType>('estagio');
  const [status, setStatus] = useState<JobApplicationStatus>('interessado');
  const [appliedDate, setAppliedDate] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [nextStepDate, setNextStepDate] = useState('');
  const [companyFeedback, setCompanyFeedback] = useState('');
  const [personalNotes, setPersonalNotes] = useState('');

  // Modal Detalhes e Histórico da Vaga
  const [selectedDetailJobId, setSelectedDetailJobId] = useState<string | null>(
    null
  );
  const [newHistoryNote, setNewHistoryNote] = useState('');

  // Modal Compartilhar Vaga com Outro Usuário
  const [sharingJob, setSharingJob] = useState<JobOpportunity | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [availableUsers, setAvailableUsers] = useState<PublicUserSummary[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [selectedRecipient, setSelectedRecipient] =
    useState<PublicUserSummary | null>(null);
  const [shareMessage, setShareMessage] = useState('');
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);
  const [isSendingShare, setIsSendingShare] = useState(false);
  const [isRefreshingShares, setIsRefreshingShares] = useState(false);

  useEffect(() => {
    refreshSharedJobs();
  }, [refreshSharedJobs]);

  // Busca usuários ao abrir o modal de compartilhamento ou digitar na busca
  useEffect(() => {
    if (!sharingJob) return;
    let cancelled = false;
    setIsSearchingUsers(true);
    storageService
      .searchUsers(userSearchQuery, currentUser)
      .then((res) => {
        if (!cancelled) {
          setAvailableUsers(res);
          setIsSearchingUsers(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsSearchingUsers(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sharingJob, userSearchQuery, currentUser]);

  const pendingSharedCount = useMemo(
    () => sharedJobsReceived.filter((s) => s.status === 'pending').length,
    [sharedJobsReceived]
  );

  // Indicadores / KPIs
  const metrics = useMemo(() => {
    const total = jobs.length;
    const inProgress = jobs.filter((j) =>
      ['inscrito', 'em_analise', 'teste_tecnico', 'entrevista'].includes(
        j.status
      )
    ).length;
    const interviewsAndTests = jobs.filter((j) =>
      ['teste_tecnico', 'entrevista'].includes(j.status)
    ).length;
    const approved = jobs.filter((j) => j.status === 'aprovado').length;
    const interested = jobs.filter((j) => j.status === 'interessado').length;

    return {
      total,
      inProgress,
      interviewsAndTests,
      approved,
      interested,
    };
  }, [jobs]);

  // Filtragem e Ordenação
  const filteredJobs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return jobs
      .filter((job) => {
        if (q) {
          const matchCompany = job.company.toLowerCase().includes(q);
          const matchTitle = job.title.toLowerCase().includes(q);
          const matchArea = (job.area || '').toLowerCase().includes(q);
          const matchLoc = (job.location || '').toLowerCase().includes(q);
          if (!matchCompany && !matchTitle && !matchArea && !matchLoc) {
            return false;
          }
        }

        if (statusFilter === 'active_only') {
          if (['reprovado', 'desistencia'].includes(job.status)) return false;
        } else if (statusFilter !== 'all' && job.status !== statusFilter) {
          return false;
        }

        if (workModeFilter !== 'all' && job.workMode !== workModeFilter) {
          return false;
        }

        if (typeFilter !== 'all' && job.opportunityType !== typeFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'company_asc') {
          return a.company.localeCompare(b.company);
        }
        if (sortBy === 'applied_desc') {
          const da = a.appliedDate || '0000-00-00';
          const db = b.appliedDate || '0000-00-00';
          return db.localeCompare(da);
        }
        if (sortBy === 'next_step_asc') {
          const na = a.nextStepDate || '9999-12-31';
          const nb = b.nextStepDate || '9999-12-31';
          return na.localeCompare(nb);
        }
        if (sortBy === 'status_order') {
          return (
            (JOB_STATUS_CONFIG[a.status]?.order || 99) -
            (JOB_STATUS_CONFIG[b.status]?.order || 99)
          );
        }
        return (b.updatedAt || '').localeCompare(a.updatedAt || '');
      });
  }, [jobs, searchQuery, statusFilter, workModeFilter, typeFilter, sortBy]);

  const selectedDetailJob = useMemo(
    () => jobs.find((j) => j.id === selectedDetailJobId) || null,
    [jobs, selectedDetailJobId]
  );

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    statusFilter !== 'all' ||
    workModeFilter !== 'all' ||
    typeFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setWorkModeFilter('all');
    setTypeFilter('all');
  };

  const openNewJobModal = (defaultStatus: JobApplicationStatus = 'interessado') => {
    setEditingJobId(null);
    setCompany('');
    setTitle('');
    setLink('');
    setDescription('');
    setArea('');
    setWorkMode('remoto');
    setLocation('');
    setOpportunityType('estagio');
    setStatus(defaultStatus);
    setAppliedDate(
      defaultStatus !== 'interessado' ? toISODateString(new Date()) : ''
    );
    setNextStep('');
    setNextStepDate('');
    setCompanyFeedback('');
    setPersonalNotes('');
    setIsFormModalOpen(true);
  };

  const openEditJobModal = (job: JobOpportunity) => {
    setEditingJobId(job.id);
    setCompany(job.company);
    setTitle(job.title);
    setLink(job.link || '');
    setDescription(job.description || '');
    setArea(job.area || '');
    setWorkMode(job.workMode);
    setLocation(job.location || '');
    setOpportunityType(job.opportunityType);
    setStatus(job.status);
    setAppliedDate(job.appliedDate || '');
    setNextStep(job.nextStep || '');
    setNextStepDate(job.nextStepDate || '');
    setCompanyFeedback(job.companyFeedback || '');
    setPersonalNotes(job.personalNotes || '');
    setIsFormModalOpen(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !title.trim()) return;

    const payload = {
      company: company.trim(),
      title: title.trim(),
      link: link.trim() || undefined,
      description: description.trim() || undefined,
      area: area.trim() || undefined,
      workMode,
      location: location.trim() || undefined,
      opportunityType,
      status,
      appliedDate: appliedDate || undefined,
      nextStep: nextStep.trim() || undefined,
      nextStepDate: nextStepDate || undefined,
      companyFeedback: companyFeedback.trim() || undefined,
      personalNotes: personalNotes.trim() || undefined,
    };

    if (editingJobId) {
      await updateJobOpportunity(editingJobId, payload);
    } else {
      await addJobOpportunity(payload);
    }
    setIsFormModalOpen(false);
  };

  const openShareModal = (job: JobOpportunity) => {
    setSharingJob(job);
    setUserSearchQuery('');
    setSelectedRecipient(null);
    setShareMessage('');
    setShareError(null);
    setShareSuccess(null);
  };

  const handleConfirmShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharingJob || !selectedRecipient) {
      setShareError('Selecione um usuário da lista para compartilhar a vaga.');
      return;
    }

    setIsSendingShare(true);
    setShareError(null);
    setShareSuccess(null);

    try {
      await shareJob(selectedRecipient.username, sharingJob, shareMessage);
      setShareSuccess(
        `Vaga compartilhada com ${selectedRecipient.displayName} (@${selectedRecipient.username}) com sucesso!`
      );
      setTimeout(() => {
        setSharingJob(null);
      }, 1400);
    } catch (err) {
      setShareError(
        err instanceof Error
          ? err.message
          : 'Erro ao compartilhar vaga. Tente novamente.'
      );
    } finally {
      setIsSendingShare(false);
    }
  };

  const handleAddHistoryComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDetailJob || !newHistoryNote.trim()) return;
    await addJobHistoryNote(selectedDetailJob.id, newHistoryNote.trim());
    setNewHistoryNote('');
  };

  const handleStepShift = async (
    job: JobOpportunity,
    direction: 'prev' | 'next'
  ) => {
    const idx = KANBAN_STAGE_ORDER.indexOf(job.status);
    if (idx === -1) return;
    const targetIdx = direction === 'next' ? idx + 1 : idx - 1;
    if (targetIdx < 0 || targetIdx >= KANBAN_STAGE_ORDER.length) return;
    await updateJobStatus(job.id, KANBAN_STAGE_ORDER[targetIdx]);
  };

  const handleRefreshShared = async () => {
    setIsRefreshingShares(true);
    try {
      await refreshSharedJobs();
    } finally {
      setIsRefreshingShares(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 lg:pb-8">
      {/* Cabeçalho do Módulo Controle de Vagas */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-[#211C2B] border border-[#322B40] rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="shrink-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-400/30 text-rose-300 text-xs font-semibold mb-1">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Carreira, Estágios & Processos Seletivos</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#F5F2F8]">
            Controle de Vagas & Candidaturas
          </h2>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 overflow-x-auto">
          {/* Alternador Minhas Vagas vs Compartilhadas */}
          <div className="flex items-center bg-[#16131D] p-1 rounded-xl border border-[#322B40] shrink-0">
            <button
              onClick={() => setSectionTab('my_jobs')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                sectionTab === 'my_jobs'
                  ? 'bg-pink-400 text-[#16131D] shadow'
                  : 'text-[#A89FBD] hover:text-[#F5F2F8]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 shrink-0" />
              <span>Minhas Vagas ({jobs.length})</span>
            </button>

            <button
              onClick={() => {
                setSectionTab('shared');
                refreshSharedJobs();
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                sectionTab === 'shared'
                  ? 'bg-pink-400 text-[#16131D] shadow'
                  : 'text-[#A89FBD] hover:text-[#F5F2F8]'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 shrink-0" />
              <span>Compartilhadas</span>
              {pendingSharedCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    sectionTab === 'shared'
                      ? 'bg-[#16131D] text-pink-300'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {pendingSharedCount}
                </span>
              )}
            </button>
          </div>

          {/* Alternador de Visualização (Cards / Kanban / Tabela) */}
          {sectionTab === 'my_jobs' && (
            <div className="flex items-center bg-[#16131D] p-1 rounded-xl border border-[#322B40] shrink-0">
              <button
                onClick={() => setViewMode('cards')}
                title="Visualização em Cards"
                className={`inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  viewMode === 'cards'
                    ? 'bg-[#292336] text-pink-300 border border-pink-400/30'
                    : 'text-[#A89FBD] hover:text-[#F5F2F8]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                title="Visualização em Kanban por Etapa"
                className={`inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  viewMode === 'kanban'
                    ? 'bg-[#292336] text-pink-300 border border-pink-400/30'
                    : 'text-[#A89FBD] hover:text-[#F5F2F8]'
                }`}
              >
                <Columns3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                title="Visualização em Tabela"
                className={`inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  viewMode === 'table'
                    ? 'bg-[#292336] text-pink-300 border border-pink-400/30'
                    : 'text-[#A89FBD] hover:text-[#F5F2F8]'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tabela</span>
              </button>
            </div>
          )}

          <button
            onClick={() => openNewJobModal('interessado')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-pink-400 hover:bg-pink-300 text-[#16131D] font-bold text-xs whitespace-nowrap shrink-0 shadow-lg transition"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Nova Vaga</span>
          </button>
        </div>
      </div>

      {/* Indicadores / KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-[#211C2B] border-l-4 border-l-sky-400 border border-[#322B40] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A89FBD]">
              Total de Vagas
            </span>
            <div className="text-2xl font-extrabold text-[#F5F2F8] mt-0.5">
              {metrics.total}
            </div>
            <span className="text-[11px] text-sky-300">
              {metrics.interested} salva(s) para inscrição
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-300 shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#211C2B] border-l-4 border-l-purple-400 border border-[#322B40] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A89FBD]">
              Em Andamento
            </span>
            <div className="text-2xl font-extrabold text-[#F5F2F8] mt-0.5">
              {metrics.inProgress}
            </div>
            <span className="text-[11px] text-purple-300">
              Processos seletivos ativos
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#211C2B] border-l-4 border-l-rose-400 border border-[#322B40] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A89FBD]">
              Entrevistas & Testes
            </span>
            <div className="text-2xl font-extrabold text-[#F5F2F8] mt-0.5">
              {metrics.interviewsAndTests}
            </div>
            <span className="text-[11px] text-rose-300">
              Etapas decisivas ativas
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-400/30 flex items-center justify-center text-rose-300 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#211C2B] border-l-4 border-l-emerald-400 border border-[#322B40] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A89FBD]">
              Aprovações
            </span>
            <div className="text-2xl font-extrabold text-[#F5F2F8] mt-0.5">
              {metrics.approved}
            </div>
            <span className="text-[11px] text-emerald-300">
              Propostas conquistadas
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* =====================================================================
          ABA 1: MINHAS VAGAS (CARDS, KANBAN OU TABELA)
         ===================================================================== */}
      {sectionTab === 'my_jobs' && (
        <>
          {/* Barra de Busca, Filtros e Ordenação */}
          <div className="bg-[#211C2B] border border-[#322B40] rounded-2xl p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Busca por texto */}
              <div className="md:col-span-4 relative">
                <Search className="w-4 h-4 text-[#A89FBD] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por empresa, vaga, área ou local..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#16131D] border border-[#322B40] focus:border-pink-400 focus:outline-none text-xs text-[#F5F2F8]"
                />
              </div>

              {/* Filtro de Status */}
              <div className="md:col-span-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#16131D] border border-[#322B40] text-xs text-[#F5F2F8]"
                >
                  <option value="all">Todos os Status</option>
                  <option value="active_only">Apenas Ativas</option>
                  {Object.entries(JOB_STATUS_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>
                      {cfg.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro de Modalidade */}
              <div className="md:col-span-2">
                <select
                  value={workModeFilter}
                  onChange={(e) => setWorkModeFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#16131D] border border-[#322B40] text-xs text-[#F5F2F8]"
                >
                  <option value="all">Todas Modalidades</option>
                  {Object.entries(WORK_MODE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro de Tipo de Oportunidade */}
              <div className="md:col-span-2">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#16131D] border border-[#322B40] text-xs text-[#F5F2F8]"
                >
                  <option value="all">Todos os Tipos</option>
                  {Object.entries(OPPORTUNITY_TYPE_LABELS).map(
                    ([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Ordenação */}
              <div className="md:col-span-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full px-3 py-2 rounded-xl bg-[#16131D] border border-[#322B40] text-xs text-[#F5F2F8]"
                >
                  <option value="updated_desc">Ordenar: Atualização</option>
                  <option value="applied_desc">Ordenar: Data Inscrição</option>
                  <option value="next_step_asc">Ordenar: Próxima Etapa</option>
                  <option value="status_order">Ordenar: Etapa do Funil</option>
                  <option value="company_asc">Ordenar: Empresa (A-Z)</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex items-center justify-between pt-1 text-xs text-[#A89FBD]">
                <span>
                  Exibindo <strong className="text-[#F5F2F8]">{filteredJobs.length}</strong> de{' '}
                  {jobs.length} vaga(s)
                </span>
                <button
                  onClick={clearFilters}
                  className="text-pink-300 hover:underline font-semibold"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>

          {/* Estado Vazio */}
          {filteredJobs.length === 0 ? (
            <div className="bg-[#211C2B] border border-[#322B40] rounded-2xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/15 border border-pink-400/30 flex items-center justify-center text-pink-300 mx-auto">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#F5F2F8]">
                {jobs.length === 0
                  ? 'Nenhuma vaga cadastrada ainda'
                  : 'Nenhuma vaga encontrada para estes filtros'}
              </h3>
              <p className="text-xs text-[#A89FBD] max-w-md mx-auto">
                {jobs.length === 0
                  ? 'Organize suas candidaturas de estágio, trainee e emprego em um só lugar, acompanhe etapas de entrevista e compartilhe oportunidades com amigos do Planner Hub.'
                  : 'Tente ajustar os termos da busca ou limpar os filtros selecionados.'}
              </p>
              <div className="pt-2 flex items-center justify-center gap-2.5">
                {hasActiveFilters ? (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 rounded-xl bg-[#16131D] text-[#F5F2F8] border border-[#322B40] text-xs font-semibold"
                  >
                    Limpar filtros
                  </button>
                ) : (
                  <button
                    onClick={() => openNewJobModal('interessado')}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-pink-400 text-[#16131D] font-bold text-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Cadastrar Primeira Vaga</span>
                  </button>
                )}
              </div>
            </div>
          ) : viewMode === 'cards' ? (
            /* ===============================================================
               MODO 1: VISUALIZAÇÃO EM CARDS
               =============================================================== */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredJobs.map((job) => {
                const st = JOB_STATUS_CONFIG[job.status] || JOB_STATUS_CONFIG.interessado;
                return (
                  <div
                    key={job.id}
                    className={`rounded-2xl p-5 flex flex-col justify-between gap-4 transition hover:-translate-y-0.5 shadow-md ${st.cardBorderClass}`}
                  >
                    <div className="space-y-3">
                      {/* Topo: Empresa + Status Select Rápido */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#A89FBD]">
                            <Building2 className="w-3.5 h-3.5 text-pink-300 shrink-0" />
                            <span className="truncate">{job.company}</span>
                          </div>
                          <h3
                            onClick={() => setSelectedDetailJobId(job.id)}
                            className="text-base font-bold text-[#F5F2F8] hover:text-pink-300 cursor-pointer mt-0.5 line-clamp-2"
                          >
                            {job.title}
                          </h3>
                        </div>

                        <select
                          value={job.status}
                          onChange={(e) =>
                            updateJobStatus(
                              job.id,
                              e.target.value as JobApplicationStatus
                            )
                          }
                          aria-label="Status da candidatura"
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer focus:outline-none shrink-0 ${st.badgeClass}`}
                        >
                          {Object.entries(JOB_STATUS_CONFIG).map(
                            ([key, cfg]) => (
                              <option
                                key={key}
                                value={key}
                                className="bg-[#16131D] text-[#F5F2F8]"
                              >
                                {cfg.shortLabel}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      {/* Tags de Tipo, Modalidade, Área e Local */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#16131D] text-purple-300 border border-[#322B40]">
                          {OPPORTUNITY_TYPE_LABELS[job.opportunityType]}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#16131D] text-pink-300 border border-[#322B40]">
                          {WORK_MODE_LABELS[job.workMode]}
                        </span>
                        {job.area && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#16131D] text-[#A89FBD] border border-[#322B40]">
                            {job.area}
                          </span>
                        )}
                        {job.location && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] text-[#A89FBD] bg-[#16131D] border border-[#322B40]">
                            <MapPin className="w-2.5 h-2.5 text-pink-300" />
                            {job.location}
                          </span>
                        )}
                      </div>

                      {/* Indicação de compartilhamento se recebida de outro usuário */}
                      {job.sharedBy && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-400/25 text-[11px] text-purple-200">
                          <Share2 className="w-3 h-3 text-purple-300" />
                          <span>
                            Compartilhada por{' '}
                            <strong>{job.sharedBy.displayName}</strong> (@
                            {job.sharedBy.username})
                          </span>
                        </div>
                      )}

                      {/* Alerta de Próxima Etapa (se houver) */}
                      {(job.nextStep || job.nextStepDate) && (
                        <div className="p-2.5 rounded-xl bg-[#16131D] border border-rose-400/30 space-y-0.5">
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-rose-300">
                            <span>Próxima Etapa</span>
                            {job.nextStepDate && (
                              <span>{formatReadableDate(job.nextStepDate)}</span>
                            )}
                          </div>
                          {job.nextStep && (
                            <p className="text-xs font-semibold text-[#F5F2F8] line-clamp-1">
                              {job.nextStep}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Devolutiva resumida (se houver) */}
                      {job.companyFeedback && (
                        <p className="text-xs text-[#A89FBD] bg-[#16131D]/70 px-3 py-2 rounded-xl border border-[#322B40] line-clamp-2">
                          <strong className="text-[#F5F2F8]">Devolutiva:</strong>{' '}
                          {job.companyFeedback}
                        </p>
                      )}
                    </div>

                    {/* Rodapé do Card: Data de inscrição + Botões de Ação */}
                    <div className="pt-3 border-t border-[#322B40] flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[#A89FBD]">
                        {job.appliedDate
                          ? `Inscrição: ${formatReadableDate(job.appliedDate)}`
                          : 'Ainda não inscrito'}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedDetailJobId(job.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#16131D] hover:bg-[#292336] text-xs font-semibold text-[#F5F2F8] border border-[#322B40] transition"
                          title="Ver detalhes completos e histórico"
                        >
                          <Eye className="w-3.5 h-3.5 text-pink-300" />
                          <span>Detalhes</span>
                        </button>

                        {job.link && (
                          <a
                            href={
                              job.link.startsWith('http')
                                ? job.link
                                : `https://${job.link}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-[#16131D] hover:bg-[#292336] text-[#A89FBD] hover:text-sky-300 border border-[#322B40] transition"
                            title="Abrir link da vaga"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          onClick={() => openShareModal(job)}
                          className="p-1.5 rounded-lg bg-[#16131D] hover:bg-[#292336] text-[#A89FBD] hover:text-purple-300 border border-[#322B40] transition"
                          title="Compartilhar oportunidade com outro usuário"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => openEditJobModal(job)}
                          className="p-1.5 rounded-lg bg-[#16131D] hover:bg-[#292336] text-[#A89FBD] hover:text-[#F5F2F8] border border-[#322B40] transition"
                          title="Editar vaga"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `Excluir a vaga "${job.title}" na empresa "${job.company}"?`
                              )
                            ) {
                              deleteJobOpportunity(job.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-[#16131D] hover:bg-[#292336] text-[#A89FBD] hover:text-rose-300 border border-[#322B40] transition"
                          title="Excluir vaga"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : viewMode === 'kanban' ? (
            /* ===============================================================
               MODO 2: VISUALIZAÇÃO KANBAN POR ETAPA DO PROCESSO SELETIVO
               =============================================================== */
            <div className="overflow-x-auto pb-3">
              <div className="flex items-start gap-4 min-w-[1250px]">
                {(
                  [
                    {
                      id: 'interessado',
                      title: 'Interessado',
                      statuses: ['interessado'] as JobApplicationStatus[],
                    },
                    {
                      id: 'inscrito',
                      title: 'Inscrição Realizada',
                      statuses: ['inscrito'] as JobApplicationStatus[],
                    },
                    {
                      id: 'em_analise',
                      title: 'Em Análise',
                      statuses: ['em_analise'] as JobApplicationStatus[],
                    },
                    {
                      id: 'teste_tecnico',
                      title: 'Teste Técnico',
                      statuses: ['teste_tecnico'] as JobApplicationStatus[],
                    },
                    {
                      id: 'entrevista',
                      title: 'Entrevista',
                      statuses: ['entrevista'] as JobApplicationStatus[],
                    },
                    {
                      id: 'aprovado',
                      title: 'Aprovado',
                      statuses: ['aprovado'] as JobApplicationStatus[],
                    },
                    {
                      id: 'encerrado',
                      title: 'Reprovado / Desistência',
                      statuses: [
                        'reprovado',
                        'desistencia',
                      ] as JobApplicationStatus[],
                    },
                  ] as const
                ).map((col) => {
                  const colJobs = filteredJobs.filter((j) =>
                    col.statuses.includes(j.status)
                  );
                  const primaryStatus = col.statuses[0];
                  const st = JOB_STATUS_CONFIG[primaryStatus];

                  return (
                    <div
                      key={col.id}
                      className="w-72 shrink-0 bg-[#211C2B] border border-[#322B40] rounded-2xl p-3.5 flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between pb-2.5 border-b border-[#322B40]">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${st.dotClass}`}
                          />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5F2F8]">
                            {col.title}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#16131D] text-[#A89FBD] border border-[#322B40]">
                            {colJobs.length}
                          </span>
                        </div>
                        <button
                          onClick={() => openNewJobModal(primaryStatus)}
                          className="p-1 rounded-lg bg-[#16131D] text-[#A89FBD] hover:text-pink-300 border border-[#322B40]"
                          title={`Adicionar vaga em ${col.title}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-2.5 min-h-[180px]">
                        {colJobs.length === 0 ? (
                          <div className="h-32 rounded-xl border border-dashed border-[#322B40] flex items-center justify-center text-[11px] text-[#A89FBD]/50">
                            Sem vagas nesta etapa
                          </div>
                        ) : (
                          colJobs.map((job) => {
                            const stageIdx = KANBAN_STAGE_ORDER.indexOf(
                              job.status
                            );
                            return (
                              <div
                                key={job.id}
                                className="p-3.5 rounded-xl bg-[#16131D] border border-[#322B40] hover:border-pink-400/40 transition space-y-2.5"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <span className="text-[11px] font-bold text-pink-300 block truncate">
                                      {job.company}
                                    </span>
                                    <h5
                                      onClick={() =>
                                        setSelectedDetailJobId(job.id)
                                      }
                                      className="text-xs font-bold text-[#F5F2F8] hover:text-pink-300 cursor-pointer line-clamp-2 mt-0.5"
                                    >
                                      {job.title}
                                    </h5>
                                  </div>
                                  <button
                                    onClick={() => openShareModal(job)}
                                    className="p-1 text-[#A89FBD] hover:text-purple-300 shrink-0"
                                    title="Compartilhar"
                                  >
                                    <Share2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="flex items-center gap-1 flex-wrap">
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#211C2B] text-purple-300 border border-[#322B40]">
                                    {OPPORTUNITY_TYPE_LABELS[job.opportunityType]}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#211C2B] text-[#A89FBD] border border-[#322B40]">
                                    {WORK_MODE_LABELS[job.workMode]}
                                  </span>
                                </div>

                                {job.nextStep && (
                                  <div className="px-2 py-1.5 rounded-lg bg-[#211C2B] border border-rose-400/30 text-[10px] text-rose-200 truncate">
                                    📌 {job.nextStep}
                                  </div>
                                )}

                                <div className="pt-2 border-t border-[#322B40]/60 flex items-center justify-between">
                                  <button
                                    onClick={() =>
                                      setSelectedDetailJobId(job.id)
                                    }
                                    className="text-[11px] font-semibold text-[#A89FBD] hover:text-[#F5F2F8]"
                                  >
                                    Ver detalhes
                                  </button>

                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() =>
                                        handleStepShift(job, 'prev')
                                      }
                                      disabled={stageIdx <= 0}
                                      title="Voltar etapa"
                                      className="p-1 rounded bg-[#211C2B] text-[#A89FBD] hover:text-[#F5F2F8] disabled:opacity-30 border border-[#322B40]"
                                    >
                                      <ChevronLeft className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleStepShift(job, 'next')
                                      }
                                      disabled={
                                        stageIdx >=
                                        KANBAN_STAGE_ORDER.length - 1
                                      }
                                      title="Avançar etapa"
                                      className="p-1 rounded bg-[#211C2B] text-[#A89FBD] hover:text-pink-300 disabled:opacity-30 border border-[#322B40]"
                                    >
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ===============================================================
               MODO 3: VISUALIZAÇÃO EM TABELA
               =============================================================== */
            <div className="bg-[#211C2B] border border-[#322B40] rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#322B40] bg-[#16131D]/60 text-[11px] font-bold uppercase tracking-wider text-[#A89FBD]">
                      <th className="py-3.5 px-4 min-w-[220px]">
                        Empresa & Vaga
                      </th>
                      <th className="py-3.5 px-3 min-w-[140px]">
                        Tipo & Modalidade
                      </th>
                      <th className="py-3.5 px-3 min-w-[160px]">Status</th>
                      <th className="py-3.5 px-3 min-w-[120px]">Inscrição</th>
                      <th className="py-3.5 px-3 min-w-[180px]">
                        Próxima Etapa
                      </th>
                      <th className="py-3.5 px-4 text-right min-w-[150px]">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#322B40]/60 text-xs">
                    {filteredJobs.map((job) => {
                      const st =
                        JOB_STATUS_CONFIG[job.status] ||
                        JOB_STATUS_CONFIG.interessado;
                      return (
                        <tr
                          key={job.id}
                          className="hover:bg-[#16131D]/50 transition"
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#F5F2F8] hover:text-pink-300 cursor-pointer" onClick={() => setSelectedDetailJobId(job.id)}>
                              {job.title}
                            </div>
                            <div className="text-[11px] text-[#A89FBD] flex items-center gap-1.5 mt-0.5">
                              <span className="font-semibold text-pink-300">
                                {job.company}
                              </span>
                              {job.area && <span>• {job.area}</span>}
                              {job.location && <span>• {job.location}</span>}
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <div className="flex flex-col gap-1 items-start">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#16131D] text-purple-300 border border-[#322B40]">
                                {OPPORTUNITY_TYPE_LABELS[job.opportunityType]}
                              </span>
                              <span className="text-[11px] text-[#A89FBD]">
                                {WORK_MODE_LABELS[job.workMode]}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <select
                              value={job.status}
                              onChange={(e) =>
                                updateJobStatus(
                                  job.id,
                                  e.target.value as JobApplicationStatus
                                )
                              }
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer focus:outline-none ${st.badgeClass}`}
                            >
                              {Object.entries(JOB_STATUS_CONFIG).map(
                                ([key, cfg]) => (
                                  <option
                                    key={key}
                                    value={key}
                                    className="bg-[#16131D] text-[#F5F2F8]"
                                  >
                                    {cfg.shortLabel}
                                  </option>
                                )
                              )}
                            </select>
                          </td>

                          <td className="py-3.5 px-3 text-[#A89FBD]">
                            {job.appliedDate
                              ? formatReadableDate(job.appliedDate)
                              : '—'}
                          </td>

                          <td className="py-3.5 px-3">
                            {job.nextStep || job.nextStepDate ? (
                              <div>
                                <div className="text-xs font-semibold text-[#F5F2F8] truncate max-w-[200px]">
                                  {job.nextStep || 'Compromisso agendado'}
                                </div>
                                {job.nextStepDate && (
                                  <div className="text-[11px] text-rose-300 font-medium">
                                    {formatReadableDate(job.nextStepDate)}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-[#A89FBD]/50">—</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center justify-end gap-1">
                              <button
                                onClick={() => setSelectedDetailJobId(job.id)}
                                className="p-1.5 rounded-lg bg-[#16131D] text-[#A89FBD] hover:text-pink-300 border border-[#322B40]"
                                title="Ver detalhes e histórico"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {job.link && (
                                <a
                                  href={
                                    job.link.startsWith('http')
                                      ? job.link
                                      : `https://${job.link}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-[#16131D] text-[#A89FBD] hover:text-sky-300 border border-[#322B40]"
                                  title="Abrir link"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button
                                onClick={() => openShareModal(job)}
                                className="p-1.5 rounded-lg bg-[#16131D] text-[#A89FBD] hover:text-purple-300 border border-[#322B40]"
                                title="Compartilhar"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openEditJobModal(job)}
                                className="p-1.5 rounded-lg bg-[#16131D] text-[#A89FBD] hover:text-[#F5F2F8] border border-[#322B40]"
                                title="Editar"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `Excluir a vaga "${job.title}"?`
                                    )
                                  ) {
                                    deleteJobOpportunity(job.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-[#16131D] text-[#A89FBD] hover:text-rose-300 border border-[#322B40]"
                                title="Excluir"
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
            </div>
          )}
        </>
      )}

      {/* =====================================================================
          ABA 2: VAGAS COMPARTILHADAS (RECEBIDAS E ENVIADAS ENTRE USUÁRIOS)
         ===================================================================== */}
      {sectionTab === 'shared' && (
        <div className="space-y-6">
          <div className="bg-[#211C2B] border border-[#322B40] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#F5F2F8]">
                  Compartilhamento Seguro com Privacidade Garantida
                </h3>
                <p className="text-xs text-[#A89FBD] mt-0.5">
                  Ao compartilhar ou receber uma vaga, apenas os dados públicos da oportunidade são enviados. Status pessoal, devolutivas, observações e histórico nunca são expostos.
                </p>
              </div>
            </div>

            <button
              onClick={handleRefreshShared}
              disabled={isRefreshingShares}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#16131D] hover:bg-[#292336] text-xs font-semibold text-[#F5F2F8] border border-[#322B40] shrink-0 transition"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-pink-300 ${
                  isRefreshingShares ? 'animate-spin' : ''
                }`}
              />
              <span>Atualizar Lista</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Vagas Recebidas de Outros Usuários */}
            <div className="lg:col-span-7 bg-[#211C2B] border border-[#322B40] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#322B40]">
                <div className="flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-pink-300" />
                  <h3 className="text-sm font-bold text-[#F5F2F8]">
                    Vagas Recebidas para Você ({sharedJobsReceived.length})
                  </h3>
                </div>
                {pendingSharedCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-400/30">
                    {pendingSharedCount} nova(s)
                  </span>
                )}
              </div>

              {sharedJobsReceived.length === 0 ? (
                <div className="py-10 px-4 text-center rounded-xl bg-[#16131D] border border-[#322B40] space-y-2">
                  <Inbox className="w-6 h-6 text-[#A89FBD]/50 mx-auto" />
                  <p className="text-xs font-semibold text-[#F5F2F8]">
                    Nenhuma vaga compartilhada recebida no momento
                  </p>
                  <p className="text-[11px] text-[#A89FBD]">
                    Quando outro usuário do Planner Hub compartilhar uma oportunidade com{' '}
                    <strong className="text-pink-300">
                      @{currentUser?.username}
                    </strong>
                    , ela aparecerá aqui.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sharedJobsReceived.map((item) => {
                    const p = item.jobPayload;
                    const isAccepted = item.status === 'accepted';

                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-[#16131D] border-l-4 border-l-purple-400 border border-[#322B40] space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="inline-flex items-center gap-1.5 text-[11px] text-purple-300 font-semibold">
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>
                                Enviada por{' '}
                                <strong>{item.senderDisplayName}</strong> (@
                                {item.senderUsername})
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-[#F5F2F8] mt-1">
                              {p.title} •{' '}
                              <span className="text-pink-300">{p.company}</span>
                            </h4>
                          </div>

                          <span className="text-[10px] text-[#A89FBD] shrink-0">
                            {formatDateTimePtBR(item.createdAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#211C2B] text-purple-300 border border-[#322B40]">
                            {OPPORTUNITY_TYPE_LABELS[p.opportunityType || 'estagio']}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#211C2B] text-pink-300 border border-[#322B40]">
                            {WORK_MODE_LABELS[p.workMode || 'remoto']}
                          </span>
                          {p.area && (
                            <span className="px-2 py-0.5 rounded text-[10px] text-[#A89FBD] bg-[#211C2B] border border-[#322B40]">
                              {p.area}
                            </span>
                          )}
                          {p.location && (
                            <span className="px-2 py-0.5 rounded text-[10px] text-[#A89FBD] bg-[#211C2B] border border-[#322B40]">
                              📍 {p.location}
                            </span>
                          )}
                        </div>

                        {item.message && (
                          <div className="p-2.5 rounded-xl bg-[#211C2B] border border-[#322B40] text-xs text-[#F5F2F8] flex items-start gap-2">
                            <MessageSquare className="w-3.5 h-3.5 text-pink-300 shrink-0 mt-0.5" />
                            <span>"{item.message}"</span>
                          </div>
                        )}

                        {p.description && (
                          <p className="text-xs text-[#A89FBD] line-clamp-3">
                            {p.description}
                          </p>
                        )}

                        <div className="pt-2 border-t border-[#322B40] flex flex-wrap items-center justify-between gap-2">
                          <div>
                            {p.link && (
                              <a
                                href={
                                  p.link.startsWith('http')
                                    ? p.link
                                    : `https://${p.link}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-sky-300 hover:underline"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Ver link da vaga</span>
                              </a>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => dismissSharedJob(item.id)}
                              className="px-3 py-1.5 rounded-xl bg-[#211C2B] hover:bg-[#292336] text-xs font-semibold text-[#A89FBD] hover:text-rose-300 border border-[#322B40] transition"
                            >
                              Dispensar
                            </button>

                            <button
                              onClick={async () => {
                                await acceptSharedJob(item);
                                setSectionTab('my_jobs');
                              }}
                              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                                isAccepted
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                                  : 'bg-pink-400 hover:bg-pink-300 text-[#16131D]'
                              }`}
                            >
                              {isAccepted ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Adicionada (Adicionar cópia)</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Adicionar às Minhas Vagas</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Vagas Enviadas por Você */}
            <div className="lg:col-span-5 bg-[#211C2B] border border-[#322B40] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#322B40]">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-purple-300" />
                  <h3 className="text-sm font-bold text-[#F5F2F8]">
                    Vagas que Você Compartilhou ({sharedJobsSent.length})
                  </h3>
                </div>
              </div>

              {sharedJobsSent.length === 0 ? (
                <div className="py-10 px-4 text-center rounded-xl bg-[#16131D] border border-[#322B40] space-y-2">
                  <Share2 className="w-6 h-6 text-[#A89FBD]/50 mx-auto" />
                  <p className="text-xs font-semibold text-[#F5F2F8]">
                    Você ainda não compartilhou nenhuma vaga
                  </p>
                  <p className="text-[11px] text-[#A89FBD]">
                    Clique no ícone de compartilhar em qualquer vaga da sua lista para enviá-la a outro usuário do Planner Hub.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sharedJobsSent.map((sent) => (
                    <div
                      key={sent.id}
                      className="p-3.5 rounded-xl bg-[#16131D] border border-[#322B40] space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#F5F2F8] truncate">
                          {sent.jobPayload.title} •{' '}
                          <span className="text-pink-300">
                            {sent.jobPayload.company}
                          </span>
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                            sent.status === 'accepted'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-purple-500/20 text-purple-300'
                          }`}
                        >
                          {sent.status === 'accepted'
                            ? 'Adicionada pelo colega'
                            : 'Enviada'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#A89FBD]">
                        <span>
                          Para:{' '}
                          <strong className="text-[#F5F2F8]">
                            {sent.recipientDisplayName ||
                              `@${sent.recipientUsername}`}
                          </strong>{' '}
                          (@{sent.recipientUsername})
                        </span>
                        <span>{formatDateTimePtBR(sent.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 1: CRIAR OU EDITAR VAGA
         ===================================================================== */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#211C2B] border border-[#322B40] rounded-2xl w-full max-w-2xl p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#322B40]">
              <div>
                <h3 className="text-lg font-bold text-[#F5F2F8]">
                  {editingJobId ? 'Editar Vaga' : 'Nova Oportunidade / Vaga'}
                </h3>
                <p className="text-xs text-[#A89FBD]">
                  Apenas Empresa e Título da vaga são obrigatórios.
                </p>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 rounded-xl text-[#A89FBD] hover:text-[#F5F2F8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="space-y-5 mt-4">
              {/* Bloco 1: Informações Principais da Oportunidade */}
              <div className="space-y-3.5">
                <div className="text-xs font-bold uppercase tracking-wider text-pink-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>1. Informações Principais da Vaga</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                      Empresa *
                    </label>
                    <input
                      type="text"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Ex: Nubank, Itaú, Google, Sebrae..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] focus:border-pink-400 focus:outline-none text-sm text-[#F5F2F8]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                      Nome ou Título da Vaga *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Estágio em Desenv. Front-end, Pessoa Desenvolvedora..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] focus:border-pink-400 focus:outline-none text-sm text-[#F5F2F8]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                      Tipo de Oportunidade
                    </label>
                    <select
                      value={opportunityType}
                      onChange={(e) =>
                        setOpportunityType(e.target.value as JobOpportunityType)
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                    >
                      {Object.entries(OPPORTUNITY_TYPE_LABELS).map(
                        ([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                      Modalidade
                    </label>
                    <select
                      value={workMode}
                      onChange={(e) =>
                        setWorkMode(e.target.value as JobWorkMode)
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                    >
                      {Object.entries(WORK_MODE_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                      Área de Atuação
                    </label>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="Ex: Front-end, Dados & IA, UX/UI..."
                      className="w-full px-3 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                      Localização (Opcional)
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Ex: João Pessoa/PB, São Paulo/SP, Brasil..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                      Link da Vaga (Opcional)
                    </label>
                    <input
                      type="text"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                    Descrição da Oportunidade / Requisitos (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Principais tecnologias, bolsa/salário, benefícios ou resumo da vaga..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8] resize-none"
                  />
                </div>
              </div>

              {/* Bloco 2: Acompanhamento Pessoal da Candidatura */}
              <div className="pt-4 border-t border-[#322B40] space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>2. Acompanhamento Pessoal (Privado à sua conta)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                      Status da Candidatura
                    </label>
                    <select
                      value={status}
                      onChange={(e) => {
                        const nextSt = e.target.value as JobApplicationStatus;
                        setStatus(nextSt);
                        if (!appliedDate && nextSt !== 'interessado') {
                          setAppliedDate(toISODateString(new Date()));
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                    >
                      {Object.entries(JOB_STATUS_CONFIG).map(([key, cfg]) => (
                        <option key={key} value={key}>
                          {cfg.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                      Data da Inscrição (Opcional)
                    </label>
                    <input
                      type="date"
                      value={appliedDate}
                      onChange={(e) => setAppliedDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                      Próxima Etapa ou Compromisso (Opcional)
                    </label>
                    <input
                      type="text"
                      value={nextStep}
                      onChange={(e) => setNextStep(e.target.value)}
                      placeholder="Ex: Entrevista com RH, Entregar Teste Técnico..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                      Data da Próxima Etapa
                    </label>
                    <input
                      type="date"
                      value={nextStepDate}
                      onChange={(e) => setNextStepDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                      Devolutiva da Empresa (Opcional)
                    </label>
                    <textarea
                      rows={2}
                      value={companyFeedback}
                      onChange={(e) => setCompanyFeedback(e.target.value)}
                      placeholder="Feedback recebido na triagem, teste ou entrevista..."
                      className="w-full px-3.5 py-2 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                      Observações Pessoais (Opcional)
                    </label>
                    <textarea
                      rows={2}
                      value={personalNotes}
                      onChange={(e) => setPersonalNotes(e.target.value)}
                      placeholder="Dicas para a entrevista, nome do recrutador, dúvidas..."
                      className="w-full px-3.5 py-2 rounded-xl bg-[#16131D] border border-[#322B40] text-sm text-[#F5F2F8] resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#322B40]">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#16131D] text-[#A89FBD] border border-[#322B40]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-pink-400 text-[#16131D] hover:bg-pink-300 transition"
                >
                  {editingJobId ? 'Salvar Alterações' : 'Cadastrar Vaga'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: DETALHES COMPLETOS DA VAGA & HISTÓRICO DA CANDIDATURA
         ===================================================================== */}
      {selectedDetailJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={() => setSelectedDetailJobId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#211C2B] border border-[#322B40] rounded-2xl w-full max-w-2xl p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5"
          >
            {/* Topo do Modal de Detalhes */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#322B40]">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-pink-300">
                    {selectedDetailJob.company}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#16131D] text-purple-300 border border-[#322B40]">
                    {OPPORTUNITY_TYPE_LABELS[selectedDetailJob.opportunityType]}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#16131D] text-pink-300 border border-[#322B40]">
                    {WORK_MODE_LABELS[selectedDetailJob.workMode]}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F5F2F8]">
                  {selectedDetailJob.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-[#A89FBD] flex-wrap">
                  {selectedDetailJob.area && (
                    <span>Área: {selectedDetailJob.area}</span>
                  )}
                  {selectedDetailJob.location && (
                    <span>📍 {selectedDetailJob.location}</span>
                  )}
                  {selectedDetailJob.appliedDate && (
                    <span>
                      Inscrição:{' '}
                      {formatReadableDate(selectedDetailJob.appliedDate)}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedDetailJobId(null)}
                className="p-1.5 rounded-xl bg-[#16131D] text-[#A89FBD] hover:text-[#F5F2F8] border border-[#322B40]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Barra de Status Atual + Ações Rápidas */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#16131D] border border-[#322B40]">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold text-[#A89FBD]">
                  Status Atual:
                </span>
                <select
                  value={selectedDetailJob.status}
                  onChange={(e) =>
                    updateJobStatus(
                      selectedDetailJob.id,
                      e.target.value as JobApplicationStatus
                    )
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    JOB_STATUS_CONFIG[selectedDetailJob.status].badgeClass
                  }`}
                >
                  {Object.entries(JOB_STATUS_CONFIG).map(([key, cfg]) => (
                    <option
                      key={key}
                      value={key}
                      className="bg-[#16131D] text-[#F5F2F8]"
                    >
                      {cfg.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                {selectedDetailJob.link && (
                  <a
                    href={
                      selectedDetailJob.link.startsWith('http')
                        ? selectedDetailJob.link
                        : `https://${selectedDetailJob.link}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 text-sky-300 border border-sky-400/30 text-xs font-semibold hover:bg-sky-500/25 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir Vaga</span>
                  </a>
                )}

                <button
                  onClick={() => openShareModal(selectedDetailJob)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-400/30 text-xs font-semibold hover:bg-purple-500/25 transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Compartilhar</span>
                </button>

                <button
                  onClick={() => {
                    const jobToEdit = selectedDetailJob;
                    setSelectedDetailJobId(null);
                    openEditJobModal(jobToEdit);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#211C2B] text-[#F5F2F8] border border-[#322B40] text-xs font-semibold hover:bg-[#292336] transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
              </div>
            </div>

            {/* Informações e Notas da Candidatura */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-xl bg-[#16131D] border border-[#322B40] space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300">
                  Próxima Etapa / Compromisso
                </span>
                <p className="text-xs font-semibold text-[#F5F2F8]">
                  {selectedDetailJob.nextStep || 'Nenhuma etapa agendada'}
                </p>
                {selectedDetailJob.nextStepDate && (
                  <p className="text-[11px] text-[#A89FBD]">
                    Data: {formatReadableDate(selectedDetailJob.nextStepDate)}
                  </p>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-[#16131D] border border-[#322B40] space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                  Devolutiva da Empresa
                </span>
                <p className="text-xs text-[#F5F2F8] whitespace-pre-line">
                  {selectedDetailJob.companyFeedback ||
                    'Nenhuma devolutiva registrada até o momento.'}
                </p>
              </div>
            </div>

            {selectedDetailJob.description && (
              <div className="p-3.5 rounded-xl bg-[#16131D] border border-[#322B40] space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#A89FBD]">
                  Descrição da Oportunidade
                </span>
                <p className="text-xs text-[#F5F2F8] whitespace-pre-line leading-relaxed">
                  {selectedDetailJob.description}
                </p>
              </div>
            )}

            {selectedDetailJob.personalNotes && (
              <div className="p-3.5 rounded-xl bg-[#16131D] border border-pink-400/25 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-pink-300">
                  Observações Pessoais (Privado)
                </span>
                <p className="text-xs text-[#F5F2F8] whitespace-pre-line leading-relaxed">
                  {selectedDetailJob.personalNotes}
                </p>
              </div>
            )}

            {/* Linha do Tempo / Histórico da Candidatura */}
            <div className="pt-3 border-t border-[#322B40] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-pink-300" />
                  <h4 className="text-sm font-bold text-[#F5F2F8]">
                    Histórico da Candidatura
                  </h4>
                </div>
                <span className="text-[11px] text-[#A89FBD]">
                  {(selectedDetailJob.history || []).length} registro(s)
                </span>
              </div>

              <form onSubmit={handleAddHistoryComment} className="flex gap-2">
                <input
                  type="text"
                  value={newHistoryNote}
                  onChange={(e) => setNewHistoryNote(e.target.value)}
                  placeholder="Registrar acontecimento no histórico (ex: Fiz teste na Gupy, Entrevista com gestor)..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#16131D] border border-[#322B40] focus:border-pink-400 focus:outline-none text-xs text-[#F5F2F8]"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-400/30 text-xs font-bold shrink-0 transition"
                >
                  + Registrar
                </button>
              </form>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {(selectedDetailJob.history || []).map((h) => {
                  const st =
                    JOB_STATUS_CONFIG[h.status] ||
                    JOB_STATUS_CONFIG.interessado;
                  return (
                    <div
                      key={h.id}
                      className="p-3 rounded-xl bg-[#16131D] border border-[#322B40] flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-2.5">
                        <span
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${st.dotClass}`}
                        />
                        <div>
                          <p className="text-xs font-medium text-[#F5F2F8]">
                            {h.note}
                          </p>
                          <span className={`text-[10px] font-bold ${st.textClass}`}>
                            {st.shortLabel}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#A89FBD] shrink-0">
                        {formatDateTimePtBR(h.date)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: COMPARTILHAR VAGA COM OUTRO USUÁRIO DO PLANNER HUB
         ===================================================================== */}
      {sharingJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={() => setSharingJob(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#211C2B] border border-[#322B40] rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#322B40]">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-purple-300" />
                <h3 className="text-base font-bold text-[#F5F2F8]">
                  Compartilhar Oportunidade
                </h3>
              </div>
              <button
                onClick={() => setSharingJob(null)}
                className="text-[#A89FBD] hover:text-[#F5F2F8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Resumo do que será enviado */}
            <div className="p-3.5 rounded-xl bg-[#16131D] border border-purple-400/30 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                Oportunidade que será enviada
              </div>
              <div className="text-sm font-bold text-[#F5F2F8]">
                {sharingJob.title} •{' '}
                <span className="text-pink-300">{sharingJob.company}</span>
              </div>
              <div className="text-[11px] text-[#A89FBD]">
                {OPPORTUNITY_TYPE_LABELS[sharingJob.opportunityType]} •{' '}
                {WORK_MODE_LABELS[sharingJob.workMode]}
                {sharingJob.location ? ` • ${sharingJob.location}` : ''}
              </div>
              <div className="pt-1 flex items-center gap-1 text-[10px] text-emerald-300">
                <Lock className="w-3 h-3" />
                <span>
                  Status pessoal, devolutivas, notas e histórico não são enviados.
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmShare} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#A89FBD] mb-1.5">
                  Pesquisar e selecionar usuário do Planner Hub *
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#A89FBD] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Digite o nome ou @usuario..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#16131D] border border-[#322B40] text-xs text-[#F5F2F8]"
                  />
                </div>

                <div className="mt-2 max-h-36 overflow-y-auto rounded-xl bg-[#16131D] border border-[#322B40] divide-y divide-[#322B40]/60">
                  {isSearchingUsers ? (
                    <div className="p-3 text-center text-xs text-[#A89FBD]">
                      Buscando usuários...
                    </div>
                  ) : availableUsers.length === 0 ? (
                    <div className="p-3 text-center text-xs text-[#A89FBD]">
                      Nenhum outro usuário encontrado.
                    </div>
                  ) : (
                    availableUsers.map((u) => {
                      const isSel = selectedRecipient?.username === u.username;
                      return (
                        <button
                          key={u.username}
                          type="button"
                          onClick={() => setSelectedRecipient(u)}
                          className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs transition ${
                            isSel
                              ? 'bg-purple-500/20 text-purple-200 font-bold'
                              : 'text-[#F5F2F8] hover:bg-[#292336]'
                          }`}
                        >
                          <div>
                            <span>{u.displayName}</span>{' '}
                            <span className="text-[#A89FBD]">
                              @{u.username}
                            </span>
                          </div>
                          {isSel && (
                            <CheckCircle2 className="w-4 h-4 text-purple-300" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A89FBD] mb-1">
                  Mensagem opcional para o colega
                </label>
                <input
                  type="text"
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  placeholder="Ex: Vi essa vaga e lembrei de você!"
                  className="w-full px-3 py-2 rounded-xl bg-[#16131D] border border-[#322B40] text-xs text-[#F5F2F8]"
                />
              </div>

              {shareError && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-400/30 text-xs text-rose-300">
                  {shareError}
                </div>
              )}

              {shareSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-xs text-emerald-300">
                  {shareSuccess}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSharingJob(null)}
                  className="px-3.5 py-2 rounded-xl text-xs bg-[#16131D] text-[#A89FBD] border border-[#322B40]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSendingShare || !selectedRecipient}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-pink-400 text-[#16131D] hover:bg-pink-300 disabled:opacity-40 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {isSendingShare ? 'Enviando...' : 'Compartilhar Vaga'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
