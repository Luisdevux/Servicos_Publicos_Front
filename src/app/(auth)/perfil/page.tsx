// src/app/(auth)/perfil/page.tsx

'use client';

import { Button } from '@/components/ui/button';
import { ProfilePhotoUpload } from '@/components/ProfilePhotoUpload';
import { ProfileField } from '@/components/ProfileField';
import { useAuth } from '@/hooks/useAuth';
import { useProfileUpdate } from '@/hooks/useProfileUpdate';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useCepVilhena } from '@/hooks/useCepVilhena';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Edit2, X, Save, LogOut, Loader2, User, Mail, Phone, MapPin, Calendar, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import type { UpdateUsuariosData } from '@/types';
import {
  formatPhoneNumber,
  formatCEP,
  formatCPF,
  cleanPhoneNumber,
  cleanCEP,
  validatePhoneNumber,
  validateName,
  validateCEPVilhena,
  getUserType,
  isMunicipe,
  getUserData,
  getUserEndereco,
  formatDate,
} from '@/lib/profileHelpers';

export default function PerfilPage() {
  const { isAuthenticated, user: sessionUser, isLoading: isAuthLoading, logout } = useAuth();
  const router = useRouter();
  const { buscarCep, formatarCep, validarCepEncontrado, marcarCepComoEncontrado } = useCepVilhena();
  
  // Buscar dados completos do usuário da API
  const { data: fullUser, isLoading: isProfileLoading } = useUserProfile(sessionUser?.id);
  
  // Usar dados completos se disponíveis, senão usar da sessão
  const user = fullUser || sessionUser;
  const isLoading = isAuthLoading || isProfileLoading;
  
  const {
    isEditing,
    toggleEdit,
    cancelEdit,
    updateProfile,
    uploadPhoto,
    deletePhoto,
    isUpdating,
    isUploadingPhoto,
    isDeletingPhoto,
    updateError,
  } = useProfileUpdate(sessionUser?.id || '');

  // Estados para campos editáveis
  const [formData, setFormData] = useState({
    nome: '',
    celular: '',
    nome_social: '',
    cargo: '',
    formacao: '',
    endereco: {
      logradouro: '',
      cep: '',
      bairro: '',
      numero: '' as string | number,
      complemento: '',
      cidade: '',
      estado: '' as any,
    },
  });

  // Sincronizar dados do usuário com o formulário
  const initialCepMarked = useRef(false);
  
  useEffect(() => {
    if (user) {
      const cepUsuario = ('endereco' in user ? user.endereco?.cep : '') || '';
      
      setFormData({
        nome: user.nome || '',
        celular: formatPhoneNumber(user.celular || ''),
        nome_social: ('nome_social' in user ? user.nome_social : '') || '',
        cargo: ('cargo' in user ? user.cargo : '') || '',
        formacao: ('formacao' in user ? user.formacao : '') || '',
        endereco: {
          logradouro: ('endereco' in user ? user.endereco?.logradouro : '') || '',
          cep: formatCEP(cepUsuario),
          bairro: ('endereco' in user ? user.endereco?.bairro : '') || '',
          numero: ('endereco' in user ? user.endereco?.numero?.toString() : '') || '',
          complemento: ('endereco' in user ? user.endereco?.complemento : '') || '',
          cidade: ('endereco' in user ? user.endereco?.cidade : '') || '',
          estado: ('endereco' in user ? user.endereco?.estado : '') || '',
        },
      });
      
      // Marcar o CEP existente como válido/encontrado apenas uma vez
      if (cepUsuario && !initialCepMarked.current) {
        marcarCepComoEncontrado(cepUsuario);
        initialCepMarked.current = true;
      }
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const handleInputChange = (field: string, value: string | number) => {
    if (field.startsWith('endereco.')) {
      const enderecoField = field.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          [enderecoField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleCepChange = async (cep: string) => {
    const cepFormatado = formatarCep(cep);
    handleInputChange('endereco.cep', cepFormatado);

    const cepLimpo = cleanCEP(cep);
    
    // Validar se o CEP é de Vilhena antes de buscar
    if (cepLimpo.length === 8) {
      const endereco = await buscarCep(cepLimpo);
      
      if (endereco) {
        setFormData((prev) => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            cep: cepFormatado,
            logradouro: endereco.logradouro || prev.endereco.logradouro,
            bairro: endereco.bairro || prev.endereco.bairro,
            cidade: endereco.cidade || prev.endereco.cidade,
            estado: endereco.estado || prev.endereco.estado,
          },
        }));
      }
    }
  };

  const handleCelularChange = (celular: string) => {
    const celularFormatado = formatPhoneNumber(celular);
    handleInputChange('celular', celularFormatado);
  };

  const handleSave = async () => {
    // Validar nome
    const nameValidation = validateName(formData.nome);
    if (!nameValidation.valid) {
      toast.error(nameValidation.message);
      return;
    }
    
    // Validar celular
    const phoneValidation = validatePhoneNumber(formData.celular);
    if (!phoneValidation.valid) {
      toast.error(phoneValidation.message);
      return;
    }
    
    // Validar CEP de Vilhena, verifica se está no range e se foi encontrado no ViaCEP
    const cepValidation = validarCepEncontrado(formData.endereco.cep);
    if (!cepValidation.valid) {
      toast.error(cepValidation.message || 'CEP inválido');
      return;
    }

    try {
      const updateData: UpdateUsuariosData = {
        nome: formData.nome,
        celular: cleanPhoneNumber(formData.celular),
        endereco: {
          ...formData.endereco,
          numero: typeof formData.endereco.numero === 'string' 
            ? parseInt(formData.endereco.numero) || 0 
            : formData.endereco.numero
        },
      };

      // Só adiciona campos opcionais se tiverem valor
      if (formData.nome_social && formData.nome_social.trim().length > 1) {
        updateData.nome_social = formData.nome_social;
      }
      
      if (formData.cargo && formData.cargo.trim()) {
        updateData.cargo = formData.cargo;
      }
      
      if (formData.formacao && formData.formacao.trim()) {
        updateData.formacao = formData.formacao;
      }

      await updateProfile(updateData);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil. Tente novamente.');
    }
  };

  const handlePhotoUpload = async (file: File) => {
    try {
      await uploadPhoto(file);
      // A invalidação do cache no hook vai recarregar automaticamente os dados
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      throw error; // Propaga o erro para o componente tratar
    }
  };

  const handlePhotoRemove = async () => {
    try {
      await deletePhoto();
      // A invalidação do cache no hook vai recarregar automaticamente os dados
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      throw error; // Propaga o erro para o componente tratar
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" data-test="loading-perfil">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto animate-spin text-global-accent" />
          <p className="mt-4 text-gray-700">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50" data-test="page-perfil">
      <div className="px-6 sm:px-6 lg:px-40 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="h-35 relative bg-global-accent">
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="profile-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="1.5" fill="white"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#profile-grid)"/>
              </svg>
            </div>
          </div>
          
          <div className="px-6 sm:px-6 lg:px-12 pb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 gap-6">
              <ProfilePhotoUpload
                currentPhotoUrl={getUserData(user as any, 'link_imagem')}
                onUpload={handlePhotoUpload}
                onRemove={handlePhotoRemove}
                isUploading={isUploadingPhoto}
                isRemoving={isDeletingPhoto}
                userName={user?.nome}
              />
              
              <div className="flex-1 text-center sm:text-left mt-20">
                <h1 className="text-3xl font-bold text-gray-800" data-test="perfil-titulo">
                  {user.nome}
                </h1>
                <p className="mt-2 text-gray-600 text-lg">{getUserType(user as any)}</p>
              </div>

              <div className="flex gap-3">
                {!isEditing ? (
                  <Button
                    onClick={toggleEdit}
                    className="bg-global-accent text-white hover:opacity-90"
                    data-test="button-editar-perfil"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={cancelEdit}
                      className="border-2 border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      data-test="button-cancelar-edicao"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isUpdating}
                      className="bg-green-600 text-white hover:bg-green-700"
                      data-test="button-salvar-perfil"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Salvar
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-sm p-8" data-test="perfil-info-pessoal">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
                <User className="w-5 h-5 mr-2 text-global-accent" />
                Informações Pessoais
              </h2>

              <div className="space-y-5">
                <ProfileField
                  label="Nome Completo"
                  value={formData.nome}
                  isEditing={isEditing}
                  isRequired
                  placeholder="Digite seu nome completo"
                  onChange={(value) => handleInputChange('nome', value)}
                  data-test="perfil-campo-nome"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8" data-test="perfil-info-contato">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
                <Mail className="w-5 h-5 mr-2 text-global-accent" />
                Informações de Contato
              </h2>

              <div className="space-y-5">
                <ProfileField
                  label="E-mail"
                  value={user?.email || 'Não informado'}
                  isEditing={false}
                  isDisabled
                  helperText="Campo não editável"
                  data-test="perfil-campo-email"
                />

                <ProfileField
                  label="Celular"
                  value={formData.celular}
                  isEditing={isEditing}
                  isRequired
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  icon={<Phone className="w-4 h-4" />}
                  onChange={handleCelularChange}
                  data-test="perfil-campo-celular"
                />

                <ProfileField
                  label="CPF"
                  value={formatCPF(user?.cpf || '')}
                  isEditing={false}
                  isDisabled
                  helperText="Campo não editável"
                  data-test="perfil-campo-cpf"
                />

                <ProfileField
                  label="Data de Nascimento"
                  value={formatDate(getUserData(user as any, 'data_nascimento'))}
                  isEditing={false}
                  isDisabled
                  icon={<Calendar className="w-4 h-4" />}
                  helperText="Campo não editável"
                  data-test="perfil-campo-data-nascimento"
                />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Informações Profissionais, apenas se não for munícipe */}
            {!isMunicipe(user as any) && (
          <div className="bg-white rounded-2xl shadow-sm p-8" data-test="perfil-info-profissional">
            <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
              <Briefcase className="w-5 h-5 mr-2 text-global-accent" />
              Informações Profissionais
            </h2>

            <div className="space-y-5">
              <ProfileField
                label="Cargo"
                value={formData.cargo}
                isEditing={isEditing}
                placeholder="Digite seu cargo"
                onChange={(value) => handleInputChange('cargo', value)}
                data-test="perfil-campo-cargo"
              />

              <ProfileField
                label="Formação"
                value={formData.formacao}
                isEditing={isEditing}
                placeholder="Digite sua formação"
                onChange={(value) => handleInputChange('formacao', value)}
                data-test="perfil-campo-formacao"
              />
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-8" data-test="perfil-info-endereco">
          <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
            <MapPin className="w-5 h-5 mr-2 text-global-accent" />
            Endereço
          </h2>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <ProfileField
                label="CEP"
                value={formData.endereco.cep}
                isEditing={isEditing}
                placeholder="00000-000"
                maxLength={9}
                onChange={handleCepChange}
                data-test="perfil-campo-cep"
              />

              <ProfileField
                label="Número"
                value={formData.endereco.numero}
                isEditing={isEditing}
                placeholder="123"
                onChange={(value) => handleInputChange('endereco.numero', value)}
                data-test="perfil-campo-numero"
              />
            </div>

            <ProfileField
              label="Logradouro"
              value={formData.endereco.logradouro}
              isEditing={isEditing}
              placeholder="Rua, Avenida..."
              onChange={(value) => handleInputChange('endereco.logradouro', value)}
              data-test="perfil-campo-logradouro"
            />

            <ProfileField
              label="Complemento"
              value={formData.endereco.complemento}
              isEditing={isEditing}
              placeholder="Apto, Bloco..."
              onChange={(value) => handleInputChange('endereco.complemento', value)}
              data-test="perfil-campo-complemento"
            />

            <ProfileField
              label="Bairro"
              value={formData.endereco.bairro}
              isEditing={isEditing}
              placeholder="Nome do bairro"
              onChange={(value) => handleInputChange('endereco.bairro', value)}
              data-test="perfil-campo-bairro"
            />

            <div className="grid grid-cols-2 gap-4">
              <ProfileField
                label="Cidade"
                value={getUserEndereco(user as any, 'cidade')}
                isEditing={false}
                isDisabled
                data-test="perfil-campo-cidade"
              />

              <ProfileField
                label="Estado"
                value={getUserEndereco(user as any, 'estado')}
                isEditing={false}
                isDisabled
                data-test="perfil-campo-estado"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8" data-test="perfil-acoes">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            Ações da Conta
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleLogout}
              className="bg-red-600 text-white hover:bg-red-700"
              data-test="button-sair"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair da Conta
            </Button>
          </div>
        </div>
      </div>
    </div>
      </div>
    </div>
  );
}
