import { create } from 'zustand';
import {
  AppTheme,
  CalendarEvent,
  CollegeSubject,
  ExamPlan,
  ExamSubject,
  FixedClassSlot,
  JobApplicationStatus,
  JobOpportunity,
  NavigationTab,
  PlannerDataState,
  SharedJobItem,
  TabletNoteAttachment,
  UnitAssessment,
  UserAccount,
} from '../types';
import { storageService } from '../services/storageService';
import { getInitialPlannerData } from '../utils/initialData';
import { applyThemeToDOM } from '../utils/themeConfig';

interface PlannerStore extends PlannerDataState {
  currentUser: UserAccount | null;
  theme: AppTheme;
  activeTab: NavigationTab;
  isLoading: boolean;
  syncStatus: 'local' | 'cloud' | 'saving';
  previewAttachment: TabletNoteAttachment | null;

  initializeStore: () => Promise<void>;
  login: (username: string, password?: string) => Promise<void>;
  register: (
    displayName: string,
    username: string,
    password: string,
    theme: AppTheme
  ) => Promise<void>;
  logout: () => void;
  setTheme: (theme: AppTheme) => Promise<void>;
  setActiveTab: (tab: NavigationTab) => void;
  setPreviewAttachment: (att: TabletNoteAttachment | null) => void;

  // Quick Notes
  updateQuickNotes: (text: string) => void;

  // Calendar Events
  addEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
  updateEvent: (event: CalendarEvent) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  // Fixed College Schedule
  addFixedClass: (slot: Omit<FixedClassSlot, 'id'>) => Promise<void>;
  updateFixedClass: (slot: FixedClassSlot) => Promise<void>;
  deleteFixedClass: (id: string) => Promise<void>;

  // College Subjects, Units, Tablet Notes & Assessments
  addCollegeSubject: (
    subject: Omit<CollegeSubject, 'id' | 'units'>,
    initialSchedules?: Omit<FixedClassSlot, 'id' | 'subjectId' | 'subjectName'>[]
  ) => Promise<string>;
  setSubjectSchedules: (
    subjectId: string,
    schedules: Omit<FixedClassSlot, 'id' | 'subjectId' | 'subjectName'>[]
  ) => Promise<void>;
  deleteCollegeSubject: (subjectId: string) => Promise<void>;
  uploadUnitTabletNote: (
    subjectId: string,
    unitNumber: 1 | 2 | 3,
    file: File,
    title: string,
    dateIso: string
  ) => Promise<void>;
  deleteUnitTabletNote: (
    subjectId: string,
    unitNumber: 1 | 2 | 3,
    noteId: string,
    storageKey: string
  ) => Promise<void>;
  addUnitAssessment: (
    subjectId: string,
    unitNumber: 1 | 2 | 3,
    assessment: Omit<UnitAssessment, 'id'>
  ) => Promise<void>;
  toggleUnitAssessment: (
    subjectId: string,
    unitNumber: 1 | 2 | 3,
    assessmentId: string
  ) => Promise<void>;
  deleteUnitAssessment: (
    subjectId: string,
    unitNumber: 1 | 2 | 3,
    assessmentId: string
  ) => Promise<void>;

  // Múltiplos Concursos (ExamPlan) + Matérias e Tópicos por Concurso
  addExamPlan: (
    name: string,
    boardOrAgency: string,
    examDate?: string
  ) => Promise<string>;
  updateExamPlan: (
    examId: string,
    updates: Partial<Pick<ExamPlan, 'name' | 'boardOrAgency' | 'examDate'>>
  ) => Promise<void>;
  deleteExamPlan: (examId: string) => Promise<void>;

