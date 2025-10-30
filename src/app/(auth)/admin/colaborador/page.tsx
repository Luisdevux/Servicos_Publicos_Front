"use client";

import { ChevronLeft, ChevronRight, Pencil, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { usuarioService } from "@/services/usuarioService";
import type { Usuarios } from "@/types";
import { useState } from "react";

export default function ColaboradorAdminPage() {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["usuarios"],
    queryFn: async () => {
      let allDocs: Usuarios[] = [];
      let page = 1;
      let totalPages = 1;

      do {
        const res = await usuarioService.buscarUsuariosPaginado({}, 50, page);
        const payload = res.data;
        if (payload?.docs?.length) {
          allDocs = allDocs.concat(payload.docs);
        }
        totalPages = payload?.totalPages || 1;
        page++;
      } while (page <= totalPages);

      return allDocs;
    },
    placeholderData: (previousData) => previousData,
    staleTime: 60_000,
  });

  const usuarios: Usuarios[] = Array.isArray(data) ? (data as Usuarios[]) : [];
  const colaboradores = usuarios.filter((u) =>
    u?.nivel_acesso?.operador || u?.nivel_acesso?.secretario || u?.nivel_acesso?.administrador
  );
  return (
    <div className="min-h-screen bg-[var(--global-bg)]">
      <div className="px-6 sm:px-6 py-6 md:py-8">
        <div className="mx-auto space-y-6">
          <div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
            <div>
              <Button
                className="bg-[var(--global-text-primary)] hover:bg-[var(--global-text-secondary)] text-white"
              >
                <Plus className="h-4 w-4 mr-2" /> Adicionar colaborador
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Portaria</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nível de acesso</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-8 text-center text-gray-500">Carregando colaboradores...</td>
                    </tr>
                  ) : colaboradores.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-8 text-center text-gray-500">Nenhum colaborador encontrado.</td>
                    </tr>
                  ) : (
                    colaboradores.map((c) => {
                      const niveis: string[] = [];
                      if (c?.nivel_acesso?.secretario) niveis.push('Secretário');
                      if (c?.nivel_acesso?.operador) niveis.push('Operador');
                      if (c?.nivel_acesso?.administrador) niveis.push('Administrador');
                      return (
                        <tr key={c._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.nome}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.cpf}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.celular}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.portaria_nomeacao || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.cargo || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{niveis.join(' / ')}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {c.ativo ? (
                              <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-2.5 py-0.5 text-xs font-medium">
                                Ativo
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-gray-200 text-gray-700 px-2.5 py-0.5 text-xs font-medium">
                                Inativo
                              </span>
                            )}
                          </td>
                          <td>
                            <button type="button" className="p-1 hover:bg-gray-100 rounded">
                              <Pencil className="h-4 w-4 text-[var(--global-text-primary)]" />
                            </button>
                          </td>
                          <td>
                            <button type="button" className="p-1 hover:bg-gray-100 rounded">
                              <Trash className="h-4 w-4 text-[var(--global-text-primary)]" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 p-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={!hasPrevPage}
          className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-2 text-sm text-[var(--global-text-primary)]">
          <span>Página {Math.min(page, totalPages)} de {totalPages}</span>
        </div>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!hasNextPage}
          className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>

    
  );
}

