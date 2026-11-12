import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  AppTheme,
  JobOpportunity,
  PlannerDataState,
  PublicUserSummary,
  SharedJobItem,
  SharedJobPayload,
  TabletNoteAttachment,
  UserAccount,
} from '../types';
import {
  getBlankPlannerData,
  getInitialPlannerData,
  normalizePlannerState,
} from '../utils/initialData';

const LOCAL_STORAGE_KEY = 'planner_study_hub_state_v1';
const ACTIVE_USER_KEY = 'planner_study_hub_active_user_v1';
const KNOWN_USERS_KEY = 'planner_study_hub_known_users_v1';
const LOCAL_PASSWORDS_KEY = 'planner_study_hub_local_pw_v1';
const LOCAL_SHARED_JOBS_KEY = 'planner_study_hub_shared_jobs_v1';
const IDB_NAME = 'PlannerStudyHubDB';
const IDB_VERSION = 1;
const IDB_STORE = 'tablet_files';

const DEFAULT_SUPABASE_URL = 'https://zwszskcjkcxjhsxbicww.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3c3pza2Nqa2N4amhzeGJpY3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2NTQ5NjYsImV4cCI6MjEwOTIzMDk2Nn0.Lpm20mMUuoR7yo4M0f-wlPnL74zDdsxsMvK0BHEbXGs';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || DEFAULT_SUPABASE_ANON_KEY;

export const isCloudConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let supabase: SupabaseClient | null = null;
if (isCloudConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.warn('Falha ao inicializar cliente Supabase, usando modo híbrido local:', err);
  }
}

