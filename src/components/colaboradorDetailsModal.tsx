'use client';

import type { Usuarios } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ColaboradorDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: Usuarios | null;
}

export function ColaboradorDetailsModal({ open, onOpenChange, usuario }: ColaboradorDetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={(openState) => {
      onOpenChange(openState);
    }}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-hidden p-0 bg-white border-none shadow-2xl">
      <DialogHeader className="bg-global-accent py-6 px-6 rounded-t-lg relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="dialog-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                    <circle cx="30" cy="30" r="2" fill="white" />
                    <circle cx="0" cy="0" r="1" fill="white" />
                    <circle cx="60" cy="0" r="1" fill="white" />
                    <circle cx="0" cy="60" r="1" fill="white" />
                    <circle cx="60" cy="60" r="1" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dialog-grid)" />
              </svg>
            </div>
  
            <div className="absolute top-4 left-8 w-12 h-12 border-2 border-white/20 rounded-lg rotate-12"></div>
            <div className="absolute bottom-4 right-8 w-10 h-10 border-2 border-white/20 rounded-full"></div>
            <DialogTitle className="text-2xl font-bold text-center text-white">Detalhes do colaborador</DialogTitle>
      </DialogHeader>
        {usuario && (
          <div className="px-6 pb-6 max-h-[calc(95vh-140px)] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Nome</div>
              <div className="font-medium">{usuario.nome}</div>
            </div>
            <div>
              <div className="text-gray-500">Email</div>
              <div className="font-medium break-words">{usuario.email}</div>
            </div>
            <div>
              <div className="text-gray-500">CPF</div>
              <div className="font-medium">{usuario.cpf}</div>
            </div>
            <div>
              <div className="text-gray-500">Celular</div>
              <div className="font-medium">{usuario.celular}</div>
            </div>
            <div>
              <div className="text-gray-500">Cargo</div>
              <div className="font-medium">{usuario.cargo || '-'}</div>
            </div>
            <div>
              <div className="text-gray-500">Portaria</div>
              <div className="font-medium">{usuario.portaria_nomeacao || '-'}</div>
            </div>
            <div>
              <div className="text-gray-500">Secretarias</div>
              <div className="font-medium">
                {Array.isArray(usuario.secretarias) && usuario.secretarias.length > 0 ? (
                  usuario.secretarias.map((s) => s).filter(Boolean).join(', ')
                ) : '-'}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Nível de acesso</div>
              <div className="font-medium">
                {usuario.nivel_acesso?.administrador ? 'Administrador' : ''}
                {usuario.nivel_acesso?.secretario ? (usuario.nivel_acesso?.administrador ? ' / Secretário' : 'Secretário') : ''}
                {usuario.nivel_acesso?.operador ? ((usuario.nivel_acesso?.administrador || usuario.nivel_acesso?.secretario) ? ' / Operador' : 'Operador') : ''}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Endereço</div>
              <div className="font-medium break-words">
                {usuario.endereco ? (
                  <>
                    {usuario.endereco.logradouro}, {usuario.endereco.numero}
                    {usuario.endereco.complemento ? `, ${usuario.endereco.complemento}` : ''} - {usuario.endereco.bairro}
                    <br />{usuario.endereco.cidade}/{usuario.endereco.estado} - CEP {usuario.endereco.cep}
                  </>
                ) : '-'}
              </div>
            </div>
            
            <div>
              <div className="text-gray-500">Status</div>
              <div className="font-medium">
                {usuario.ativo ? (
                  <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-2.5 py-0.5 text-xs font-medium">
                    Ativo
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-gray-200 text-gray-700 px-2.5 py-0.5 text-xs font-medium">
                    Inativo
                  </span>
                )}
              </div>
            </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


