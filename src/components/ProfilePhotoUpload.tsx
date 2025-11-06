// src/components/ProfilePhotoUpload.tsx
'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { validateImageMagicBytes } from '@/lib/imageUtils';

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string | null;
  onUpload: (file: File) => Promise<void>;
  isUploading?: boolean;
  userName?: string;
}

export function ProfilePhotoUpload({
  currentPhotoUrl,
  onUpload,
  isUploading = false,
  userName = 'Usuário',
}: ProfilePhotoUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      await onUpload(selectedFile);
      handleCancelUpload();
      toast.success('Foto atualizada com sucesso!');
    } catch (error) {
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

  return (
    <>
      <div className="relative group" data-test="profile-photo-upload">
        <Avatar
          src={currentPhotoUrl}
          alt={userName}
          size="xl"
          className="ring-4 ring-white shadow-xl"
        />
        
        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
          <button
            onClick={handleUploadClick}
            disabled={isUploading}
            className="bg-white rounded-full p-3 shadow-lg hover:scale-110 transform transition-transform disabled:opacity-50 pointer-events-auto"
            data-test="upload-photo-button"
            type="button"
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 text-[var(--global-accent)] animate-spin" />
            ) : (
              <Camera className="w-6 h-6 text-[var(--global-accent)]" />
            )}
          </button>
        </div>

        {/* Badge de status */}
        {isUploading && (
          <div className="absolute -bottom-2 -right-2 bg-[var(--global-accent)] text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
            Enviando...
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
                className="flex-1 bg-[var(--global-accent)] text-white hover:opacity-90"
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
    </>
  );
}
