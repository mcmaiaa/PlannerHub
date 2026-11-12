export type NavigationTab =
  | 'dashboard'
  | 'calendar'
  | 'college'
  | 'concurso'
  | 'vagas';

export type AppTheme =
  | 'rose'
  | 'emerald'
  | 'blue'
  | 'amber'
  | 'lavender'
  | 'coral';

export interface UserAccount {
  username: string;
  displayName: string;
  theme: AppTheme;
  isClaraSeed?: boolean;
  sessionToken?: string;
}

export type EventCategory =
  | 'rotina'       // Rosa Pastel (border-pink-400, bg-pink-500/15, text-pink-300)
  | 'entrevista'   // Vermelho Coral (border-rose-400, bg-rose-500/20, text-rose-300)
  | 'faculdade'    // Roxo Lavanda (border-purple-400, bg-purple-500/15, text-purple-300)
  | 'aniversario'  // Amarelo/Pessegueiro Pastel (border-amber-300, bg-amber-400/15, text-amber-200)
  | 'reuniao'      // Rosa Pastel (border-pink-400, bg-pink-500/15, text-pink-300)
  | 'concurso';    // Verde Menta (border-emerald-400, bg-emerald-500/15, text-emerald-300)

export type RecurrenceRule =
  | 'unico'
  | 'semanal'
  | 'quinzenal'
  | 'mensal'
  | 'anual';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD (Data base / início)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  category: EventCategory;
  recurrence: RecurrenceRule;
  isHighlight: boolean; // Destaque na contagem regressiva do Dashboard
  locationOrLink?: string;
  notes?: string;
}

export type DayOfWeek = 1 | 2 | 3 | 4 | 5; // 1 = Segunda ... 5 = Sexta

export interface FixedClassSlot {
  id: string;
  subjectId: string;
  subjectName: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  room: string;
  professor: string;
}

export interface TabletNoteAttachment {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  fileName: string;
  fileType: string; // application/pdf, image/png, image/jpeg
  fileSize: number;
  storageKey: string; // Chave no IndexedDB ou URL no Supabase Storage
  isDemoSample?: boolean;
}

export interface UnitAssessment {
  id: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  startTime?: string;
  type: 'prova' | 'trabalho';
  completed: boolean;
  grade?: string;
}

export interface SubjectUnit {
  id: string;
  unitNumber: 1 | 2 | 3;
  title: string; // "1ª Unidade", "2ª Unidade", "3ª Unidade"
  tabletNotes: TabletNoteAttachment[];
  assessments: UnitAssessment[];
}

export interface CollegeSubject {
  id: string;
  name: string;
  code: string;
  professor: string;
  room: string;
  colorAccent: 'lavender' | 'pink' | 'mint' | 'coral';
  units: SubjectUnit[];
}

export interface ExamTopic {
  id: string;
  title: string;
  teoria: boolean;
  resumo: boolean;
  questoes: boolean;
  revisao: boolean;
  tabletNote?: TabletNoteAttachment;
}

export interface ExamSubject {
  id: string;
  name: string;
  categoryTag: string;
  topics: ExamTopic[];
}

export interface ExamPlan {
  id: string;
  name: string;
  boardOrAgency: string; // Banca / Órgão (ex: FGV • TRE, Cesgranrio • BB)
  examDate?: string;     // YYYY-MM-DD opcional
  subjects: ExamSubject[];
}

export type JobWorkMode = 'remoto' | 'hibrido' | 'presencial';

export type JobOpportunityType =
  | 'estagio'
  | 'efetivo'
  | 'trainee'
  | 'freelance'
  | 'bolsa';

export type JobApplicationStatus =
  | 'interessado'
  | 'inscrito'
  | 'em_analise'
  | 'teste_tecnico'
  | 'entrevista'
  | 'aprovado'
  | 'reprovado'
  | 'desistencia';

export interface JobHistoryEntry {
  id: string;
  date: string; // ISO string ou YYYY-MM-DD HH:mm
  status: JobApplicationStatus;
  note: string;
}

export interface JobOpportunity {
  id: string;
  // Informações principais da oportunidade (podem ser compartilhadas)
  company: string;
  title: string;
  link?: string;
  description?: string;
  area?: string;
  workMode: JobWorkMode;
  location?: string;
  opportunityType: JobOpportunityType;

  // Acompanhamento privado da candidatura (NUNCA compartilhado)
  appliedDate?: string; // YYYY-MM-DD
  status: JobApplicationStatus;
  companyFeedback?: string;
  nextStep?: string;
  nextStepDate?: string; // YYYY-MM-DD
  personalNotes?: string;
  history: JobHistoryEntry[];

  // Metadados
  sharedBy?: {
    username: string;
    displayName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SharedJobPayload {
  company: string;
  title: string;
  link?: string;
  description?: string;
  area?: string;
  workMode: JobWorkMode;
  location?: string;
  opportunityType: JobOpportunityType;
}

export interface SharedJobItem {
  id: string;
  senderUsername: string;
  senderDisplayName: string;
  recipientUsername: string;
  recipientDisplayName?: string;
  jobPayload: SharedJobPayload;
  message?: string;
  status: 'pending' | 'accepted' | 'dismissed';
  createdAt: string;
}

export interface PublicUserSummary {
  username: string;
  displayName: string;
}

export interface PlannerDataState {
  events: CalendarEvent[];
  fixedClasses: FixedClassSlot[];
  collegeSubjects: CollegeSubject[];
  exams: ExamPlan[];
  jobs?: JobOpportunity[];
  theme?: AppTheme;
  // Campos legados mantidos para compatibilidade de migração automática
  examSubjects?: ExamSubject[];
  examTargetName?: string;
  quickNotes: string;
  quickNotesUpdatedAt: string;
  lastSyncedAt: string;
}

export interface HighlightCountdownItem {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  daysRemaining: number;
  badgeType: 'entrevista' | 'prova' | 'trabalho' | 'aniversario' | 'concurso' | 'urgente';
  subtitle: string;
  source: 'agenda' | 'faculdade' | 'vagas';
}
