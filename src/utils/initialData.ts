import {
  PlannerDataState,
  ExamPlan,
  CollegeSubject,
  FixedClassSlot,
  CalendarEvent,
} from '../types';
import { toISODateString } from './dateUtils';

export function getIhcUnits20262() {
  return [
    {
      id: 'u1-ufcg-ihc',
      unitNumber: 1 as const,
      title: '1ª Unidade',
      tabletNotes: [],
      assessments: [],
    },
    {
      id: 'u2-ufcg-ihc',
      unitNumber: 2 as const,
      title: '2ª Unidade',
      tabletNotes: [],
      assessments: [
        {
          id: 'ihc-2026-figma-wireframes',
          title: 'IHC: Protótipos + Tutorial Figma (Wireframes) — Sala LCC1',
          type: 'trabalho' as const,
          dueDate: '2026-11-09',
          startTime: '16:00',
          completed: false,
        },
        {
          id: 'ihc-2026-ap-parcial-1',
          title: 'IHC: Apresentação Parcial (1º Dia — CP01)',
          type: 'trabalho' as const,
          dueDate: '2026-11-19',
          startTime: '14:00',
          completed: false,
        },
        {
          id: 'ihc-2026-ap-parcial-2',
          title: 'IHC: Apresentação Parcial (2º Dia — CP01)',
          type: 'trabalho' as const,
          dueDate: '2026-11-23',
          startTime: '16:00',
          completed: false,
        },
        {
          id: 'ihc-2026-dinamica-3',
          title: 'IHC: Dinâmica 3 — Dark Patterns e Ética no Design (Sala LCC1)',
          type: 'trabalho' as const,
          dueDate: '2026-12-03',
          startTime: '14:00',
          completed: false,
        },
        {
          id: 'ihc-2026-figma-design',
          title: 'IHC: Tutorial Figma (Design UI)',
          type: 'trabalho' as const,
          dueDate: '2026-12-10',
          startTime: '14:00',
          completed: false,
        },
      ],
    },
    {
      id: 'u3-ufcg-ihc',
      unitNumber: 3 as const,
      title: '3ª Unidade',
      tabletNotes: [],
      assessments: [
        {
          id: 'ihc-2027-dinamica-5',
          title: 'IHC: Dinâmica 5 — Testes de Usabilidade & IA Avaliadora',
          type: 'trabalho' as const,
          dueDate: '2027-02-04',
          startTime: '14:00',
          completed: false,
        },
        {
          id: 'ihc-2027-oficina-usabilidade',
          title: 'IHC: Oficina — Jornada Ideal e Teste de Usabilidade',
          type: 'trabalho' as const,
          dueDate: '2027-02-08',
          startTime: '16:00',
          completed: false,
        },
        {
          id: 'ihc-2027-ap-final-1',
          title: 'IHC: Apresentação Final (1º Dia — CP01)',
          type: 'trabalho' as const,
          dueDate: '2027-02-15',
          startTime: '16:00',
          completed: false,
        },
        {
          id: 'ihc-2027-ap-final-2',
          title: 'IHC: Apresentação Final (2º Dia — CP01)',
          type: 'trabalho' as const,
          dueDate: '2027-02-18',
          startTime: '14:00',
          completed: false,
        },
        {
          id: 'ihc-2027-exame-final',
          title: 'IHC: Exame Final',
          type: 'prova' as const,
          dueDate: '2027-02-22',
          startTime: '16:00',
          completed: false,
        },
      ],
    },
  ];
}

export function getEconomiaTiUnits20262() {
  return [
    {
      id: 'u1-ufcg-economia-ti',
      unitNumber: 1 as const,
      title: '1ª Unidade',
      tabletNotes: [],
      assessments: [],
    },
    {
      id: 'u2-ufcg-economia-ti',
      unitNumber: 2 as const,
      title: '2ª Unidade',
      tabletNotes: [],
      assessments: [
        {
          id: 'ecoti-2026-ficha-equipe-risco',
          title: 'Economia de TI: Ficha da Equipe — A Linha de Risco do Projeto',
          type: 'trabalho' as const,
          dueDate: '2026-11-03',
          startTime: '23:59',
          completed: false,
        },
      ],
    },
    {
      id: 'u3-ufcg-economia-ti',
      unitNumber: 3 as const,
      title: '3ª Unidade',
      tabletNotes: [],
      assessments: [],
    },
  ];
}

export function getVvsUnits20262() {
  return [
    {
      id: 'u1-ufcg-vvs',
      unitNumber: 1 as const,
      title: '1ª Unidade',
      tabletNotes: [],
      assessments: [],
    },
    {
      id: 'u2-ufcg-vvs',
      unitNumber: 2 as const,
      title: '2ª Unidade',
      tabletNotes: [],
      assessments: [
        {
          id: 'vvs-2026-quiz-classroom-hoje',
          title: 'VeV: Quiz no Google Classroom',
          type: 'trabalho' as const,
          dueDate: '2026-11-02',
          startTime: '23:59',
          completed: false,
        },
      ],
    },
    {
      id: 'u3-ufcg-vvs',
      unitNumber: 3 as const,
      title: '3ª Unidade',
      tabletNotes: [],
      assessments: [],
    },
  ];
}