  addExamSubject: (
    examId: string,
    name: string,
    categoryTag: string
  ) => Promise<void>;
  deleteExamSubject: (examId: string, subjectId: string) => Promise<void>;
  addExamTopic: (
    examId: string,
    subjectId: string,
    title: string
  ) => Promise<void>;
  toggleExamTopicCheck: (
    examId: string,
    subjectId: string,
    topicId: string,
    field: 'teoria' | 'resumo' | 'questoes' | 'revisao'
  ) => Promise<void>;
  deleteExamTopic: (
    examId: string,
    subjectId: string,
    topicId: string
  ) => Promise<void>;
  uploadExamTopicTabletNote: (
    examId: string,
    subjectId: string,
    topicId: string,
    file: File,
    title: string,
    dateIso: string
  ) => Promise<void>;
  deleteExamTopicTabletNote: (
    examId: string,
    subjectId: string,
    topicId: string,
    storageKey: string
  ) => Promise<void>;

  // Controle de Vagas & Compartilhamento
  jobs: JobOpportunity[];
  sharedJobsReceived: SharedJobItem[];
  sharedJobsSent: SharedJobItem[];
  addJobOpportunity: (
    jobData: Omit<JobOpportunity, 'id' | 'history' | 'createdAt' | 'updatedAt'>
  ) => Promise<string>;
  updateJobOpportunity: (
    jobId: string,
    updates: Partial<Omit<JobOpportunity, 'id' | 'createdAt'>>
  ) => Promise<void>;
  updateJobStatus: (
    jobId: string,
    newStatus: JobApplicationStatus,
    customNote?: string
  ) => Promise<void>;
  addJobHistoryNote: (jobId: string, note: string) => Promise<void>;
  deleteJobOpportunity: (jobId: string) => Promise<void>;
  refreshSharedJobs: () => Promise<void>;
  shareJob: (
    recipientUsername: string,
    job: JobOpportunity,
    message?: string
  ) => Promise<void>;
  acceptSharedJob: (sharedItem: SharedJobItem) => Promise<string>;
  dismissSharedJob: (shareId: string) => Promise<void>;

  // Backup & Restore
  exportBackup: () => Promise<void>;
  importBackup: (file: File) => Promise<void>;
  resetToDemoData: () => Promise<void>;
}

const JOB_STATUS_LABELS: Record<JobApplicationStatus, string> = {
  interessado: 'Interessado',
  inscrito: 'Inscrição Realizada',
  em_analise: 'Em Análise',
  teste_tecnico: 'Teste Técnico',
  entrevista: 'Entrevista',
  aprovado: 'Aprovado',
  reprovado: 'Reprovado',
  desistencia: 'Desistência',
};

function extractDataState(store: PlannerStore): PlannerDataState {
  return {
    events: store.events,
    fixedClasses: store.fixedClasses,
    collegeSubjects: store.collegeSubjects,
    exams: store.exams,
    jobs: store.jobs || [],
    theme: store.theme,
    quickNotes: store.quickNotes,
    quickNotesUpdatedAt: store.quickNotesUpdatedAt,
    lastSyncedAt: store.lastSyncedAt,
  };
}

