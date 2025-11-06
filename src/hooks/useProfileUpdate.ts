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
    onSuccess: (response) => {
      // Atualiza o cache imediatamente com a nova URL da foto
      if (response?.data?.link_imagem) {
        queryClient.setQueryData(['user-profile', userId], (oldData: any) => {
          if (oldData) {
            return {
              ...oldData,
              link_imagem: response.data!.link_imagem,
            };
          }
          return oldData;
        });
      }
      
      // Também invalida os caches para garantir sincronização
      queryClient.invalidateQueries({ queryKey: ['session'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile', userId] });
    },
  });

  // Mutation para deletar foto
  const deletePhotoMutation = useMutation({
    mutationFn: async () => {
      return await usuarioService.deletarFotoUsuario(userId);
    },
    onSuccess: () => {
      // Atualiza o cache imediatamente removendo a foto
      queryClient.setQueryData(['user-profile', userId], (oldData: any) => {
        if (oldData) {
          return {
            ...oldData,
            link_imagem: null,
          };
        }
        return oldData;
      });
      
      // Também invalida os caches para garantir sincronização
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

  const deletePhoto = async () => {
    return deletePhotoMutation.mutateAsync();
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
    deletePhoto,
    isUpdating: updateProfileMutation.isPending,
    isUploadingPhoto: uploadPhotoMutation.isPending,
    isDeletingPhoto: deletePhotoMutation.isPending,
    updateError: updateProfileMutation.error,
    uploadError: uploadPhotoMutation.error,
    deleteError: deletePhotoMutation.error,
  };
}