export function getProjeto2Units20262() {
  return [
    {
      id: 'u1-ufcg-projeto-2',
      unitNumber: 1 as const,
      title: '1ª Unidade',
      tabletNotes: [],
      assessments: [],
    },
    {
      id: 'u2-ufcg-projeto-2',
      unitNumber: 2 as const,
      title: '2ª Unidade',
      tabletNotes: [],
      assessments: [
        {
          id: 'proj2-2026-pn-partes-1-2',
          title: 'Projeto II (Orgami): Entrega do Plano de Negócio — Partes I e II',
          type: 'trabalho' as const,
          dueDate: '2026-11-04',
          startTime: '08:00',
          completed: false,
        },
        {
          id: 'proj2-2026-feedback-partes-1-2',
          title: 'Projeto II (Orgami): Feedback Presencial — Partes I e II (CD 107)',
          type: 'trabalho' as const,
          dueDate: '2026-11-06',
          startTime: '10:00',
          completed: false,
        },
        {
          id: 'proj2-2026-pn-parte-3',
          title: 'Projeto II (Orgami): Entrega do Plano de Negócio — Parte III (O Mercado)',
          type: 'trabalho' as const,
          dueDate: '2026-11-13',
          startTime: '10:00',
          completed: false,
        },
        {
          id: 'proj2-2026-feedback-parte-3',
          title: 'Projeto II (Orgami): Feedback — Parte III',
          type: 'trabalho' as const,
          dueDate: '2026-11-18',
          startTime: '08:00',
          completed: false,
        },
        {
          id: 'proj2-2026-pn-parte-4',
          title: 'Projeto II (Orgami): Entrega do Plano de Negócio — Parte IV (Estratégias de Marketing)',
          type: 'trabalho' as const,
          dueDate: '2026-11-27',
          startTime: '10:00',
          completed: false,
        },
        {
          id: 'proj2-2026-feedback-parte-4',
          title: 'Projeto II (Orgami): Feedback — Parte IV',
          type: 'trabalho' as const,
          dueDate: '2026-12-02',
          startTime: '08:00',
          completed: false,
        },
      ],
    },
    {
      id: 'u3-ufcg-projeto-2',
      unitNumber: 3 as const,
      title: '3ª Unidade',
      tabletNotes: [],
      assessments: [
        {
          id: 'proj2-2026-pn-partes-5-6',
          title: 'Projeto II (Orgami): Entrega do Plano de Negócio — Partes V e VI (Orçamento e Viabilidade)',
          type: 'trabalho' as const,
          dueDate: '2026-12-11',
          startTime: '10:00',
          completed: false,
        },
        {
          id: 'proj2-2026-feedback-partes-5-6',
          title: 'Projeto II (Orgami): Feedback — Partes V e VI',
          type: 'trabalho' as const,
          dueDate: '2026-12-16',
          startTime: '08:00',
          completed: false,
        },
        {
          id: 'proj2-2026-ajustes-pn',
          title: 'Projeto II (Orgami): Ajustes Finais no Plano de Negócio',
          type: 'trabalho' as const,
          dueDate: '2026-12-18',
          startTime: '10:00',
          completed: false,
        },
        {
          id: 'proj2-2027-ap-final-pn',
          title: 'Projeto II (Orgami): Apresentação Final do Plano de Negócio',
          type: 'trabalho' as const,
          dueDate: '2027-02-03',
          startTime: '08:00',
          completed: false,
        },
      ],
    },
  ];
}

export function getUfcg20262Subjects(): CollegeSubject[] {
  const createUnits = (subjId: string) => [
    {
      id: `u1-${subjId}`,
      unitNumber: 1 as const,
      title: '1ª Unidade',
      tabletNotes: [],
      assessments: [],
    },
    {
      id: `u2-${subjId}`,
      unitNumber: 2 as const,
      title: '2ª Unidade',
      tabletNotes: [],
      assessments: [],
    },
    {
      id: `u3-${subjId}`,
      unitNumber: 3 as const,
      title: '3ª Unidade',
      tabletNotes: [],
      assessments: [],
    },
  ];

  return [
    {
      id: 'ufcg-economia-ti',
      name: 'Economia de Tecnologia da Informação',
      code: '',
      professor: 'Profa. Francilene Procópio',
      room: 'CAA 303',
      colorAccent: 'lavender',
      units: getEconomiaTiUnits20262(),
    },
    {
      id: 'ufcg-ihc',
      name: 'Interface Humano-Computador',
      code: '',
      professor: 'Prof. Thiago Massoni',
      room: 'CP 001',
      colorAccent: 'lavender',
      units: getIhcUnits20262(),
    },
    {
      id: 'ufcg-percepcao',
      name: 'Percepção Computacional',
      code: '',
      professor: 'Prof. Herman Martins',
      room: 'CP 001',
      colorAccent: 'lavender',
      units: createUnits('ufcg-percepcao'),
    },
    {
      id: 'ufcg-projeto-2',
      name: 'Projeto em Computação II',
      code: '',
      professor: 'Prof. Carlos Eduardo',
      room: 'CD 107',
      colorAccent: 'lavender',
      units: getProjeto2Units20262(),
    },
    {
      id: 'ufcg-vvs',
      name: 'Verificação e Validação de Software',
      code: '',
      professor: 'Prof. Everton Leandro',
      room: 'CAA 304',
      colorAccent: 'lavender',
      units: getVvsUnits20262(),
    },
  ];
}

