// src/hooks/useProfileUpdate.ts
'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usuarioService } from '@/services/usuarioService';
import type { UpdateUsuariosData } from '@/types';

export function useProfileUpdate(userId: string) {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  // Mutation para atualizar dados do perfil
  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateUsuariosData) => {
      return usuarioService.atualizarUsuario(userId, data);
    },
    onSuccess: () => {
      // Invalida o cache da sessão e do perfil para atualizar os dados
      queryClient.invalidateQueries({ queryKey: ['session'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile', userId] });
      setIsEditing(false);
    },
  });

  // Mutation para upload de foto
  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      return await usuarioService.uploadFotoUsuario(userId, file);
    },
    onSuccess: () => {
      // Invalida o cache da sessão e do perfil para atualizar a foto
      queryClient.invalidateQueries({ queryKey: ['session'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile', userId] });
    },
  });

  const updateProfile = async (data: UpdateUsuariosData) => {
    return updateProfileMutation.mutateAsync(data);
  };

  const uploadPhoto = async (file: File) => {
    return uploadPhotoMutation.mutateAsync(file);
  };

  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    updateProfileMutation.reset();
  };

  return {
    isEditing,
    toggleEdit,
    cancelEdit,
    updateProfile,
    uploadPhoto,
    isUpdating: updateProfileMutation.isPending,
    isUploadingPhoto: uploadPhotoMutation.isPending,
    updateError: updateProfileMutation.error,
    uploadError: uploadPhotoMutation.error,
  };
}
