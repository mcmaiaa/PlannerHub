import React, { useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CalendarView } from './components/CalendarView';
import { CollegeView } from './components/CollegeView';
import { ExamView } from './components/ExamView';
import { JobsView } from './components/JobsView';
import { AuthView } from './components/AuthView';
import { FilePreviewModal } from './components/FilePreviewModal';
import { usePlannerStore } from './store/usePlannerStore';

export const App: React.FC = () => {
  const {
    currentUser,
    activeTab,
    isLoading,
    initializeStore,
    previewAttachment,
    setPreviewAttachment,
  } = usePlannerStore();

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  if (!currentUser) {
    return <AuthView />;
  }

  return (
    <div className="min-h-screen bg-[#16131D] text-[#F5F2F8] flex flex-col lg:flex-row">
      {/* Navegação Lateral Fixa à Esquerda */}
      <Sidebar />

      {/* Área de Conteúdo Principal Ampliada */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-sm text-[#A89FBD] animate-pulse">
              Carregando seu Planner & Study Hub... ✨
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'calendar' && <CalendarView />}
            {activeTab === 'college' && <CollegeView />}
            {activeTab === 'concurso' && <ExamView />}
            {activeTab === 'vagas' && <JobsView />}
          </>
        )}
      </main>

      {/* Modal Global de Visualização de Notas do Tablet (PDF / PNG / JPG) */}
      <FilePreviewModal
        attachment={previewAttachment}
        onClose={() => setPreviewAttachment(null)}
      />
    </div>
  );
};

export default App;