export function getUfcg20262FixedClasses(): FixedClassSlot[] {
  return [
    // SEGUNDA-FEIRA -> dayOfWeek: 1
    {
      id: 'ufcg-cls-seg-1',
      subjectId: 'ufcg-economia-ti',
      subjectName: 'Economia de Tecnologia da Informação',
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '10:00',
      room: 'CAA 303',
      professor: 'Profa. Francilene Procópio',
    },
    {
      id: 'ufcg-cls-seg-2',
      subjectId: 'ufcg-ihc',
      subjectName: 'Interface Humano-Computador',
      dayOfWeek: 1,
      startTime: '16:00',
      endTime: '18:00',
      room: 'CP 001',
      professor: 'Prof. Thiago Massoni',
    },

    // TERÇA-FEIRA -> dayOfWeek: 2
    {
      id: 'ufcg-cls-ter-1',
      subjectId: 'ufcg-vvs',
      subjectName: 'Verificação e Validação de Software',
      dayOfWeek: 2,
      startTime: '08:00',
      endTime: '10:00',
      room: 'CAA 304',
      professor: 'Prof. Everton Leandro',
    },
    {
      id: 'ufcg-cls-ter-2',
      subjectId: 'ufcg-percepcao',
      subjectName: 'Percepção Computacional',
      dayOfWeek: 2,
      startTime: '16:00',
      endTime: '18:00',
      room: 'CP 001',
      professor: 'Prof. Herman Martins',
    },

    // QUARTA-FEIRA -> dayOfWeek: 3
    {
      id: 'ufcg-cls-qua-1',
      subjectId: 'ufcg-projeto-2',
      subjectName: 'Projeto em Computação II',
      dayOfWeek: 3,
      startTime: '08:00',
      endTime: '10:00',
      room: 'CD 107',
      professor: 'Prof. Carlos Eduardo',
    },
    {
      id: 'ufcg-cls-qua-2',
      subjectId: 'ufcg-economia-ti',
      subjectName: 'Economia de Tecnologia da Informação',
      dayOfWeek: 3,
      startTime: '10:00',
      endTime: '12:00',
      room: 'CAA 303',
      professor: 'Profa. Francilene Procópio',
    },

    // QUINTA-FEIRA -> dayOfWeek: 4
    {
      id: 'ufcg-cls-qui-1',
      subjectId: 'ufcg-vvs',
      subjectName: 'Verificação e Validação de Software',
      dayOfWeek: 4,
      startTime: '10:00',
      endTime: '12:00',
      room: 'CAA 304',
      professor: 'Prof. Everton Leandro',
    },
    {
      id: 'ufcg-cls-qui-2',
      subjectId: 'ufcg-ihc',
      subjectName: 'Interface Humano-Computador',
      dayOfWeek: 4,
      startTime: '14:00',
      endTime: '16:00',
      room: 'CP 001',
      professor: 'Prof. Thiago Massoni',
    },

    // SEXTA-FEIRA -> dayOfWeek: 5
    {
      id: 'ufcg-cls-sex-1',
      subjectId: 'ufcg-projeto-2',
      subjectName: 'Projeto em Computação II',
      dayOfWeek: 5,
      startTime: '10:00',
      endTime: '12:00',
      room: 'CD 107',
      professor: 'Prof. Carlos Eduardo',
    },
    {
      id: 'ufcg-cls-sex-2',
      subjectId: 'ufcg-percepcao',
      subjectName: 'Percepção Computacional',
      dayOfWeek: 5,
      startTime: '14:00',
      endTime: '16:00',
      room: 'CP 001',
      professor: 'Prof. Herman Martins',
    },
  ];
}

function makeTopic(id: string, title: string) {
  return {
    id,
    title,
    teoria: false,
    resumo: false,
    questoes: false,
    revisao: false,
  };
}

