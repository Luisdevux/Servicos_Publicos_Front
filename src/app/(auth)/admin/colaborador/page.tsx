"use client";

import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usuarioService } from "@/services/usuarioService";
import type { Usuarios } from "@/types";
import { useEffect, useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateColaboradorModal } from "@/components/createColaboradorModal";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { ColaboradorDetailsModal } from "@/components/colaboradorDetailsModal";
import { toast } from "sonner";

export default function ColaboradorAdminPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pendingSearchText, setPendingSearchText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [nivelFilter, setNivelFilter] = useState<string>(""); 
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuarios | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState<Usuarios | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [usuarioDetails, setUsuarioDetails] = useState<Usuarios | null>(null);


  const { data, isLoading } = useQuery({
    queryKey: ["usuarios"],
    queryFn: async () => {
      let allDocs: Usuarios[] = [];
      let page = 1;
      let totalPages = 1;

      do {
        const res = await usuarioService.buscarUsuariosPaginado({}, 15, page);
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

  useEffect(() => {
    const id = setTimeout(() => {
      setSearchText(pendingSearchText);
    }, 300);
    return () => clearTimeout(id);
  }, [pendingSearchText]);

  const colaboradoresFiltrados = useMemo(() => {
    const termo = searchText.trim().toLowerCase();
    return colaboradores.filter((c) => {
      const byTexto = termo
        ? (c.nome?.toLowerCase().includes(termo) ||
           c.cpf?.toLowerCase().includes(termo) ||
           (c.portaria_nomeacao?.toLowerCase() ?? "").includes(termo))
        : true;

      const byNivel = nivelFilter === 'operador'
        ? !!c?.nivel_acesso?.operador
        : nivelFilter === 'secretario'
          ? !!c?.nivel_acesso?.secretario
          : nivelFilter === 'administrador'
            ? !!c?.nivel_acesso?.administrador
            : true; 

      const byStatus = statusFilter === 'ativo'
        ? c.ativo === true
        : statusFilter === 'inativo'
          ? c.ativo === false
          : true; 

      return byTexto && byNivel && byStatus;
    });
  }, [colaboradores, searchText, nivelFilter, statusFilter]);

  // Cálculos de paginação
  const ITENS_POR_PAGINA = 15;
  const totalPages = Math.ceil(colaboradoresFiltrados.length / ITENS_POR_PAGINA);
  const hasPrevPage = page > 1;
  const hasNextPage = page < totalPages;
  const paginatedColaboradores = colaboradoresFiltrados.slice(
    (page - 1) * ITENS_POR_PAGINA,
    page * ITENS_POR_PAGINA
  );

  return (
    <div className="min-h-screen bg-global-bg">
      <div className="px-6 sm:px-6 py-6 md:py-8">
        <div className="mx-auto space-y-6">
          <div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
            <div className="relative flex gap-3 items-center flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Pesquisar por nome, CPF ou portaria"
                  value={pendingSearchText}
                  onChange={(e) => setPendingSearchText(e.target.value)}
                  className="w-72 pl-9"
                />
              </div>
              <Select value={nivelFilter} onValueChange={setNivelFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Nível de acesso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="operador">Operador</SelectItem>
                  <SelectItem value="secretario">Secretário</SelectItem>
                  <SelectItem value="administrador">Administrador</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button
                className="bg-global-text-primary hover:bg-global-text-secondary text-white"
                onClick={() => setOpenCreate(true)}
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
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">CPF</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Portaria</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Cargo</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-8 text-center text-gray-500">Carregando colaboradores...</td>
                    </tr>
                  ) : colaboradoresFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-8 text-center text-gray-500">Nenhum colaborador encontrado.</td>
                    </tr>
                  ) : (
                    paginatedColaboradores.map((c) => {
                      const niveis: string[] = [];
                      if (c?.nivel_acesso?.secretario) niveis.push('Secretário');
                      if (c?.nivel_acesso?.operador) niveis.push('Operador');
                      if (c?.nivel_acesso?.administrador) niveis.push('Administrador');
                      return (
                        <tr
                          key={c._id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => { setUsuarioDetails(c); setOpenDetails(true); }}
                        >
                          <td className="px-3 md:px-6 py-3 whitespace-normal wrap-break-word text-sm text-gray-900">{c.nome}</td>
                          <td className="px-3 md:px-6 py-3 whitespace-normal wrap-break-word text-sm text-gray-900">{c.email}</td>
                          <td className="px-3 md:px-6 py-3 whitespace-normal wrap-break-word text-sm text-gray-900 hidden md:table-cell">{c.cpf}</td>
                          <td className="px-3 md:px-6 py-3 whitespace-normal wrap-break-word text-sm text-gray-900">{c.celular}</td>
                          <td className="px-3 md:px-6 py-3 whitespace-normal wrap-break-word text-sm text-gray-900 hidden md:table-cell">{c.portaria_nomeacao || '-'}</td>
                          <td className="px-3 md:px-6 py-3 whitespace-normal wrap-break-word text-sm text-gray-900 hidden md:table-cell">{c.cargo || '-'}</td>
                          <td className="px-3 md:px-6 py-3 whitespace-normal wrap-break-word text-sm text-gray-900">
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
                          <td className="px-3 md:px-6 py-3">
                            <button type="button" className="p-1 hover:bg-gray-100 rounded" onClick={(e) => { e.stopPropagation(); setSelectedUsuario(c); setOpenEdit(true); }}>
                              <Pencil className="h-4 w-4 text-global-text-primary" />
                            </button>
                          </td>
                          <td className="px-3 md:px-6 py-3">
                            <button
                              type="button"
                              className="p-1 hover:bg-gray-100 rounded"
                              onClick={(e) => { e.stopPropagation(); setUsuarioToDelete(c); setOpenDelete(true); }}
                            >
                              <Trash className="h-4 w-4 text-global-text-primary" />
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

        <div className="flex items-center gap-2 text-sm text-global-text-primary">
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
      <CreateColaboradorModal
        open={openCreate}
        onOpenChange={(open) => {
          setOpenCreate(open);
          if (!open) {
            // Lista usa queryKey ['usuarios'] e será recarregada quando necessário
          }
        }}
      />
      {openEdit && (
        <CreateColaboradorModal
          open={openEdit}
          onOpenChange={(open) => {
            setOpenEdit(open);
            if (!open) {
              setSelectedUsuario(null);
            }
          }}
          usuario={selectedUsuario}
        />
      )}

      <DeleteConfirmModal
        open={openDelete}
        onOpenChange={(open) => {
          setOpenDelete(open);
          if (!open) setUsuarioToDelete(null);
        }}
        onConfirm={async () => {
          if (!usuarioToDelete?._id) return;
          await usuarioService.deletarUsuario(usuarioToDelete._id);
          queryClient.setQueryData<Usuarios[] | undefined>(["usuarios"], (old) => {
            if (!old) return old;
            if (Array.isArray(old)) {
              return old.filter((u) => u._id !== usuarioToDelete._id);
            }
            return old;
          });
          toast.success('Colaborador excluído com sucesso!');
        }}
        title="Excluir colaborador"
        description="Você tem certeza que deseja excluir o colaborador"
        itemName={usuarioToDelete?.nome ?? ''}
      />

      <ColaboradorDetailsModal
        open={openDetails}
        onOpenChange={(open) => {
          setOpenDetails(open);
          if (!open) setUsuarioDetails(null);
        }}
        usuario={usuarioDetails}
      />
    </div>
  );
}

