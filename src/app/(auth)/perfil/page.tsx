// src/app/(auth)/perfil/page.tsx

'use client';

import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ProfilePhotoUpload } from '@/components/ProfilePhotoUpload';
import { useAuth } from '@/hooks/useAuth';
import { useProfileUpdate } from '@/hooks/useProfileUpdate';
import { useUserProfile } from '@/hooks/useUserProfile';
import { viaCepService } from '@/services/viaCepService';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Edit2, X, Save, LogOut, Loader2, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import type { UpdateUsuariosData } from '@/types';

export default function PerfilPage() {
  const { isAuthenticated, user: sessionUser, isLoading: isAuthLoading, logout } = useAuth();
  const router = useRouter();
  
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
    isUpdating,
    isUploadingPhoto,
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
  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome || '',
        celular: user.celular || '',
        nome_social: ('nome_social' in user ? user.nome_social : '') || '',
        cargo: ('cargo' in user ? user.cargo : '') || '',
        formacao: ('formacao' in user ? user.formacao : '') || '',
        endereco: {
          logradouro: ('endereco' in user ? user.endereco?.logradouro : '') || '',
          cep: ('endereco' in user ? user.endereco?.cep : '') || '',
          bairro: ('endereco' in user ? user.endereco?.bairro : '') || '',
          numero: ('endereco' in user ? user.endereco?.numero?.toString() : '') || '',
          complemento: ('endereco' in user ? user.endereco?.complemento : '') || '',
          cidade: ('endereco' in user ? user.endereco?.cidade : '') || '',
          estado: ('endereco' in user ? user.endereco?.estado : '') || '',
        },
      });
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
    // Formata o CEP com máscara
    const cepLimpo = cep.replace(/\D/g, '');
    let cepFormatado = cepLimpo;
    
    if (cepLimpo.length > 5) {
      cepFormatado = `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5, 8)}`;
    }
    
    // Atualiza o CEP no formulário
    handleInputChange('endereco.cep', cepFormatado);

    // Se o CEP tiver 8 dígitos, busca o endereço
    if (cepLimpo.length === 8) {
      toast.loading('Buscando endereço...', { id: 'cep-loading' });
      
      const endereco = await viaCepService.buscarEnderecoPorCep(cepLimpo);
      
      toast.dismiss('cep-loading');
      
      if (endereco) {
        setFormData((prev) => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            cep: viaCepService.formatarCep(cep),
            logradouro: endereco.logradouro || prev.endereco.logradouro,
            bairro: endereco.bairro || prev.endereco.bairro,
            cidade: endereco.localidade || prev.endereco.cidade,
            estado: endereco.uf || prev.endereco.estado,
          },
        }));
        toast.success('Endereço encontrado!');
      } else {
        toast.error('CEP não encontrado');
      }
    }
  };

  const handleCelularChange = (celular: string) => {
    // Formata o celular com máscara
    const celularLimpo = celular.replace(/\D/g, '');
    let celularFormatado = celularLimpo;
    
    if (celularLimpo.length > 10) {
      // Formato: (00) 00000-0000
      celularFormatado = `(${celularLimpo.slice(0, 2)}) ${celularLimpo.slice(2, 7)}-${celularLimpo.slice(7, 11)}`;
    } else if (celularLimpo.length > 6) {
      // Formato: (00) 0000-0000
      celularFormatado = `(${celularLimpo.slice(0, 2)}) ${celularLimpo.slice(2, 6)}-${celularLimpo.slice(6, 10)}`;
    } else if (celularLimpo.length > 2) {
      celularFormatado = `(${celularLimpo.slice(0, 2)}) ${celularLimpo.slice(2)}`;
    } else if (celularLimpo.length > 0) {
      celularFormatado = `(${celularLimpo}`;
    }
    
    handleInputChange('celular', celularFormatado);
  };

  const handleSave = async () => {
    // Validações básicas
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    
    // Remove máscara do celular para validação
    const celularLimpo = formData.celular.replace(/\D/g, '');
    
    if (!celularLimpo) {
      toast.error('Celular é obrigatório');
      return;
    }
    
    // Valida formato do celular (deve ter 10 ou 11 dígitos)
    if (celularLimpo.length < 10 || celularLimpo.length > 11) {
      toast.error('Celular deve ter 10 ou 11 dígitos');
      return;
    }

    try {
      const updateData: UpdateUsuariosData = {
        nome: formData.nome,
        celular: celularLimpo,
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
      // A invalidação do cache no hook vai recarregar automaticamente os dados
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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const getUserType = () => {
    if (!user || !('nivel_acesso' in user)) return 'Não informado';
    if (user.nivel_acesso?.administrador) return 'Administrador';
    if (user.nivel_acesso?.secretario) return 'Secretário';
    if (user.nivel_acesso?.operador) return 'Operador';
    if (user.nivel_acesso?.municipe) return 'Munícipe';
    return 'Não informado';
  };

  const formatDate = (date: any) => {
    if (!date || date === 'Não informado') return 'Não informado';
    
    try {
      // Se já está em formato brasileiro (DD/MM/YYYY), retorna direto
      if (typeof date === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
        return date;
      }
      
      // Se está em formato ISO ou timestamp, converte
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Não informado';
      }
      
      return dateObj.toLocaleDateString('pt-BR');
    } catch {
      return 'Não informado';
    }
  };

  // Helper para acessar propriedades do usuário com segurança
  const getUserData = (field: string): string | null => {
    if (!user) return field === 'link_imagem' ? null : 'Não informado';
    if (field in user) {
      const value = (user as any)[field];
      if (field === 'link_imagem') {
        return value || null; // Retorna null se não houver imagem
      }
      return value || 'Não informado';
    }
    return field === 'link_imagem' ? null : 'Não informado';
  };

  const getUserEndereco = (field: string): string | number => {
    if (!user || !('endereco' in user) || !user.endereco) return field === 'numero' ? 0 : 'Não informado';
    const value = (user.endereco as any)[field];
    return value || (field === 'numero' ? 0 : 'Não informado');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" data-test="loading-perfil">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto animate-spin profile-accent" />
          <p className="mt-4 profile-text-primary">Carregando perfil...</p>
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
          <div className="h-30 relative profile-header-bg">
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
                currentPhotoUrl={getUserData('link_imagem')}
                onUpload={handlePhotoUpload}
                isUploading={isUploadingPhoto}
                userName={user?.nome}
              />
              
              <div className="flex-1 text-center sm:text-left mt-20">
                <h1 className="text-3xl font-bold profile-text-secondary" data-test="perfil-titulo">
                  {user.nome}
                </h1>
                <p className="mt-2 profile-text-primary text-lg">{getUserType()}</p>
              </div>

              <div className="flex gap-3">
                {!isEditing ? (
                  <Button
                    onClick={toggleEdit}
                    className="profile-btn-primary text-white"
                    data-test="button-editar-perfil"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={cancelEdit}
                      className="border-2 profile-border bg-white profile-text-primary hover:bg-gray-50"
                      data-test="button-cancelar-edicao"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isUpdating}
                      className="profile-btn-success text-white"
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
              <h2 className="text-xl font-semibold mb-6 flex items-center profile-text-secondary">
                <User className="w-5 h-5 mr-2 profile-accent" />
                Informações Pessoais
              </h2>

              <div className="space-y-5">
                <div data-test="perfil-campo-nome">
                  <Label className="text-sm font-medium text-gray-700 mb-2">
                    Nome Completo {isEditing && <span className="text-red-500">*</span>}
                  </Label>
                  {isEditing ? (
                    <Input
                      value={formData.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      className="mt-1"
                      placeholder="Digite seu nome completo"
                      required
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900">{user?.nome || 'Não informado'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8" data-test="perfil-info-contato">
              <h2 className="text-xl font-semibold mb-6 flex items-center profile-text-secondary">
                <Mail className="w-5 h-5 mr-2 profile-accent" />
                Informações de Contato
              </h2>

              <div className="space-y-5">
                <div data-test="perfil-campo-email">
                  <Label className="text-sm font-medium text-gray-700 mb-2">E-mail</Label>
                  <div className="p-3 bg-gray-100 rounded-lg border border-gray-200">
                    <p className="text-gray-600">{user?.email || 'Não informado'}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Campo não editável</p>
                </div>

                <div data-test="perfil-campo-celular">
                  <Label className="text-sm font-medium text-gray-700 mb-2">
                    Celular {isEditing && <span className="text-red-500">*</span>}
                  </Label>
                  {isEditing ? (
                    <Input
                      value={formData.celular}
                      onChange={(e) => handleCelularChange(e.target.value)}
                      className="mt-1"
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                      required
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <p className="text-gray-900">{user?.celular || 'Não informado'}</p>
                    </div>
                  )}
                </div>

            <div data-test="perfil-campo-cpf">
              <Label className="text-sm font-medium text-gray-700 mb-2">CPF</Label>
              <div className="p-3 bg-gray-100 rounded-lg border border-gray-200">
                <p className="text-gray-600">{user?.cpf || 'Não informado'}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">Campo não editável</p>
            </div>

            <div data-test="perfil-campo-data-nascimento">
              <Label className="text-sm font-medium text-gray-700 mb-2">Data de Nascimento</Label>
              <div className="p-3 bg-gray-100 rounded-lg border border-gray-200 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <p className="text-gray-600">{formatDate(getUserData('data_nascimento'))}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">Campo não editável</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">

        {!user.nivel_acesso?.municipe && (
          <div className="bg-white rounded-2xl shadow-sm p-8" data-test="perfil-info-profissional">
            <h2 className="text-xl font-semibold mb-6 profile-text-secondary">
              Informações Profissionais
            </h2>

            <div className="space-y-5">
              <div data-test="perfil-campo-cargo">
                <Label className="text-sm font-medium text-gray-700 mb-2">Cargo</Label>
                {isEditing ? (
                  <Input
                    value={formData.cargo}
                    onChange={(e) => handleInputChange('cargo', e.target.value)}
                    className="mt-1"
                    placeholder="Digite seu cargo"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-900">{getUserData('cargo')}</p>
                  </div>
                )}
              </div>

              <div data-test="perfil-campo-formacao">
                <Label className="text-sm font-medium text-gray-700 mb-2">Formação</Label>
                {isEditing ? (
                  <Input
                    value={formData.formacao}
                    onChange={(e) => handleInputChange('formacao', e.target.value)}
                    className="mt-1"
                    placeholder="Digite sua formação"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-900">{getUserData('formacao')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-8" data-test="perfil-info-endereco">
          <h2 className="text-xl font-semibold mb-6 flex items-center profile-text-secondary">
            <MapPin className="w-5 h-5 mr-2 profile-accent" />
            Endereço
          </h2>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div data-test="perfil-campo-cep">
                <Label className="text-sm font-medium text-gray-700 mb-2">CEP</Label>
                {isEditing ? (
                  <Input
                    value={formData.endereco.cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    className="mt-1"
                    placeholder="00000-000"
                    maxLength={9}
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-900">{getUserEndereco('cep')}</p>
                  </div>
                )}
              </div>

              <div data-test="perfil-campo-numero">
                <Label className="text-sm font-medium text-gray-700 mb-2">Número</Label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={formData.endereco.numero}
                    onChange={(e) => handleInputChange('endereco.numero', e.target.value)}
                    className="mt-1"
                    placeholder="123"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-900">{getUserEndereco('numero')}</p>
                  </div>
                )}
              </div>
            </div>

            <div data-test="perfil-campo-logradouro">
              <Label className="text-sm font-medium text-gray-700 mb-2">Logradouro</Label>
              {isEditing ? (
                <Input
                  value={formData.endereco.logradouro}
                  onChange={(e) => handleInputChange('endereco.logradouro', e.target.value)}
                  className="mt-1"
                  placeholder="Rua, Avenida..."
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{getUserEndereco('logradouro')}</p>
                </div>
              )}
            </div>

            <div data-test="perfil-campo-complemento">
              <Label className="text-sm font-medium text-gray-700 mb-2">Complemento</Label>
              {isEditing ? (
                <Input
                  value={formData.endereco.complemento}
                  onChange={(e) => handleInputChange('endereco.complemento', e.target.value)}
                  className="mt-1"
                  placeholder="Apto, Bloco..."
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{getUserEndereco('complemento')}</p>
                </div>
              )}
            </div>

            <div data-test="perfil-campo-bairro">
              <Label className="text-sm font-medium text-gray-700 mb-2">Bairro</Label>
              {isEditing ? (
                <Input
                  value={formData.endereco.bairro}
                  onChange={(e) => handleInputChange('endereco.bairro', e.target.value)}
                  className="mt-1"
                  placeholder="Nome do bairro"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{getUserEndereco('bairro')}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div data-test="perfil-campo-cidade">
                <Label className="text-sm font-medium text-gray-700 mb-2">Cidade</Label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{getUserEndereco('cidade')}</p>
                </div>
              </div>

              <div data-test="perfil-campo-estado">
                <Label className="text-sm font-medium text-gray-700 mb-2">Estado</Label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{getUserEndereco('estado')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8" data-test="perfil-acoes">
          <h2 className="text-xl font-semibold mb-6 profile-text-secondary">
            Ações da Conta
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleLogout}
              className="profile-btn-danger text-white"
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
