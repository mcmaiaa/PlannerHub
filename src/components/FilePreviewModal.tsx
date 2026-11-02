import React, { useEffect, useState } from 'react';
import { X, ExternalLink, FileText, Download, Sparkles } from 'lucide-react';
import { TabletNoteAttachment } from '../types';
import { storageService } from '../services/storageService';
import { formatReadableDate } from '../utils/dateUtils';

interface FilePreviewModalProps {
  attachment: TabletNoteAttachment | null;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  attachment,
  onClose,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activeUrl: string | null = null;
    if (!attachment) {
      setPreviewUrl(null);
      setError(null);
      return;
    }

    storageService
      .getFilePreviewUrl(attachment)
      .then((res) => {
        activeUrl = res.url;
        setPreviewUrl(res.url);
        setMimeType(res.mimeType);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Erro ao abrir arquivo.');
      });

    return () => {
      if (activeUrl && activeUrl.startsWith('blob:')) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [attachment]);

  if (!attachment) return null;

  const isPdf = mimeType === 'application/pdf' || attachment.fileName.toLowerCase().endsWith('.pdf');
  const isSvgOrImage =
    mimeType.startsWith('image/') ||
    attachment.isDemoSample ||
    /\.(png|jpg|jpeg|webp|svg)$/i.test(attachment.fileName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#211C2B] border border-[#322B40] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#322B40] bg-[#1B1624]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#C4B5FD]/15 border border-[#C4B5FD]/30 flex items-center justify-center text-[#C4B5FD] shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-[#F5F2F8] truncate">
                {attachment.title}
              </h3>
              <p className="text-xs text-[#A89FBD] flex items-center gap-2">
                <span>{attachment.fileName}</span>
                <span>•</span>
                <span>{formatReadableDate(attachment.date)}</span>
                {attachment.isDemoSample && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F9A8D4]/15 text-[#F9A8D4] border border-[#F9A8D4]/30">
                    <Sparkles className="w-3 h-3" /> Nota Exemplo do Tablet
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {previewUrl && (
              <>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#C4B5FD]/15 text-[#C4B5FD] hover:bg-[#C4B5FD]/25 border border-[#C4B5FD]/30 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir em Nova Aba
                </a>
                <a
                  href={previewUrl}
                  download={attachment.fileName}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#292336] text-[#F5F2F8] hover:bg-[#322B40] border border-[#322B40] transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar
                </a>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#A89FBD] hover:text-[#F5F2F8] hover:bg-[#322B40]/60 transition"
              title="Fechar visualização"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-6 bg-[#16131D] flex items-center justify-center min-h-[420px]">
          {error ? (
            <div className="text-center max-w-md p-6 rounded-2xl bg-[#211C2B] border border-[#FDA4AF]/30">
              <p className="text-sm text-[#FDA4AF] font-medium mb-2">{error}</p>
              <p className="text-xs text-[#A89FBD]">
                Verifique se o arquivo foi enviado neste dispositivo ou sincronizado via Supabase Storage.
              </p>
            </div>
          ) : !previewUrl ? (
            <div className="text-sm text-[#A89FBD] animate-pulse">
              Carregando anotação do Tablet...
            </div>
          ) : isSvgOrImage && !isPdf ? (
            <img
              src={previewUrl}
              alt={attachment.title}
              className="max-w-full max-h-[72vh] rounded-xl border border-[#322B40] shadow-lg object-contain"
            />
          ) : (
            <iframe
              src={previewUrl}
              title={attachment.title}
              className="w-full h-[72vh] rounded-xl border border-[#322B40] bg-white"
            />
          )}
        </div>
      </div>
    </div>
  );
};