/**
 * Abre conexão com IndexedDB para armazenar Blobs/Arquivos de notas do Tablet (.pdf, .png, .jpg)
 * sem estourar o limite de 5MB do localStorage.
 */
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, IDB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveBlobToIndexedDB(key: string, blob: Blob): Promise<void> {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    store.put(blob, key);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

async function getBlobFromIndexedDB(key: string): Promise<Blob | null> {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const store = tx.objectStore(IDB_STORE);
    const req = store.get(key);
    req.onsuccess = () => {
      db.close();
      resolve((req.result as Blob) || null);
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}

async function deleteBlobFromIndexedDB(key: string): Promise<void> {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    store.delete(key);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

/**
 * Gera uma visualização estilizada para os arquivos de demonstração pré-carregados do Tablet.
 */
function createDemoSampleSVGBlob(storageKey: string, title: string): Blob {
  const isLaw = storageKey.includes('direito');
  const isPort = storageKey.includes('portugues');
  const isArch = storageKey.includes('clean-arch');

  const accentColor = isLaw || isPort ? '#86EFAC' : isArch ? '#F9A8D4' : '#C4B5FD';
  const bullet1 = isLaw
    ? '• Princípios Expressos (Art. 37 CF): Legalidade, Impessoalidade, Moralidade, Publicidade, Eficiência'
    : isPort
    ? '• Conjunções Adversativas (FGV ama!): todavia, contudo, não obstante, entretanto'
    : isArch
    ? '• Regra de Dependência: Camadas internas não conhecem detalhes de banco ou UI externa'
    : '• 1. Visibilidade do status do sistema (Feedback imediato em até 5 segundos)';

  const bullet2 = isLaw
    ? '• Poder Discricionário: Margem de liberdade (conveniência e oportunidade - Mérito)'
    : isPort
    ? '• Crase Obrigatória: Locuções adverbiais femininas (às vezes, à noite, à medida que)'
    : isArch
    ? '• Camada storageService isolada: Alterna entre IndexedDB local e Supabase Cloud'
    : '• 2. Correspondência entre o sistema e o mundo real (Cards acolhedores e organizados)';

  const bullet3 = isLaw
    ? '• Atenção em Prova: Poder de Polícia é em regra discricionário, mas a licença é vinculada!'
    : isPort
    ? '• Paralelismo Sintático: Se usar preposição no 1º termo, manter nos demais!'
    : isArch
    ? '• Entidades -> Casos de Uso -> Adaptadores de Interface -> Frameworks & Drivers'
    : '• 3. Prevenção de erros e Reconhecimento em vez de memorização';

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1160" viewBox="0 0 900 1160">
    <rect width="900" height="1160" fill="#1B1624"/>
    <!-- Pontilhado estilo caderno digital GoodNotes / Samsung Notes -->
    <defs>
      <pattern id="dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
        <circle cx="4" cy="4" r="1.3" fill="#322B40" />
      </pattern>
    </defs>
    <rect width="900" height="1160" fill="url(#dots)"/>
    <rect x="45" y="45" width="810" height="1070" rx="22" fill="#211C2B" stroke="#322B40" stroke-width="2"/>
    <rect x="45" y="45" width="810" height="96" rx="22" fill="#292238"/>
    <text x="85" y="95" fill="${accentColor}" font-family="sans-serif" font-size="22" font-weight="bold">
      ✨ Caderno Digital do Tablet • Planner &amp; Study Hub
    </text>
    <text x="85" y="124" fill="#A89FBD" font-family="sans-serif" font-size="14">
      Anotação sincronizada • Exemplo interativo pronto para leitura
    </text>

    <text x="85" y="200" fill="#F5F2F8" font-family="sans-serif" font-size="24" font-weight="bold">
      ${title.replace(/&/g, '&amp;')}
    </text>
    <line x1="85" y1="222" x2="780" y2="222" stroke="${accentColor}" stroke-width="3" stroke-linecap="round"/>

    <rect x="85" y="260" width="730" height="190" rx="16" fill="#16131D" stroke="#322B40" stroke-width="1.5"/>
    <text x="115" y="305" fill="#F9A8D4" font-family="sans-serif" font-size="18" font-weight="bold">
      📌 Pontos-Chave Destacados à Mão (Caneta Stylus)
    </text>
    <text x="115" y="348" fill="#F5F2F8" font-family="sans-serif" font-size="16">${bullet1.replace(/&/g, '&amp;')}</text>
    <text x="115" y="385" fill="#F5F2F8" font-family="sans-serif" font-size="16">${bullet2.replace(/&/g, '&amp;')}</text>
    <text x="115" y="422" fill="#F5F2F8" font-family="sans-serif" font-size="16">${bullet3.replace(/&/g, '&amp;')}</text>

    <!-- Esquema Visual desenhado -->
    <rect x="85" y="490" width="345" height="230" rx="16" fill="#16131D" stroke="${accentColor}" stroke-width="1.5" stroke-dasharray="6 4"/>
    <text x="115" y="535" fill="${accentColor}" font-family="sans-serif" font-size="18" font-weight="bold">
      🧠 Resumo Esquemático
    </text>
    <text x="115" y="575" fill="#A89FBD" font-family="sans-serif" font-size="15">
      • Revisar grifos em rosa pastel
    </text>
    <text x="115" y="610" fill="#A89FBD" font-family="sans-serif" font-size="15">
      • Resolver bateria de 20 questões
    </text>
    <text x="115" y="645" fill="#A89FBD" font-family="sans-serif" font-size="15">
      • Atenção às pegadinhas da banca!
    </text>

    <rect x="465" y="490" width="350" height="230" rx="16" fill="#16131D" stroke="#F9A8D4" stroke-width="1.5"/>
    <text x="495" y="535" fill="#F9A8D4" font-family="sans-serif" font-size="18" font-weight="bold">
      🌸 Dica de Revisão Ativa
    </text>
    <text x="495" y="575" fill="#F5F2F8" font-family="sans-serif" font-size="15">
      Você pode anexar qualquer PDF ou
    </text>
    <text x="495" y="603" fill="#F5F2F8" font-family="sans-serif" font-size="15">
      print exportado do seu Tablet aqui!
    </text>
    <text x="495" y="645" fill="#86EFAC" font-family="sans-serif" font-size="14" font-weight="bold">
      ✓ Salvo no IndexedDB (Sem limite de 5MB)
    </text>
  </svg>`;

  return new Blob([svgContent], { type: 'image/svg+xml' });
}

function getLocalKeyForUser(user?: UserAccount | null): string {
  if (!user || user.username === 'clara') return LOCAL_STORAGE_KEY;
  return `${LOCAL_STORAGE_KEY}_${user.username}`;
}

export const storageService = {
  getSyncMode(): 'cloud' | 'local' {
    return supabase ? 'cloud' : 'local';
  },

  getActiveUser(): UserAccount | null {
    try {
      const raw = localStorage.getItem(ACTIVE_USER_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as UserAccount;
      // Garante que sessões antigas sem sessionToken exijam login seguro
      if (supabase && !parsed.sessionToken) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  },

  async loginUser(usernameInput: string, passwordInput?: string): Promise<UserAccount> {
    const username = usernameInput.trim().toLowerCase().replace(/\s+/g, '_');
    if (!username) {
      throw new Error('Informe seu nome de usuário.');
    }
    if (!passwordInput) {
      throw new Error('Informe sua senha.');
    }

    if (supabase) {
      const { data, error } = await supabase.rpc('planner_login_user', {
        p_username: username,
        p_password: passwordInput,
      });

      if (error) {
        throw new Error(error.message || 'Usuário ou senha incorretos.');
      }

      if (data) {
        const res = data as {
          username: string;
          displayName: string;
          theme: AppTheme;
          isClaraSeed: boolean;
          sessionToken: string;
        };
        const account: UserAccount = {
          username: res.username,
          displayName: res.displayName,
          theme: res.theme || 'rose',
          isClaraSeed: Boolean(res.isClaraSeed || res.username === 'clara'),
          sessionToken: res.sessionToken,
        };
        localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(account));
        return account;
      }
    }

    // Fallback apenas se offline sem Supabase
    const pwMap = JSON.parse(localStorage.getItem(LOCAL_PASSWORDS_KEY) || '{}');
    if (pwMap[username] && pwMap[username] === passwordInput) {
      const rawKnown = localStorage.getItem(KNOWN_USERS_KEY);
      const list: UserAccount[] = rawKnown ? JSON.parse(rawKnown) : [];
      const found = list.find((u) => u.username === username);
      if (found) {
        localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(found));
        return found;
      }
    }

    throw new Error('Usuário ou senha incorretos.');
  },

  async registerUser(
    displayName: string,
    usernameInput: string,
    passwordInput: string,
    theme: AppTheme = 'rose'
  ): Promise<UserAccount> {
    const username = usernameInput.trim().toLowerCase().replace(/\s+/g, '_');
    const cleanName = displayName.trim() || username;

    if (!username || username.length < 2) {
      throw new Error('O usuário deve ter pelo menos 2 caracteres.');
    }
    if (!passwordInput || passwordInput.length < 4) {
      throw new Error('A senha deve ter pelo menos 4 caracteres.');
    }

    if (supabase) {
      const { data, error } = await supabase.rpc('planner_register_user', {
        p_display_name: cleanName,
        p_username: username,
        p_password: passwordInput,
        p_theme: theme,
      });

      if (error) {
        throw new Error(error.message || 'Não foi possível criar a conta.');
      }

      const res = data as {
        username: string;
        displayName: string;
        theme: AppTheme;
        isClaraSeed: boolean;
        sessionToken: string;
      };

      const account: UserAccount = {
        username: res.username,
        displayName: res.displayName,
        theme: res.theme || theme,
        isClaraSeed: false,
        sessionToken: res.sessionToken,
      };

      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(account));

      const blankState: PlannerDataState = {
        ...getBlankPlannerData(),
        theme,
      };
      await this.saveState(blankState, account);
      return account;
    }

    const account: UserAccount = {
      username,
      displayName: cleanName,
      theme,
      isClaraSeed: false,
      sessionToken: `local_${Date.now()}`,
    };

    const pwMap = JSON.parse(localStorage.getItem(LOCAL_PASSWORDS_KEY) || '{}');
    if (pwMap[username]) {
      throw new Error('Este nome de usuário já está em uso.');
    }
    pwMap[username] = passwordInput;
    localStorage.setItem(LOCAL_PASSWORDS_KEY, JSON.stringify(pwMap));
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(account));

    const initialForUser: PlannerDataState = {
      ...getBlankPlannerData(),
      theme,
    };
    await this.saveState(initialForUser, account);
    return account;
  },

  logoutUser(): void {
    localStorage.removeItem(ACTIVE_USER_KEY);
  },

  async updateUserTheme(user: UserAccount, theme: AppTheme): Promise<UserAccount> {
    const updated: UserAccount = { ...user, theme };
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(updated));
    return updated;
  },

  /**
   * Carrega o estado completo do aplicativo exclusivamente para a conta autenticada.
   */
  async loadState(user?: UserAccount | null): Promise<PlannerDataState> {
    const activeUser = user ?? this.getActiveUser();
    if (!activeUser) {
      return getBlankPlannerData();
    }

    const localKey = getLocalKeyForUser(activeUser);
    const isClaraSeed = Boolean(
      activeUser.isClaraSeed || activeUser.username === 'clara'
    );

    if (supabase && activeUser.sessionToken) {
      try {
        const { data, error } = await supabase.rpc('planner_load_user_state', {
          p_username: activeUser.username,
          p_session_token: activeUser.sessionToken,
        });

        if (!error && data) {
          const normalizedCloud = normalizePlannerState(
            data as PlannerDataState,
            isClaraSeed
          );
          localStorage.setItem(localKey, JSON.stringify(normalizedCloud));
          await supabase.rpc('planner_save_user_state', {
            p_username: activeUser.username,
            p_session_token: activeUser.sessionToken,
            p_payload: normalizedCloud,
            p_theme: normalizedCloud.theme || activeUser.theme,
          });
          return normalizedCloud;
        }
      } catch (err) {
        console.warn('Erro ao buscar do Supabase, usando cache local:', err);
      }
    }

    let fallbackState: PlannerDataState | null = null;
    const raw = localStorage.getItem(localKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as PlannerDataState;
        fallbackState = normalizePlannerState(parsed, isClaraSeed);
      } catch (e) {
        console.error('Erro ao ler estado local:', e);
      }
    }

    const finalState =
      fallbackState ||
      (isClaraSeed ? getInitialPlannerData() : getBlankPlannerData());
    localStorage.setItem(localKey, JSON.stringify(finalState));

    if (supabase && activeUser.sessionToken) {
      try {
        await supabase.rpc('planner_save_user_state', {
          p_username: activeUser.username,
          p_session_token: activeUser.sessionToken,
          p_payload: finalState,
          p_theme: finalState.theme || activeUser.theme,
        });
      } catch (err) {
        console.warn('Falha ao popular estado inicial no Supabase:', err);
      }
    }

    return finalState;
  },

  /**
   * Salva o estado completo no LocalStorage e sincroniza com Supabase exclusivamente para a conta autenticada.
   */
  async saveState(
    state: PlannerDataState,
    user?: UserAccount | null
  ): Promise<void> {
    const activeUser = user ?? this.getActiveUser();
    if (!activeUser) return;

    const localKey = getLocalKeyForUser(activeUser);

    const updatedState: PlannerDataState = {
      ...state,
      lastSyncedAt: new Date().toISOString(),
    };
    localStorage.setItem(localKey, JSON.stringify(updatedState));

    if (supabase && activeUser.sessionToken) {
      try {
        await supabase.rpc('planner_save_user_state', {
          p_username: activeUser.username,
          p_session_token: activeUser.sessionToken,
          p_payload: updatedState,
          p_theme: updatedState.theme || activeUser.theme,
        });
      } catch (err) {
        console.warn('Falha ao sincronizar estado com Supabase:', err);
      }
    }
  },

  /**
   * Faz upload de um arquivo PDF/PNG/JPG do Tablet para o Supabase Storage (se ativo)
   * ou salva o Blob no IndexedDB local.
   */
  async uploadTabletFile(file: File, customTitle: string, dateIso: string): Promise<TabletNoteAttachment> {
    const id = `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const storageKey = `file_${id}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    if (supabase) {
      try {
        const { error } = await supabase.storage
          .from('tablet-notes')
          .upload(storageKey, file, { upsert: true, contentType: file.type });

        if (!error) {
          // Também guarda no IndexedDB para leitura instantânea offline
          await saveBlobToIndexedDB(storageKey, file);
          return {
            id,
            title: customTitle.trim() || file.name,
            date: dateIso,
            fileName: file.name,
            fileType: file.type || 'application/pdf',
            fileSize: file.size,
            storageKey,
          };
        }
      } catch (err) {
        console.warn('Fallback para IndexedDB local no upload do arquivo:', err);
      }
    }

    await saveBlobToIndexedDB(storageKey, file);
    return {
      id,
      title: customTitle.trim() || file.name,
      date: dateIso,
      fileName: file.name,
      fileType: file.type || 'application/pdf',
      fileSize: file.size,
      storageKey,
    };
  },

  /**
   * Obtém uma Object URL temporária para abrir/visualizar o PDF ou Imagem do Tablet.
   */
  async getFilePreviewUrl(attachment: TabletNoteAttachment): Promise<{ url: string; mimeType: string }> {
    if (attachment.isDemoSample || attachment.storageKey.startsWith('demo:')) {
      const demoBlob = createDemoSampleSVGBlob(attachment.storageKey, attachment.title);
      return {
        url: URL.createObjectURL(demoBlob),
        mimeType: 'image/svg+xml',
      };
    }

    const localBlob = await getBlobFromIndexedDB(attachment.storageKey);
    if (localBlob) {
      return {
        url: URL.createObjectURL(localBlob),
        mimeType: localBlob.type || attachment.fileType,
      };
    }

    if (supabase) {
      const { data } = supabase.storage.from('tablet-notes').getPublicUrl(attachment.storageKey);
      if (data?.publicUrl) {
        return {
          url: data.publicUrl,
          mimeType: attachment.fileType,
        };
      }
    }

    throw new Error('Arquivo não encontrado no armazenamento local deste dispositivo.');
  },

  /**
   * Remove o arquivo do IndexedDB / Supabase Storage.
   */
  async deleteTabletFile(storageKey: string): Promise<void> {
    if (storageKey.startsWith('demo:')) return;
    try {
      await deleteBlobFromIndexedDB(storageKey);
      if (supabase) {
        await supabase.storage.from('tablet-notes').remove([storageKey]);
      }
    } catch (err) {
      console.warn('Erro ao remover arquivo:', err);
    }
  },

  /**
   * Exporta um arquivo JSON completo com todos os dados para Backup / Sincronização PC <-> Tablet.
   */
  async exportBackupJson(state: PlannerDataState): Promise<void> {
    const backupPayload = {
      app: 'Planner & Study Hub',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      state,
    };

    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `planner-study-hub-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Importa um arquivo JSON de backup e restaura o estado.
   */
  async importBackupJson(file: File): Promise<PlannerDataState> {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const stateToRestore: PlannerDataState = parsed.state ? parsed.state : parsed;

    if (!stateToRestore || !Array.isArray(stateToRestore.events) || !Array.isArray(stateToRestore.collegeSubjects)) {
      throw new Error('Formato de arquivo de backup inválido.');
    }

    const normalized = normalizePlannerState(stateToRestore);
    await this.saveState(normalized);
    return normalized;
  },

  /**
   * Pesquisa usuários cadastrados no Planner Hub pelo username ou nome de exibição.
   */
  async searchUsers(
    query = '',
    user?: UserAccount | null
  ): Promise<PublicUserSummary[]> {
    const activeUser = user ?? this.getActiveUser();
    if (!activeUser) return [];

    if (supabase && activeUser.sessionToken) {
      const { data, error } = await supabase.rpc('planner_search_users', {
        p_username: activeUser.username,
        p_session_token: activeUser.sessionToken,
        p_query: query,
      });

      if (error) {
        throw new Error(error.message || 'Erro ao buscar usuários.');
      }

      return Array.isArray(data) ? (data as PublicUserSummary[]) : [];
    }

    const rawKnown = localStorage.getItem(KNOWN_USERS_KEY);
    const list: UserAccount[] = rawKnown ? JSON.parse(rawKnown) : [];
    const q = query.trim().toLowerCase();
    return list
      .filter(
        (u) =>
          u.username !== activeUser.username &&
          (!q ||
            u.username.toLowerCase().includes(q) ||
            u.displayName.toLowerCase().includes(q))
      )
      .map((u) => ({ username: u.username, displayName: u.displayName }));
  },

  /**
   * Compartilha uma vaga com outro usuário enviando EXCLUSIVAMENTE os campos públicos da oportunidade.
   * Nenhum dado privado (status, notas pessoais, devolutivas, histórico ou data de inscrição) é enviado.
   */
  async shareJobWithUser(
    recipientUsername: string,
    job: JobOpportunity | SharedJobPayload,
    message?: string,
    user?: UserAccount | null
  ): Promise<SharedJobItem> {
    const activeUser = user ?? this.getActiveUser();
    if (!activeUser) {
      throw new Error('Faça login para compartilhar vagas.');
    }

    const cleanRecipient = recipientUsername.trim().toLowerCase();
    if (!cleanRecipient) {
      throw new Error('Selecione um usuário destinatário.');
    }
    if (cleanRecipient === activeUser.username) {
      throw new Error('Você não pode compartilhar uma vaga consigo mesmo.');
    }

    const sanitizedPayload: SharedJobPayload = {
      company: job.company.trim(),
      title: job.title.trim(),
      link: job.link?.trim() || undefined,
      description: job.description?.trim() || undefined,
      area: job.area?.trim() || undefined,
      workMode: job.workMode || 'remoto',
      location: job.location?.trim() || undefined,
      opportunityType: job.opportunityType || 'estagio',
    };

    if (supabase && activeUser.sessionToken) {
      const { data, error } = await supabase.rpc('planner_share_job', {
        p_username: activeUser.username,
        p_session_token: activeUser.sessionToken,
        p_recipient_username: cleanRecipient,
        p_job_payload: sanitizedPayload,
        p_message: message?.trim() || null,
      });

      if (error) {
        throw new Error(error.message || 'Não foi possível compartilhar a vaga.');
      }

      return data as SharedJobItem;
    }

    const localShares: SharedJobItem[] = JSON.parse(
      localStorage.getItem(LOCAL_SHARED_JOBS_KEY) || '[]'
    );
    const newItem: SharedJobItem = {
      id: `share-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      senderUsername: activeUser.username,
      senderDisplayName: activeUser.displayName,
      recipientUsername: cleanRecipient,
      jobPayload: sanitizedPayload,
      message: message?.trim() || undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(
      LOCAL_SHARED_JOBS_KEY,
      JSON.stringify([newItem, ...localShares])
    );
    return newItem;
  },

  /**
   * Lista todas as vagas compartilhadas recebidas e enviadas pelo usuário autenticado.
   */
  async listSharedJobs(user?: UserAccount | null): Promise<{
    received: SharedJobItem[];
    sent: SharedJobItem[];
  }> {
    const activeUser = user ?? this.getActiveUser();
    if (!activeUser) {
      return { received: [], sent: [] };
    }

    if (supabase && activeUser.sessionToken) {
      try {
        const { data, error } = await supabase.rpc('planner_list_shared_jobs', {
          p_username: activeUser.username,
          p_session_token: activeUser.sessionToken,
        });

        if (!error && data) {
          const parsed = data as {
            received?: SharedJobItem[];
            sent?: SharedJobItem[];
          };
          return {
            received: Array.isArray(parsed.received) ? parsed.received : [],
            sent: Array.isArray(parsed.sent) ? parsed.sent : [],
          };
        }
      } catch (err) {
        console.warn('Falha ao buscar vagas compartilhadas no Supabase:', err);
      }
    }

    const localShares: SharedJobItem[] = JSON.parse(
      localStorage.getItem(LOCAL_SHARED_JOBS_KEY) || '[]'
    );
    return {
      received: localShares.filter(
        (s) =>
          s.recipientUsername === activeUser.username &&
          s.status !== 'dismissed'
      ),
      sent: localShares.filter((s) => s.senderUsername === activeUser.username),
    };
  },

  /**
   * Atualiza o status de uma vaga compartilhada ('accepted' ou 'dismissed').
   */
  async respondToSharedJob(
    shareId: string,
    action: 'accepted' | 'dismissed',
    user?: UserAccount | null
  ): Promise<void> {
    const activeUser = user ?? this.getActiveUser();
    if (!activeUser) return;

    if (supabase && activeUser.sessionToken) {
      const { error } = await supabase.rpc('planner_respond_shared_job', {
        p_username: activeUser.username,
        p_session_token: activeUser.sessionToken,
        p_share_id: shareId,
        p_action: action,
      });

      if (error) {
        throw new Error(error.message || 'Erro ao atualizar vaga compartilhada.');
      }
      return;
    }

    const localShares: SharedJobItem[] = JSON.parse(
      localStorage.getItem(LOCAL_SHARED_JOBS_KEY) || '[]'
    );
    const updated = localShares.map((s) =>
      s.id === shareId ? { ...s, status: action } : s
    );
    localStorage.setItem(LOCAL_SHARED_JOBS_KEY, JSON.stringify(updated));
  },
};