export function getRealConcursosParaiba(): ExamPlan[] {
  return [
    // =========================================================================
    // CONCURSO 1: TJPB — CARGO 4: INTELIGÊNCIA ARTIFICIAL (FGV)
    // Prova: 24/01/2027 (Tarde: 13h às 18h)
    // =========================================================================
    {
      id: 'concurso-tjpb-ia-2026',
      name: 'TJPB • Analista Judiciário — Inteligência Artificial (Cargo 4)',
      boardOrAgency: 'FGV • Tribunal de Justiça da Paraíba (60 questões + Discursiva)',
      examDate: '2027-01-24',
      subjects: [
        {
          id: 'tjpb-pt',
          name: 'Língua Portuguesa (FGV)',
          categoryTag: 'Conhecimentos Gerais • 10 questões',
          topics: [
            makeTopic('tjpb-pt-1', '1. Compreensão e interpretação de textos de gêneros variados; tipos e gêneros textuais'),
            makeTopic('tjpb-pt-2', '2. Ortografia oficial e mecanismos de coesão textual (referenciação, substituição, repetição e conectores)'),
            makeTopic('tjpb-pt-3', '3. Emprego de tempos e modos verbais; classes de palavras'),
            makeTopic('tjpb-pt-4', '4. Estrutura morfossintática do período: coordenação e subordinação'),
            makeTopic('tjpb-pt-5', '5. Sinais de pontuação, concordância verbal e nominal, regência verbal e nominal e crase'),
            makeTopic('tjpb-pt-6', '6. Colocação dos pronomes átonos; significação e substituição de palavras'),
            makeTopic('tjpb-pt-7', '7. Reescrita de frases e parágrafos, reorganização de períodos e Redação Oficial'),
          ],
        },
        {
          id: 'tjpb-rlm',
          name: 'Raciocínio Lógico e Matemático (FGV)',
          categoryTag: 'Conhecimentos Gerais • 10 questões',
          topics: [
            makeTopic('tjpb-rlm-1', '1. Conjuntos numéricos, razões e proporções, regra de três simples e composta'),
            makeTopic('tjpb-rlm-2', '2. Porcentagem e juros simples e compostos'),
            makeTopic('tjpb-rlm-3', '3. Equações, inequações, sistemas de equações, funções e sequências'),
            makeTopic('tjpb-rlm-4', '4. Matrizes, determinantes, análise combinatória, probabilidade e estatística descritiva'),
            makeTopic('tjpb-rlm-5', '5. Proposições lógicas, conectivos, tabelas-verdade, equivalências e negações'),
            makeTopic('tjpb-rlm-6', '6. Argumentação lógica, diagramas lógicos e resolução de problemas lógico-matemáticos'),
          ],
        },
        {
          id: 'tjpb-fund-ti',
          name: 'Fundamentos de TI & Transformação Digital no Judiciário',
          categoryTag: 'Comum TI • Específicas',
          topics: [
            makeTopic('tjpb-fti-1', '1. Arquitetura de computadores, Sistemas Operacionais, Redes TCP/IP, Bancos de Dados e Nuvem'),
            makeTopic('tjpb-fti-2', '2. Engenharia de Software: ciclo de vida, requisitos, arquitetura/integração, Scrum, Kanban e testes'),
            makeTopic('tjpb-fti-3', '3. Segurança da Informação: CID, controle de acesso, riscos/incidentes, continuidade, LGPD e ISO 27001/27002/27005'),
            makeTopic('tjpb-fti-4', '4. Governança e Gestão de TI: COBIT 2019, ITIL 4, planejamento estratégico, projetos/serviços e contratações de TIC'),
            makeTopic('tjpb-fti-5', '5. Transformação Digital no Judiciário: Governo Digital, PJe, PDPJ-Br e acessibilidade digital'),
            makeTopic('tjpb-fti-6', '6. Normas CNJ (Res. 370/2021, 396/2021, 468/2022, 615/2025, 522/2023 MoReq-Jus/RDC-Arq) e PDTI TJPB 2024–2026'),
          ],
        },
        {
          id: 'tjpb-eng-dados',
          name: 'Engenharia de Dados & Linguagens de Consulta (SQL, Python, NoSQL)',
          categoryTag: 'Cargo 4: IA • Específicas',
          topics: [
            makeTopic('tjpb-ed-1', '1. Data Warehouse, Data Lake e Data Lakehouse: conceitos, diferenças e arquitetura para grandes volumes'),
            makeTopic('tjpb-ed-2', '2. Pipelines ETL e ELT, orquestração de pipelines, integração de repositórios e Feature Engineering'),
            makeTopic('tjpb-ed-3', '3. SGBDs relacionais: PostgreSQL, Oracle, MySQL/MariaDB e Microsoft SQL Server'),
            makeTopic('tjpb-ed-4', '4. SQL Avançado: subconsultas, GROUP BY/HAVING e Window Functions (ROW_NUMBER, RANK, LAG/LEAD, OVER, PARTITION BY)'),
            makeTopic('tjpb-ed-5', '5. Otimização de consultas (Query Tuning): planos de execução, indexação, estatísticas e particionamento'),
            makeTopic('tjpb-ed-6', '6. Manipulação e análise de dados com Python (Pandas e NumPy) e noções de linguagem R'),
            makeTopic('tjpb-ed-7', '7. Bancos de dados NoSQL: chave-valor, documentos (MongoDB), colunares e grafos'),
          ],
        },
        {
          id: 'tjpb-alg-prog',
          name: 'Algoritmos, Estruturas de Dados & Programação (Java, JS/TS, React)',
          categoryTag: 'Cargo 4: IA • Específicas',
          topics: [
            makeTopic('tjpb-ap-1', '1. Complexidade de algoritmos (Big-O), algoritmos de busca e ordenação'),
            makeTopic('tjpb-ap-2', '2. Estruturas de dados: listas, pilhas, filas, árvores e tabelas hash'),
            makeTopic('tjpb-ap-3', '3. POO (classes, objetos, herança, polimorfismo, encapsulamento, abstração) e Princípios SOLID'),
            makeTopic('tjpb-ap-4', '4. Java moderno: Collections, Streams, lambdas, records, sealed classes, pattern matching, switch expressions e virtual threads'),
            makeTopic('tjpb-ap-5', '5. Frameworks Java: Java EE/Jakarta EE, Spring Framework, Spring Boot e Hibernate/JPA'),
            makeTopic('tjpb-ap-6', '6. JavaScript/TypeScript, Node.js e Frameworks Frontend (React e Angular)'),
          ],
        },
        {
          id: 'tjpb-estat-bi',
          name: 'Estatística, Modelos Analíticos, BI, Jurimetria & Governança de Dados',
          categoryTag: 'Cargo 4: IA • Específicas',
          topics: [
            makeTopic('tjpb-eb-1', '1. Estatística Descritiva: média, mediana, moda, amplitude, variância, desvio padrão e coeficiente de variação'),
            makeTopic('tjpb-eb-2', '2. Probabilidade e distribuições (Binomial, Poisson e Normal); Correlação'),
            makeTopic('tjpb-eb-3', '3. Estatística Inferencial: intervalos de confiança, testes de hipóteses, valor-p e erros tipos I e II'),
            makeTopic('tjpb-eb-4', '4. Aprendizado Supervisionado: regressão, árvores de decisão, SVM e Random Forest; modelos preditivos no Judiciário'),
            makeTopic('tjpb-eb-5', '5. Business Intelligence e Jurimetria: Storytelling com dados, Taxa de Congestionamento, IPC-Jus e Metas Estratégicas'),
            makeTopic('tjpb-eb-6', '6. Qualidade e Governança de Dados: saneamento, DAMA-DMBOK, metadados e DataJud (Resolução CNJ nº 331/2020)'),
          ],
        },
        {
          id: 'tjpb-ia-avancada',
          name: 'Inteligência Artificial, PLN, LLMs, RAG, Deep Learning & MLOps',
          categoryTag: 'Cargo 4: IA • Específicas',
          topics: [
            makeTopic('tjpb-ia-1', '1. Aprendizado Não Supervisionado: K-Means e agrupamento hierárquico'),
            makeTopic('tjpb-ia-2', '2. PLN: pré-processamento (tokenização, stemming, lematização, stop words), TF-IDF e Word Embeddings'),
            makeTopic('tjpb-ia-3', '3. Arquitetura Transformer, Modelos de Linguagem Grandes (LLMs) e Engenharia de Prompt'),
            makeTopic('tjpb-ia-4', '4. Integração com APIs (OpenAI, Hugging Face), LangChain, RAG e Busca Vetorial (embeddings, similaridade e índices)'),
            makeTopic('tjpb-ia-5', '5. Ciclo de modelos ML: treino/validação/teste, validação cruzada, overfitting/underfitting, regularização e hiperparâmetros'),
            makeTopic('tjpb-ia-6', '6. Avaliação de modelos: matriz de confusão, acurácia, precisão, recall, F1-score, ROC/AUC, MAE, RMSE e R²'),
            makeTopic('tjpb-ia-7', '7. Redes Neurais e Deep Learning: MLP, funções de ativação, backpropagation, CNN e RNN/LSTM'),
            makeTopic('tjpb-ia-8', '8. MLOps: versionamento de dados/modelos, deploy, monitoramento em produção, data drift e concept drift'),
            makeTopic('tjpb-ia-9', '9. Governança Algorítmica, Ética e Explicabilidade: normas CNJ sobre IA, vieses/fairness, SHAP e LIME'),
            makeTopic('tjpb-ia-10', '10. Segurança em IA: prompt injection, jailbreak, ataques adversariais, sanitização de saída de LLMs e retenção zero'),
          ],
        },
      ],
    },

    // =========================================================================
    // CONCURSO 2: DPE-PB — D04 ANALISTA DA DEFENSORIA: DESENVOLVIMENTO DE SISTEMAS (FCC)
    // Prova: 28/02/2027 (Tarde)
    // =========================================================================
    {
      id: 'concurso-dpepb-d04-2026',
      name: 'DPE-PB • D04 Analista — Desenvolvimento de Sistemas',
      boardOrAgency: 'FCC • Defensoria Pública da Paraíba (Peso 1 Gerais / Peso 2 Específicas + Redação)',
      examDate: '2027-02-28',
      subjects: [
        {
          id: 'dpe-pt',
          name: 'Língua Portuguesa & Redação Discursiva (FCC)',
          categoryTag: 'Conhecimentos Gerais • Peso 1',
          topics: [
            makeTopic('dpe-pt-1', '1. Ortografia, acentuação gráfica e emprego do sinal indicativo de crase'),
            makeTopic('dpe-pt-2', '2. Compreensão e interpretação de textos, contexto histórico, denotação/conotação, intertextualidade e figuras de linguagem'),
            makeTopic('dpe-pt-3', '3. Discurso direto, discurso indireto e discurso indireto livre'),
            makeTopic('dpe-pt-4', '4. Morfossintaxe, formação de palavras, sinonímia/antonímia, pronomes e flexão nominal/verbal'),
            makeTopic('dpe-pt-5', '5. Vozes do verbo e correlação de tempos e modos verbais'),
            makeTopic('dpe-pt-6', '6. Concordância nominal e verbal; Regência nominal e verbal; Pontuação'),
            makeTopic('dpe-pt-7', '7. Coordenação e subordinação, conectivos, confronto de frases corretas/incorretas e equivalência de estruturas'),
          ],
        },
        {
          id: 'dpe-leg',
          name: 'Legislação da Defensoria & Conhecimentos Jurídicos/Institucionais',
          categoryTag: 'Conhecimentos Gerais • Peso 1',
          topics: [
            makeTopic('dpe-leg-1', '1. Constituição Federal (arts. 5º, 37 e 134) e Emendas Constitucionais nº 45/2004 e nº 80/2014'),
            makeTopic('dpe-leg-2', '2. Lei Complementar Federal nº 80/1994 (Organização da Defensoria Pública)'),
            makeTopic('dpe-leg-3', '3. Constituição do Estado da Paraíba (dispositivos relativos à Defensoria Pública)'),
            makeTopic('dpe-leg-4', '4. Lei Complementar Estadual nº 205/2024 e Lei Complementar Estadual nº 58/2003'),
            makeTopic('dpe-leg-5', '5. Organização da DPE-PB, Princípios Institucionais, Atuação Extrajudicial e Ética Institucional'),
          ],
        },
        {
          id: 'dpe-eng-soft',
          name: 'Processo de Desenvolvimento & Engenharia de Software',
          categoryTag: 'Específicas D04 • Peso 2',
          topics: [
            makeTopic('dpe-es-1', '1. CMMI-DEV v2.0, ABNT NBR ISO/IEC/IEEE 12207:2021 e MR-MPS-SW versão 2023'),
            makeTopic('dpe-es-2', '2. UML 2.5, BPMN e modelagem/especificação de processos e sistemas'),
            makeTopic('dpe-es-3', '3. Métodos Ágeis (Scrum, Kanban, XP e similares)'),
            makeTopic('dpe-es-4', '4. Engenharia de Requisitos, dicionário de dados, rastreabilidade e documentação técnica'),
            makeTopic('dpe-es-5', '5. Desenvolvimento Low-Code/No-Code e modelagem de dados estruturados, semiestruturados (XML, JSON) e não estruturados'),
            makeTopic('dpe-es-6', '6. Qualidade de Software (ABNT NBR ISO/IEC 25010:2024), ciclo de vida, manutenção e gestão de débito técnico'),
            makeTopic('dpe-es-7', '7. Testes de Software (funcionais, não funcionais, unitários, integração, sistema, aceitação, carga, estresse, segurança e usabilidade)'),
            makeTopic('dpe-es-8', '8. Gestão de Configuração, versionamento semântico, code review, homologação e aceite de sistemas'),
          ],
        },
        {
          id: 'dpe-gov-ti',
          name: 'Gestão, Governança de TIC & Contratações Públicas',
          categoryTag: 'Específicas D04 • Peso 2',
          topics: [
            makeTopic('dpe-gov-1', '1. PMBOK 7ª edição, ITIL v4 e COBIT 2019'),
            makeTopic('dpe-gov-2', '2. Planejamento Estratégico de TIC (PETIC, PDTIC), gestão de portfólio e gestão de níveis de serviço (SLAs e OLAs)'),
            makeTopic('dpe-gov-3', '3. Gestão Financeira de TI (TCO, ROI, CAPEX, OPEX e FinOps) e Gestão de Riscos (ABNT NBR ISO 31000:2023)'),
            makeTopic('dpe-gov-4', '4. Gestão de Contratos e Fornecedores de TIC na Lei nº 14.133/2021: ETP, Termo de Referência, PoC e fiscalização'),
            makeTopic('dpe-gov-5', '5. Arquitetura Corporativa (TOGAF), alinhamento estratégico e interoperabilidade no setor público'),
          ],
        },
        {
          id: 'dpe-prog-web',
          name: 'Programação, Desenvolvimento Web/Mobile & APIs',
          categoryTag: 'Específicas D04 • Peso 2',
          topics: [
            makeTopic('dpe-pw-1', '1. Linguagens PHP, Python, C, Java, C# e plataforma .NET; sintaxe, estruturas, coleções e tratamento de exceções'),
            makeTopic('dpe-pw-2', '2. Orientação a Objetos (classes, interfaces, herança, polimorfismo), Princípios SOLID, TDD e BDD'),
            makeTopic('dpe-pw-3', '3. Controle de versão com Git (GitFlow, pull requests, code review) e automação por scripts, workflows e RPA'),
            makeTopic('dpe-pw-4', '4. Desenvolvimento Web/Mobile: HTML5, CSS3, Bootstrap 5, JavaScript, TypeScript, React, React Native, Angular, Node.js e Vue.js'),
            makeTopic('dpe-pw-5', '5. Web Services RESTful, OpenAPI/Swagger, versionamento, idempotência, paginação, JSON e XML Schema'),
            makeTopic('dpe-pw-6', '6. Usabilidade, UX, design responsivo (mobile-first) e acessibilidade digital (WCAG e ABNT NBR 17225:2025)'),
          ],
        },
        {
          id: 'dpe-arq-devops',
          name: 'Arquitetura de Sistemas, DevOps, Sistemas Operacionais, Redes & Cloud',
          categoryTag: 'Específicas D04 • Peso 2',
          topics: [
            makeTopic('dpe-ad-1', '1. Arquiteturas multicamadas, SOA, orientada a eventos (filas/mensageria), MVC, DDD, Hexagonal e Cloud-Native'),
            makeTopic('dpe-ad-2', '2. Microsserviços e resiliência: API Gateway, Service Discovery, Circuit Breaker, Retries e Timeouts'),
            makeTopic('dpe-ad-3', '3. DevOps e DevSecOps: CI/CD, IaC, Docker, Kubernetes, estratégias Blue/Green e Canary Releases'),
            makeTopic('dpe-ad-4', '4. Observabilidade e Monitoramento (APM, logs, métricas, traces): Zabbix, ELK Stack, Grafana, Prometheus e Fluentd'),
            makeTopic('dpe-ad-5', '5. Sistemas Operacionais: processos, threads, memória virtual, Linux (Red Hat/Oracle) e Windows Server (PowerShell, hardening)'),
            makeTopic('dpe-ad-6', '6. Redes e Servidores: TCP/IP, IPv4/IPv6, DNS, DHCP, HTTP, SSH, LDAP, SNMP, Wi-Fi, SDN, NFV, VLAN, VXLAN, JBoss, Apache e IIS'),
            makeTopic('dpe-ad-7', '7. Computação em Nuvem: IaaS, PaaS, SaaS; nuvem pública, privada, híbrida e multicloud; migração e governança cloud'),
          ],
        },
        {
          id: 'dpe-bd-ia',
          name: 'Banco de Dados, Engenharia de Dados, BI & Inteligência Artificial',
          categoryTag: 'Específicas D04 • Peso 2',
          topics: [
            makeTopic('dpe-bd-1', '1. Modelo Entidade-Relacionamento, Normalização e SQL (DML, DDL, DCL, transações, subconsultas, CTEs e Window Functions)'),
            makeTopic('dpe-bd-2', '2. SGBDs: PostgreSQL 14/15, Oracle 19c, H2 Database e PL/SQL'),
            makeTopic('dpe-bd-3', '3. Modelagem Dimensional (estrela/floco de neve), Data Warehouse, Data Mart, OLAP, Data Lake, Data Lakehouse e NoSQL'),
            makeTopic('dpe-bd-4', '4. Engenharia de Dados e Big Data: ETL/ELT, CDC, pipelines, Apache Spark, Apache Kafka e governança/qualidade de dados'),
            makeTopic('dpe-bd-5', '5. Business Intelligence (BI): arquitetura, indicadores, KPIs, dashboards e análise multidimensional'),
            makeTopic('dpe-bd-6', '6. IA e Automação Inteligente: ML, Deep Learning, IA Generativa, LLMs, Embeddings, Bancos Vetoriais, RAG, Prompt Engineering, Agentes e MLOps'),
          ],
        },
        {
          id: 'dpe-seg-pdpj',
          name: 'Segurança da Informação, LGPD & Plataforma Digital do Poder Judiciário (PDPJ-Br)',
          categoryTag: 'Específicas D04 • Peso 2',
          topics: [
            makeTopic('dpe-sp-1', '1. Normas ISO/IEC 27001:2024, 27002:2022, 27005:2023, 27035-1:2023, 27017:2016 e NIST SP 800-61'),
            makeTopic('dpe-sp-2', '2. Proteção de Infraestrutura: Firewall, WAF, UTM, DMZ, Proxy, NAC, IDS/IPS, VPN, Zero Trust (ZTNA), SOC, SIEM e EDR'),
            makeTopic('dpe-sp-3', '3. Criptografia, certificados digitais, hashes, RBAC, MFA, IAM, SSO, OAuth 2.0 e OpenID Connect (OIDC)'),
            makeTopic('dpe-sp-4', '4. Segurança de Aplicações: OWASP Top 10:2025, SSDLC, SAST, DAST, modelagem de ameaças e segurança de containers'),
            makeTopic('dpe-sp-5', '5. LGPD (Lei nº 13.709/2018): princípios, bases legais, tratamento pelo Poder Público, ANPD, anonimização e pseudonimização'),
            makeTopic('dpe-sp-6', '6. Normativos PDPJ-Br: Resoluções CNJ nº 522/2023 (MoReq-Jus), 396/2021, 335/2020 e Portarias CNJ nº 252, 253, 284, 131 e 162'),
            makeTopic('dpe-sp-7', '7. Arquitetura PDPJ-Br: Java, Spring Boot/Cloud, Eureka, Zuul, MapStruct, Swagger, JPA/Hibernate/Envers, Flyway, Keycloak, RabbitMQ, Rancher e Inglês Técnico'),
          ],
        },
      ],
    },
  ];
}