export const usePlannerStore = create<PlannerStore>((set, get) => {
  const initial = getInitialPlannerData();
  const savedUser = storageService.getActiveUser();
  const initialTheme: AppTheme = savedUser?.theme || initial.theme || 'rose';
  applyThemeToDOM(initialTheme);

  const persistCurrentState = async () => {
    set({ syncStatus: 'saving' });
    const storeState = get();
    const data = extractDataState(storeState);
    await storageService.saveState(data, storeState.currentUser);
    set({
      syncStatus: storageService.getSyncMode(),
      lastSyncedAt: new Date().toISOString(),
    });
  };

  return {
    ...initial,
    jobs: initial.jobs || [],
    sharedJobsReceived: [],
    sharedJobsSent: [],
    currentUser: savedUser,
    theme: initialTheme,
    activeTab: 'dashboard',
    isLoading: true,
    syncStatus: storageService.getSyncMode(),
    previewAttachment: null,

    initializeStore: async () => {
      const user = storageService.getActiveUser();
      if (!user) {
        set({ isLoading: false, currentUser: null });
        return;
      }
      set({ isLoading: true, currentUser: user });
      const [loaded, shared] = await Promise.all([
        storageService.loadState(user),
        storageService.listSharedJobs(user),
      ]);
      const resolvedTheme: AppTheme = loaded.theme || user.theme || 'rose';
      applyThemeToDOM(resolvedTheme);
      set({
        ...loaded,
        jobs: loaded.jobs || [],
        sharedJobsReceived: shared.received,
        sharedJobsSent: shared.sent,
        currentUser: { ...user, theme: resolvedTheme },
        theme: resolvedTheme,
        isLoading: false,
        syncStatus: storageService.getSyncMode(),
      });
    },

    login: async (username, password) => {
      set({ isLoading: true });
      try {
        const account = await storageService.loginUser(username, password);
        const [loaded, shared] = await Promise.all([
          storageService.loadState(account),
          storageService.listSharedJobs(account),
        ]);
        const resolvedTheme: AppTheme = loaded.theme || account.theme || 'rose';
        applyThemeToDOM(resolvedTheme);
        set({
          ...loaded,
          jobs: loaded.jobs || [],
          sharedJobsReceived: shared.received,
          sharedJobsSent: shared.sent,
          currentUser: { ...account, theme: resolvedTheme },
          theme: resolvedTheme,
          activeTab: 'dashboard',
          isLoading: false,
          syncStatus: storageService.getSyncMode(),
        });
      } catch (err) {
        set({ isLoading: false });
        throw err;
      }
    },

    register: async (displayName, username, password, theme) => {
      set({ isLoading: true });
      try {
        const account = await storageService.registerUser(
          displayName,
          username,
          password,
          theme
        );
        const [loaded, shared] = await Promise.all([
          storageService.loadState(account),
          storageService.listSharedJobs(account),
        ]);
        applyThemeToDOM(theme);
        set({
          ...loaded,
          jobs: loaded.jobs || [],
          sharedJobsReceived: shared.received,
          sharedJobsSent: shared.sent,
          currentUser: account,
          theme,
          activeTab: 'dashboard',
          isLoading: false,
          syncStatus: storageService.getSyncMode(),
        });
      } catch (err) {
        set({ isLoading: false });
        throw err;
      }
    },

    logout: () => {
      storageService.logoutUser();
      set({
        currentUser: null,
        sharedJobsReceived: [],
        sharedJobsSent: [],
        activeTab: 'dashboard',
      });
    },

    setTheme: async (newTheme) => {
      applyThemeToDOM(newTheme);
      const user = get().currentUser;
      let updatedUser = user;
      if (user) {
        updatedUser = await storageService.updateUserTheme(user, newTheme);
      }
      set({
        theme: newTheme,
        currentUser: updatedUser,
      });
      await persistCurrentState();
    },

    setActiveTab: (tab) => set({ activeTab: tab }),
    setPreviewAttachment: (att) => set({ previewAttachment: att }),

    updateQuickNotes: (text) => {
      const nowTime = new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      set({
        quickNotes: text,
        quickNotesUpdatedAt: nowTime,
      });
      persistCurrentState();
    },

    addEvent: async (eventData) => {
      const newEvent: CalendarEvent = {
        ...eventData,
        id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };
      set((state) => ({ events: [...state.events, newEvent] }));
      await persistCurrentState();
    },

    updateEvent: async (updated) => {
      set((state) => ({
        events: state.events.map((e) => (e.id === updated.id ? updated : e)),
      }));
      await persistCurrentState();
    },

    deleteEvent: async (id) => {
      set((state) => ({
        events: state.events.filter((e) => e.id !== id),
      }));
      await persistCurrentState();
    },

    addFixedClass: async (slotData) => {
      const newSlot: FixedClassSlot = {
        ...slotData,
        id: `cls-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };
      set((state) => ({ fixedClasses: [...state.fixedClasses, newSlot] }));
      await persistCurrentState();
    },

    updateFixedClass: async (updated) => {
      set((state) => ({
        fixedClasses: state.fixedClasses.map((c) =>
          c.id === updated.id ? updated : c
        ),
      }));
      await persistCurrentState();
    },

    deleteFixedClass: async (id) => {
      set((state) => ({
        fixedClasses: state.fixedClasses.filter((c) => c.id !== id),
      }));
      await persistCurrentState();
    },

    addCollegeSubject: async (subjectData, initialSchedules = []) => {
      const id = `subj-${Date.now()}`;
      const newSubject: CollegeSubject = {
        ...subjectData,
        id,
        units: [
          { id: `u1-${id}`, unitNumber: 1, title: '1ª Unidade', tabletNotes: [], assessments: [] },
          { id: `u2-${id}`, unitNumber: 2, title: '2ª Unidade', tabletNotes: [], assessments: [] },
          { id: `u3-${id}`, unitNumber: 3, title: '3ª Unidade', tabletNotes: [], assessments: [] },
        ],
      };

      const createdSlots: FixedClassSlot[] = initialSchedules.map((slot, idx) => ({
        id: `cls-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        subjectId: id,
        subjectName: subjectData.name,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        room: slot.room || subjectData.room || 'Sala',
        professor: slot.professor || subjectData.professor || '',
      }));

      set((state) => ({
        collegeSubjects: [...state.collegeSubjects, newSubject],
        fixedClasses: [...state.fixedClasses, ...createdSlots],
      }));
      await persistCurrentState();
      return id;
    },

    setSubjectSchedules: async (subjectId, schedules) => {
      const state = get();
      const subj = state.collegeSubjects.find((s) => s.id === subjectId);
      if (!subj) return;

      const otherClasses = state.fixedClasses.filter(
        (c) =>
          c.subjectId !== subjectId &&
          c.subjectName.toLowerCase() !== subj.name.toLowerCase()
      );

      const newSlots: FixedClassSlot[] = schedules.map((slot, idx) => ({
        id: `cls-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        subjectId: subj.id,
        subjectName: subj.name,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        room: slot.room || subj.room || 'Sala',
        professor: slot.professor || subj.professor || '',
      }));

      set({
        fixedClasses: [...otherClasses, ...newSlots],
      });
      await persistCurrentState();
    },

    deleteCollegeSubject: async (subjectId) => {
      set((state) => ({
        collegeSubjects: state.collegeSubjects.filter((s) => s.id !== subjectId),
        fixedClasses: state.fixedClasses.filter((c) => c.subjectId !== subjectId),
      }));
      await persistCurrentState();
    },

    uploadUnitTabletNote: async (subjectId, unitNumber, file, title, dateIso) => {
      const attachment = await storageService.uploadTabletFile(file, title, dateIso);
      set((state) => ({
        collegeSubjects: state.collegeSubjects.map((subj) => {
          if (subj.id !== subjectId) return subj;
          return {
            ...subj,
            units: subj.units.map((u) =>
              u.unitNumber === unitNumber
                ? { ...u, tabletNotes: [attachment, ...u.tabletNotes] }
                : u
            ),
          };
        }),
      }));
      await persistCurrentState();
    },

    deleteUnitTabletNote: async (subjectId, unitNumber, noteId, storageKey) => {
      await storageService.deleteTabletFile(storageKey);
      set((state) => ({
        collegeSubjects: state.collegeSubjects.map((subj) => {
          if (subj.id !== subjectId) return subj;
          return {
            ...subj,
            units: subj.units.map((u) =>
              u.unitNumber === unitNumber
                ? {
                    ...u,
                    tabletNotes: u.tabletNotes.filter((n) => n.id !== noteId),
                  }
                : u
            ),
          };
        }),
      }));
      await persistCurrentState();
    },

    addUnitAssessment: async (subjectId, unitNumber, assessmentData) => {
      const newAssessment: UnitAssessment = {
        ...assessmentData,
        id: `ass-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };
      set((state) => ({
        collegeSubjects: state.collegeSubjects.map((subj) => {
          if (subj.id !== subjectId) return subj;
          return {
            ...subj,
            units: subj.units.map((u) =>
              u.unitNumber === unitNumber
                ? { ...u, assessments: [...u.assessments, newAssessment] }
                : u
            ),
          };
        }),
      }));
      await persistCurrentState();
    },

    toggleUnitAssessment: async (subjectId, unitNumber, assessmentId) => {
      set((state) => ({
        collegeSubjects: state.collegeSubjects.map((subj) => {
          if (subj.id !== subjectId) return subj;
          return {
            ...subj,
            units: subj.units.map((u) =>
              u.unitNumber === unitNumber
                ? {
                    ...u,
                    assessments: u.assessments.map((a) =>
                      a.id === assessmentId ? { ...a, completed: !a.completed } : a
                    ),
                  }
                : u
            ),
          };
        }),
      }));
      await persistCurrentState();
    },

    deleteUnitAssessment: async (subjectId, unitNumber, assessmentId) => {
      set((state) => ({
        collegeSubjects: state.collegeSubjects.map((subj) => {
          if (subj.id !== subjectId) return subj;
          return {
            ...subj,
            units: subj.units.map((u) =>
              u.unitNumber === unitNumber
                ? {
                    ...u,
                    assessments: u.assessments.filter((a) => a.id !== assessmentId),
                  }
                : u
            ),
          };
        }),
      }));
      await persistCurrentState();
    },

    // Múltiplos Concursos
    addExamPlan: async (name, boardOrAgency, examDate) => {
      const id = `exam-${Date.now()}`;
      const newPlan: ExamPlan = {
        id,
        name: name.trim(),
        boardOrAgency: boardOrAgency.trim() || 'Banca a definir',
        examDate: examDate || undefined,
        subjects: [],
      };
      set((state) => ({ exams: [...state.exams, newPlan] }));
      await persistCurrentState();
      return id;
    },

    updateExamPlan: async (examId, updates) => {
      set((state) => ({
        exams: state.exams.map((ex) =>
          ex.id === examId ? { ...ex, ...updates } : ex
        ),
      }));
      await persistCurrentState();
    },

    deleteExamPlan: async (examId) => {
      set((state) => ({
        exams: state.exams.filter((ex) => ex.id !== examId),
      }));
      await persistCurrentState();
    },

    addExamSubject: async (examId, name, categoryTag) => {
      const newSubj: ExamSubject = {
        id: `exam-subj-${Date.now()}`,
        name,
        categoryTag: categoryTag || 'Específicas',
        topics: [],
      };
      set((state) => ({
        exams: state.exams.map((ex) =>
          ex.id === examId
            ? { ...ex, subjects: [...ex.subjects, newSubj] }
            : ex
        ),
      }));
      await persistCurrentState();
    },

    deleteExamSubject: async (examId, subjectId) => {
      set((state) => ({
        exams: state.exams.map((ex) =>
          ex.id === examId
            ? {
                ...ex,
                subjects: ex.subjects.filter((s) => s.id !== subjectId),
              }
            : ex
        ),
      }));
      await persistCurrentState();
    },

    addExamTopic: async (examId, subjectId, title) => {
      set((state) => ({
        exams: state.exams.map((ex) => {
          if (ex.id !== examId) return ex;
          return {
            ...ex,
            subjects: ex.subjects.map((subj) => {
              if (subj.id !== subjectId) return subj;
              return {
                ...subj,
                topics: [
                  ...subj.topics,
                  {
                    id: `top-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                    title,
                    teoria: false,
                    resumo: false,
                    questoes: false,
                    revisao: false,
                  },
                ],
              };
            }),
          };
        }),
      }));
      await persistCurrentState();
    },

    toggleExamTopicCheck: async (examId, subjectId, topicId, field) => {
      set((state) => ({
        exams: state.exams.map((ex) => {
          if (ex.id !== examId) return ex;
          return {
            ...ex,
            subjects: ex.subjects.map((subj) => {
              if (subj.id !== subjectId) return subj;
              return {
                ...subj,
                topics: subj.topics.map((t) =>
                  t.id === topicId ? { ...t, [field]: !t[field] } : t
                ),
              };
            }),
          };
        }),
      }));
      await persistCurrentState();
    },

    deleteExamTopic: async (examId, subjectId, topicId) => {
      set((state) => ({
        exams: state.exams.map((ex) => {
          if (ex.id !== examId) return ex;
          return {
            ...ex,
            subjects: ex.subjects.map((subj) => {
              if (subj.id !== subjectId) return subj;
              return {
                ...subj,
                topics: subj.topics.filter((t) => t.id !== topicId),
              };
            }),
          };
        }),
      }));
      await persistCurrentState();
    },

    uploadExamTopicTabletNote: async (
      examId,
      subjectId,
      topicId,
      file,
      title,
      dateIso
    ) => {
      const attachment = await storageService.uploadTabletFile(
        file,
        title,
        dateIso
      );
      set((state) => ({
        exams: state.exams.map((ex) => {
          if (ex.id !== examId) return ex;
          return {
            ...ex,
            subjects: ex.subjects.map((subj) => {
              if (subj.id !== subjectId) return subj;
              return {
                ...subj,
                topics: subj.topics.map((t) =>
                  t.id === topicId
                    ? { ...t, tabletNote: attachment, resumo: true }
                    : t
                ),
              };
            }),
          };
        }),
      }));
      await persistCurrentState();
    },

    deleteExamTopicTabletNote: async (
      examId,
      subjectId,
      topicId,
      storageKey
    ) => {
      await storageService.deleteTabletFile(storageKey);
      set((state) => ({
        exams: state.exams.map((ex) => {
          if (ex.id !== examId) return ex;
          return {
            ...ex,
            subjects: ex.subjects.map((subj) => {
              if (subj.id !== subjectId) return subj;
              return {
                ...subj,
                topics: subj.topics.map((t) =>
                  t.id === topicId ? { ...t, tabletNote: undefined } : t
                ),
              };
            }),
          };
        }),
      }));
      await persistCurrentState();
    },

    exportBackup: async () => {
      const data = extractDataState(get());
      await storageService.exportBackupJson(data);
    },

    // Controle de Vagas & Compartilhamento
    addJobOpportunity: async (jobData) => {
      const nowIso = new Date().toISOString();
      const id = `job-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const statusLabel = JOB_STATUS_LABELS[jobData.status] || jobData.status;
      const newJob: JobOpportunity = {
        ...jobData,
        id,
        history: [
          {
            id: `hist-${Date.now()}`,
            date: nowIso,
            status: jobData.status,
            note: `Vaga cadastrada (${statusLabel})`,
          },
        ],
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      set((state) => ({ jobs: [newJob, ...(state.jobs || [])] }));
      await persistCurrentState();
      return id;
    },

    updateJobOpportunity: async (jobId, updates) => {
      const nowIso = new Date().toISOString();
      set((state) => ({
        jobs: (state.jobs || []).map((job) => {
          if (job.id !== jobId) return job;
          const nextHistory = [...(job.history || [])];
          if (updates.status && updates.status !== job.status) {
            const oldLabel = JOB_STATUS_LABELS[job.status] || job.status;
            const newLabel = JOB_STATUS_LABELS[updates.status] || updates.status;
            nextHistory.unshift({
              id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
              date: nowIso,
              status: updates.status,
              note: `Status alterado de "${oldLabel}" para "${newLabel}"`,
            });
          }
          if (
            updates.companyFeedback &&
            updates.companyFeedback !== job.companyFeedback
          ) {
            nextHistory.unshift({
              id: `hist-fb-${Date.now()}`,
              date: nowIso,
              status: updates.status || job.status,
              note: `Devolutiva registrada: ${updates.companyFeedback}`,
            });
          }
          return {
            ...job,
            ...updates,
            history: updates.history || nextHistory,
            updatedAt: nowIso,
          };
        }),
      }));
      await persistCurrentState();
    },

    updateJobStatus: async (jobId, newStatus, customNote) => {
      const nowIso = new Date().toISOString();
      set((state) => ({
        jobs: (state.jobs || []).map((job) => {
          if (job.id !== jobId) return job;
          if (job.status === newStatus && !customNote) return job;
          const oldLabel = JOB_STATUS_LABELS[job.status] || job.status;
          const newLabel = JOB_STATUS_LABELS[newStatus] || newStatus;
          const appliedDate =
            !job.appliedDate && newStatus !== 'interessado'
              ? nowIso.slice(0, 10)
              : job.appliedDate;
          return {
            ...job,
            status: newStatus,
            appliedDate,
            updatedAt: nowIso,
            history: [
              {
                id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                date: nowIso,
                status: newStatus,
                note:
                  customNote ||
                  `Status alterado de "${oldLabel}" para "${newLabel}"`,
              },
              ...(job.history || []),
            ],
          };
        }),
      }));
      await persistCurrentState();
    },

    addJobHistoryNote: async (jobId, note) => {
      if (!note.trim()) return;
      const nowIso = new Date().toISOString();
      set((state) => ({
        jobs: (state.jobs || []).map((job) => {
          if (job.id !== jobId) return job;
          return {
            ...job,
            updatedAt: nowIso,
            history: [
              {
                id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                date: nowIso,
                status: job.status,
                note: note.trim(),
              },
              ...(job.history || []),
            ],
          };
        }),
      }));
      await persistCurrentState();
    },

    deleteJobOpportunity: async (jobId) => {
      set((state) => ({
        jobs: (state.jobs || []).filter((j) => j.id !== jobId),
      }));
      await persistCurrentState();
    },

    refreshSharedJobs: async () => {
      const user = get().currentUser;
      if (!user) return;
      const shared = await storageService.listSharedJobs(user);
      set({
        sharedJobsReceived: shared.received,
        sharedJobsSent: shared.sent,
      });
    },

    shareJob: async (recipientUsername, job, message) => {
      const user = get().currentUser;
      const created = await storageService.shareJobWithUser(
        recipientUsername,
        job,
        message,
        user
      );
      set((state) => ({
        sharedJobsSent: [created, ...state.sharedJobsSent],
      }));
    },

    acceptSharedJob: async (sharedItem) => {
      const user = get().currentUser;
      const nowIso = new Date().toISOString();
      const id = `job-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const p = sharedItem.jobPayload;

      // Cria um registro 100% independente na lista do destinatário, sem qualquer vínculo com dados pessoais do remetente
      const independentJob: JobOpportunity = {
        id,
        company: p.company || 'Empresa',
        title: p.title || 'Oportunidade',
        link: p.link || undefined,
        description: p.description || undefined,
        area: p.area || undefined,
        workMode: p.workMode || 'remoto',
        location: p.location || undefined,
        opportunityType: p.opportunityType || 'estagio',
        status: 'interessado',
        sharedBy: {
          username: sharedItem.senderUsername,
          displayName: sharedItem.senderDisplayName,
        },
        history: [
          {
            id: `hist-${Date.now()}`,
            date: nowIso,
            status: 'interessado',
            note: `Oportunidade recebida de ${sharedItem.senderDisplayName} (@${sharedItem.senderUsername}) e adicionada à sua lista`,
          },
        ],
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      await storageService.respondToSharedJob(
        sharedItem.id,
        'accepted',
        user
      );

      set((state) => ({
        jobs: [independentJob, ...(state.jobs || [])],
        sharedJobsReceived: state.sharedJobsReceived.map((item) =>
          item.id === sharedItem.id ? { ...item, status: 'accepted' } : item
        ),
      }));

      await persistCurrentState();
      return id;
    },

    dismissSharedJob: async (shareId) => {
      const user = get().currentUser;
      await storageService.respondToSharedJob(shareId, 'dismissed', user);
      set((state) => ({
        sharedJobsReceived: state.sharedJobsReceived.filter(
          (item) => item.id !== shareId
        ),
      }));
    },

    importBackup: async (file) => {
      const restored = await storageService.importBackupJson(file);
      set({
        ...restored,
        syncStatus: storageService.getSyncMode(),
      });
    },

    resetToDemoData: async () => {
      const demo = getInitialPlannerData();
      await storageService.saveState(demo);
      set({
        ...demo,
        syncStatus: storageService.getSyncMode(),
      });
    },
  };
});
