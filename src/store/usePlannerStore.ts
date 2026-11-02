import { create } from 'zustand';
import {
  AppTheme,
  CalendarEvent,
  CollegeSubject,
  ExamPlan,
  ExamSubject,
  FixedClassSlot,
  NavigationTab,
  PlannerDataState,
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
    subject: Omit<CollegeSubject, 'id' | 'units'>
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

  // Backup & Restore
  exportBackup: () => Promise<void>;
  importBackup: (file: File) => Promise<void>;
  resetToDemoData: () => Promise<void>;
}

function extractDataState(store: PlannerStore): PlannerDataState {
  return {
    events: store.events,
    fixedClasses: store.fixedClasses,
    collegeSubjects: store.collegeSubjects,
    exams: store.exams,
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
      const loaded = await storageService.loadState(user);
      const resolvedTheme: AppTheme = loaded.theme || user.theme || 'rose';
      applyThemeToDOM(resolvedTheme);
      set({
        ...loaded,
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
        const loaded = await storageService.loadState(account);
        const resolvedTheme: AppTheme = loaded.theme || account.theme || 'rose';
        applyThemeToDOM(resolvedTheme);
        set({
          ...loaded,
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
        const loaded = await storageService.loadState(account);
        applyThemeToDOM(theme);
        set({
          ...loaded,
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

    addCollegeSubject: async (subjectData) => {
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
      set((state) => ({
        collegeSubjects: [...state.collegeSubjects, newSubject],
      }));
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