export function getRealConcursoEvents(): CalendarEvent[] {
  return [
    {
      id: 'ev-real-insc-dpepb',
      title: 'Fim das Inscrições DPE-PB (D04 Desenv. Sistemas)',
      date: '2026-11-13',
      startTime: '23:59',
      endTime: '23:59',
      category: 'entrevista',
      recurrence: 'unico',
      isHighlight: true,
      locationOrLink: 'Site FCC (Boleto até 16/11)',
    },
    {
      id: 'ev-real-insc-tjpb',
      title: 'Fim das Inscrições TJPB (Cargo 4: Inteligência Artificial)',
      date: '2026-11-18',
      startTime: '16:00',
      endTime: '16:00',
      category: 'entrevista',
      recurrence: 'unico',
      isHighlight: true,
      locationOrLink: 'Site FGV (Boleto até 19/11)',
    },
    {
      id: 'ev-real-prova-tjpb',
      title: 'PROVA TJPB — Analista TI: Inteligência Artificial',
      date: '2027-01-24',
      startTime: '13:00',
      endTime: '18:00',
      category: 'concurso',
      recurrence: 'unico',
      isHighlight: true,
      locationOrLink: 'João Pessoa/PB (Banca FGV)',
    },
    {
      id: 'ev-real-prova-dpepb',
      title: 'PROVA DPE-PB — D04 Analista: Desenv. de Sistemas',
      date: '2027-02-28',
      startTime: '14:00',
      endTime: '18:00',
      category: 'concurso',
      recurrence: 'unico',
      isHighlight: true,
      locationOrLink: 'João Pessoa/PB (Banca FCC)',
    },
  ];
}

