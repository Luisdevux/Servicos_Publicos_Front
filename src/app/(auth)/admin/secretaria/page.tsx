"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { secretariaService } from "@/services/secretariaService";
import type { Secretaria } from "@/types";
import { CreateSecretariaModal } from "@/components/createSecretariaModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function SecretariaAdminPage() {
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [pendingSearchText, setPendingSearchText] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedSecretaria, setSelectedSecretaria] = useState<Secretaria | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [secretariaToDelete, setSecretariaToDelete] = useState<Secretaria | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  const { data, isLoading, refetch } = useQuery({
    queryKey: ["secretarias", page, searchText],
    queryFn: async () => {
      const filters: Record<string, any> = {};
      if (searchText.trim()) {
        filters.nome = searchText.trim();
      }
      return secretariaService.buscarSecretarias(filters, 9, page);
    },
    placeholderData: (previousData) => previousData,
    staleTime: 60_000,
  });

  useEffect(() => {
    setPage(1);
  }, [searchText]);

  useEffect(() => {
    const id = setTimeout(() => {
      setSearchText(pendingSearchText);
    }, 300);
    return () => clearTimeout(id);
  }, [pendingSearchText]);

  const totalPages = data?.data?.totalPages ?? 1;
  const hasNextPage = data?.data?.hasNextPage ?? false;
  const hasPrevPage = data?.data?.hasPrevPage ?? false;
  const secretarias: Secretaria[] = data?.data?.docs ?? [];
  
  const secretariasFiltradas = searchText.trim() 
    ? secretarias.filter((s) => {
        const termo = searchText.trim().toLowerCase();
        return (
          s.nome?.toLowerCase().includes(termo) || 
          s.sigla?.toLowerCase().includes(termo)
        );
      })
    : secretarias;

  return (
    <div className="min-h-screen bg-[var(--global-bg)]">
      <div className="px-6 sm:px-6 py-6 md:py-8">
        <div className="mx-auto space-y-6">
          <div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
              <div className="relative flex gap-2 items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Pesquisar por nome ou sigla"
                    value={pendingSearchText}
                    onChange={(e) => setPendingSearchText(e.target.value)}
                    className="w-64 pl-9"
                  />
                </div>
              </div>
            
            <div>
              <Button
                className="bg-[var(--global-text-primary)] hover:bg-[var(--global-text-secondary)] text-white"
                onClick={() => setOpenCreate(true)}
              >
                <Plus className="h-4 w-4 mr-2" /> Adicionar secretaria
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sigla</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        Carregando secretarias...
                      </td>
                    </tr>
                  ) : secretariasFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        Nenhuma secretaria encontrada.
                      </td>
                    </tr>
                  ) : (
                    secretariasFiltradas.map((s) => (
                      <tr key={s._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{s.nome}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{s.sigla}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{s.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{s.telefone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{s.tipo}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSecretaria(s);
                              setOpenEdit(true);
                            }}
                            className="p-1 hover:bg-gray-100 rounded"
                            aria-label={`Editar ${s.nome}`}
                          >
                            <Pencil className="h-4 w-4 text-[var(--global-text-primary)]" />
                          </button>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => {
                              setSecretariaToDelete(s);
                              setOpenDelete(true);
                            }}
                            className="p-1 hover:bg-gray-100 rounded"
                            aria-label={`Excluir ${s.nome}`}
                          >
                            <Trash className="h-4 w-4 text-[var(--global-text-primary)]" />
                          </button>
                        </td>
                      </tr>
                    ))
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

      {openCreate && (
        <CreateSecretariaModal
          open={openCreate}
          onOpenChange={(open) => {
            setOpenCreate(open);
            if (!open) {
              refetch();
            }
          }}
        />
      )}

      {openEdit && (
        <CreateSecretariaModal
          open={openEdit}
          onOpenChange={(open) => {
            setOpenEdit(open);
            if (!open) {
              setSelectedSecretaria(null);
              refetch();
            }
          }}
          secretaria={selectedSecretaria}
        />
      )}
 
      <Dialog
        open={openDelete}
        onOpenChange={(open) => {
          if (!open && isDeleting) return;
          setOpenDelete(open);
          if (!open) setSecretariaToDelete(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center mb-2 flex flex-col items-center justify-center">
            <DialogTitle>Excluir secretaria</DialogTitle>
            <DialogDescription className="text-center mt-2 ">
              Você tem certeza que deseja excluir a secretaria{' '}
              <strong className="text-black">{secretariaToDelete?.nome ?? ''}</strong> ?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end">
            <Button
              className="border-2 border-[var(--global-border)] bg-white text-[var(--global-text-primary)] hover:bg-[var(--global-bg-select)]"
              onClick={() => setOpenDelete(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
              onClick={async () => {
                if (!secretariaToDelete?._id) return;
                setIsDeleting(true);
                try {
                  await secretariaService.deletarSecretaria(secretariaToDelete._id);
                  toast.success('Secretaria excluída com sucesso!');
                  setOpenDelete(false);
                  setSecretariaToDelete(null);
                  refetch();
                } catch (e) {
                  const message = e instanceof Error ? e.message : 'Erro ao excluir secretaria';
                  toast.error(message);
                } finally {
                  setIsDeleting(false);
                }
              }}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


