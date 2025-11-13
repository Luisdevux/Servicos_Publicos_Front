// src/components/ProfilePhotoUpload.tsx
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, X, Loader2, Trash2 } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { validateImageMagicBytes } from '@/lib/imageUtils';

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string | null;
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
  isUploading?: boolean;
  isRemoving?: boolean;
  userName?: string;
}

export function ProfilePhotoUpload({
  currentPhotoUrl,
  onUpload,
  onRemove,
  isUploading = false,
  isRemoving = false,
  userName = 'Usuário',
}: ProfilePhotoUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Usa a URL do preview otimista se disponível, senão usa a URL atual
  const displayPhotoUrl = uploadedPreview || currentPhotoUrl;

  // Fecha o menu de ações quando clicar fora (mobile)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsActionsMenuOpen(false);
      }
    };

    if (isActionsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside as unknown as EventListener);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside as unknown as EventListener);
    };
  }, [isActionsMenuOpen]);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('O arquivo deve ter no máximo 5MB.');
      return;
    }

    // Validar magic bytes (assinatura do arquivo)
    const isValidImage = await validateImageMagicBytes(file);
    if (!isValidImage) {
      toast.error('Arquivo inválido. Envie apenas imagens JPG, PNG ou SVG.');
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
      setSelectedFile(file);
      setIsDialogOpen(true);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;

    try {
      // Define o preview otimista antes do upload
      setUploadedPreview(previewUrl);
      
      await onUpload(selectedFile);
      handleCancelUpload();
      toast.success('Foto atualizada com sucesso!');
    } catch (error) {
      // Remove o preview otimista em caso de erro
      setUploadedPreview(null);
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload da foto. Tente novamente.');
    }
  };

  const handleCancelUpload = () => {
    setIsDialogOpen(false);
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveClick = () => {
    if (!currentPhotoUrl) {
      toast.error('Não há foto para remover.');
      return;
    }
    setIsActionsMenuOpen(false);
    setIsRemoveDialogOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!onRemove) return;

    try {
      // Define preview otimista (remove imediatamente)
      setUploadedPreview(null);
      
      await onRemove();
      setIsRemoveDialogOpen(false);
      toast.success('Foto removida com sucesso!');
    } catch (error) {
      // Restaura a foto em caso de erro
      setUploadedPreview(currentPhotoUrl || null);
      console.error('Erro ao remover foto:', error);
      toast.error('Erro ao remover a foto. Tente novamente.');
    }
  };

  const handleCancelRemove = () => {
    setIsRemoveDialogOpen(false);
  };

  return (
    <>
      <div ref={containerRef} className="relative group" data-test="profile-photo-upload">
        {/* Avatar com click/touch para abrir menu em mobile */}
        <div 
          onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
          className="cursor-pointer"
        >
          <Avatar
            src={displayPhotoUrl}
            alt={userName}
            size="xl"
            className="ring-4 ring-white shadow-xl"
          />
        </div>
        
        {/* Botões no hover (desktop) - visível sempre em mobile quando menu aberto */}
        <div className={`
          absolute inset-0 rounded-full bg-black/40 transition-opacity duration-200 
          flex items-center justify-center gap-2 pointer-events-none
          ${isActionsMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
        `}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUploadClick();
            }}
            disabled={isUploading || isRemoving}
            className="bg-white rounded-full p-3 shadow-lg hover:scale-110 active:scale-95 transform transition-transform disabled:opacity-50 pointer-events-auto"
            data-test="upload-photo-button"
            type="button"
            title="Alterar foto"
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 text-global-accent animate-spin" />
            ) : (
              <Camera className="w-6 h-6 text-global-accent" />
            )}
          </button>

          {/* Botão de remover (só aparece se tiver foto) */}
          {currentPhotoUrl && onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveClick();
              }}
              disabled={isUploading || isRemoving}
              className="bg-white rounded-full p-3 shadow-lg hover:scale-110 active:scale-95 transform transition-transform disabled:opacity-50 pointer-events-auto"
              data-test="remove-photo-button"
              type="button"
              title="Remover foto"
            >
              {isRemoving ? (
                <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
              ) : (
                <Trash2 className="w-6 h-6 text-red-600" />
              )}
            </button>
          )}
        </div>

        {/* Badge de status */}
        {isUploading && (
          <div className="absolute -bottom-2 -right-2 bg-global-accent text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
            Enviando...
          </div>
        )}
        
        {isRemoving && (
          <div className="absolute -bottom-2 -right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
            Removendo...
          </div>
        )}

        {/* Hint para mobile - só aparece se não estiver fazendo upload/remoção */}
        {!isUploading && !isRemoving && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 md:hidden animate-pulse">
            <div className="bg-gray-800/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
              Toque para editar
            </div>
          </div>
        )}

        {/* Input de arquivo escondido */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
          data-test="file-input"
        />
      </div>

      {/* Dialog usando componente shadcn/ui */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent 
          className="sm:max-w-md"
          data-test="upload-preview-dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800">
              Confirmar nova foto
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Preview da foto */}
            <div className="flex justify-center">
              {previewUrl && (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-48 h-48 rounded-full object-cover shadow-lg ring-4 ring-gray-200"
                    data-test="photo-preview"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full shadow-lg">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>
              )}
            </div>

            {/* Mensagem */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Esta será sua nova foto de perfil.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Você poderá alterá-la novamente quando quiser.
              </p>
            </div>

            {/* Botões de ação */}
            <div className="flex gap-3">
              <Button
                onClick={handleCancelUpload}
                className="flex-1 border-2 border-gray-200 bg-white hover:bg-gray-50"
                data-test="cancel-button"
                type="button"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmUpload}
                disabled={isUploading}
                className="flex-1 bg-global-accent text-white hover:opacity-90"
                data-test="confirm-upload-button"
                type="button"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Confirmar
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de remoção */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent 
          className="sm:max-w-md"
          data-test="remove-confirmation-dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800">
              Remover foto de perfil
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Ícone de confirmação */}
            <div className="flex justify-center">
              <div className="bg-red-100 rounded-full p-4">
                <Trash2 className="w-12 h-12 text-red-600" />
              </div>
            </div>

            {/* Mensagem */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Tem certeza que deseja remover sua foto de perfil?
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Você poderá adicionar uma nova foto quando quiser.
              </p>
            </div>

            {/* Botões de ação */}
            <div className="flex gap-3">
              <Button
                onClick={handleCancelRemove}
                className="flex-1 border-2 border-gray-200 bg-white hover:bg-gray-50"
                data-test="cancel-remove-button"
                type="button"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmRemove}
                disabled={isRemoving}
                className="flex-1 bg-red-600 text-white hover:bg-red-700"
                data-test="confirm-remove-button"
                type="button"
              >
                {isRemoving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Removendo...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remover
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