export function getInitialPlannerData(): PlannerDataState {
  const now = new Date();
  const todayIso = toISODateString(now);
  const realExams = getRealConcursosParaiba();

  return {
    exams: realExams,
    jobs: [],
    examTargetName: realExams[0].name,
    examSubjects: realExams[0].subjects,
    lastSyncedAt: new Date().toISOString(),
    quickNotesUpdatedAt: new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    quickNotes:
      '📌 Prazos Importantes dos Editais:\n• DPE-PB (D04 Desenv. Sistemas - FCC): Inscrição até 13/11/2026 (Boleto até 16/11) | Prova: 28/02/2027\n• TJPB (Cargo 4: IA - FGV): Inscrição até 18/11/2026 (Boleto até 19/11) | Prova: 24/01/2027 (13h às 18h)',
    events: getRealConcursoEvents(),
    fixedClasses: getUfcg20262FixedClasses(),
    collegeSubjects: getUfcg20262Subjects(),
  };
}

export function getBlankPlannerData(): PlannerDataState {
  return {
    exams: [],
    jobs: [],
    events: [],
    fixedClasses: [],
    collegeSubjects: [],
    quickNotes: '',
    quickNotesUpdatedAt: new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    lastSyncedAt: new Date().toISOString(),
  };
}

/**
 * Garante que o estado salvo localmente migre automaticamente para:
 * - Os 2 concursos reais (TJPB Inteligência Artificial + DPE-PB D04 Desenvolvimento de Sistemas)
 * - As 5 disciplinas reais 2026.2 da UFCG
 * - Os alertas de inscrição e prova dos dois editais
 * (Para contas novas de outros usuários onde isClaraSeed === false, mantém os dados próprios da conta)
 */
export function normalizePlannerState(
  raw: PlannerDataState,
  isClaraSeed = true
): PlannerDataState {
  if (!isClaraSeed) {
    return {
      events: Array.isArray(raw.events) ? raw.events : [],
      fixedClasses: Array.isArray(raw.fixedClasses) ? raw.fixedClasses : [],
      collegeSubjects: Array.isArray(raw.collegeSubjects)
        ? raw.collegeSubjects
        : [],
      exams: Array.isArray(raw.exams) ? raw.exams : [],
      jobs: Array.isArray(raw.jobs) ? raw.jobs : [],
      quickNotes: raw.quickNotes ?? '',
      quickNotesUpdatedAt: raw.quickNotesUpdatedAt ?? '',
      lastSyncedAt: raw.lastSyncedAt ?? new Date().toISOString(),
      theme: raw.theme,
    };
  }

  let updated = {
    ...raw,
    jobs: Array.isArray(raw.jobs) ? raw.jobs : [],
  };

  // 1. Atualiza para os 2 Concursos reais (TJPB IA + DPE-PB D04) se ainda estiver com os exemplos antigos
  const hasRealConcursos =
    Array.isArray(updated.exams) &&
    updated.exams.some((e) => e.id === 'concurso-tjpb-ia-2026') &&
    updated.exams.some((e) => e.id === 'concurso-dpepb-d04-2026');

  if (!hasRealConcursos) {
    const customUserExams = (updated.exams || []).filter(
      (e) =>
        ![
          'exam-tre-2026',
          'exam-bb-2026',
          'exam-pref-2026',
          'exam-migrated-1',
        ].includes(e.id)
    );
    updated.exams = [...getRealConcursosParaiba(), ...customUserExams];
  }

  // 2. Disciplinas reais 2026.2 da UFCG
  const hasOldDemoSubjects =
    Array.isArray(updated.collegeSubjects) &&
    updated.collegeSubjects.some((s) => s.id === 'subj-1' || s.id === 'subj-2') &&
    !updated.collegeSubjects.some((s) => s.id === 'ufcg-economia-ti');

  if (
    hasOldDemoSubjects ||
    !Array.isArray(updated.collegeSubjects) ||
    updated.collegeSubjects.length === 0
  ) {
    const customSubjects = (updated.collegeSubjects || []).filter(
      (s) => s.id !== 'subj-1' && s.id !== 'subj-2'
    );
    const customClasses = (updated.fixedClasses || []).filter(
      (c) => !['cls-1', 'cls-2', 'cls-3', 'cls-4'].includes(c.id)
    );

    updated.collegeSubjects = [...getUfcg20262Subjects(), ...customSubjects];
    updated.fixedClasses = [...getUfcg20262FixedClasses(), ...customClasses];
  } else {
    const defaultSubjects = getUfcg20262Subjects();
    updated.collegeSubjects = updated.collegeSubjects.map((s) => {
      const cleaned =
        s.code && s.code.startsWith('2026.2') ? { ...s, code: '' } : s;

      const refSubj = defaultSubjects.find((ds) => ds.id === cleaned.id);
      if (refSubj) {
        const mergedUnits = cleaned.units.map((u) => {
          const refUnit = refSubj.units.find(
            (du) => du.unitNumber === u.unitNumber
          );
          if (!refUnit || refUnit.assessments.length === 0) return u;

          const existingAss = [...(u.assessments || [])];
          for (const newAss of refUnit.assessments) {
            if (!existingAss.some((a) => a.id === newAss.id)) {
              existingAss.push(newAss);
            }
          }
          return {
            ...u,
            assessments: existingAss,
          };
        });
        return { ...cleaned, units: mergedUnits };
      }

      return cleaned;
    });
    updated.fixedClasses = (updated.fixedClasses || []).map((c) => ({
      ...c,
      room: c.room.replace(/\s*\([2-6][MTN]\d+\)/g, ''),
    }));
  }

  // 3. Adiciona os eventos reais de inscrição e prova da DPE-PB e TJPB e remove eventos fictícios antigos
  const existingEvents = (updated.events || []).filter(
    (ev) =>
      ![
        'ev-entrevista-1',
        'ev-reuniao-quinzenal',
        'ev-agenda-hoje-1',
        'ev-agenda-hoje-2',
        'ev-aniversario-1',
        'ev-rotina-pilates',
      ].includes(ev.id)
  );
  const realEvents = getRealConcursoEvents();
  const mergedEvents = [...existingEvents];
  for (const rev of realEvents) {
    if (!mergedEvents.some((e) => e.id === rev.id)) {
      mergedEvents.push(rev);
    }
  }
  updated.events = mergedEvents;

  return updated;
}
