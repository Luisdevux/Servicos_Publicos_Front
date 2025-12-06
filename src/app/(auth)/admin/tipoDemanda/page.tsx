"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { tipoDemandaService } from "@/services/tipoDemandaService";
import type { TipoDemandaModel } from "@/types";
import { TIPOS_DEMANDA } from "@/types";
import { CreateTipoDemandaModal } from "@/components/createTipoDemandaModal";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { toast } from "sonner";

export default function TipoDemandaAdminPage() {
  const [page, setPage] = useState(1);
  const [openCreate, setOpenCreate] = useState(false);
  const [tipoDemandaEditando, setTipoDemandaEditando] = useState<TipoDemandaModel | null>(null);
  const [searchTitulo, setSearchTitulo] = useState("");
  const [pendingSearchTitulo, setPendingSearchTitulo] = useState("");
  const [selectedTipo, setSelectedTipo] = useState<string>("");
  const [openDelete, setOpenDelete] = useState(false);
  const [tipoDemandaToDelete, setTipoDemandaToDelete] = useState<TipoDemandaModel | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["tipoDemanda", page, searchTitulo, selectedTipo],
    queryFn: async () => {
      const filters: Record<string, string> = {};
      if (searchTitulo.trim()) {
        filters.titulo = searchTitulo.trim();
      }
      if (selectedTipo && selectedTipo !== "all") {
        filters.tipo = selectedTipo;
      }
      return tipoDemandaService.buscarTiposDemandaPorTipo(filters, 12, page);
    },
    placeholderData: (previousData) => previousData,
    staleTime: 60_000,
  });

  useEffect(() => {
    setPage(1);
  }, [searchTitulo, selectedTipo]);

  useEffect(() => {
    const id = setTimeout(() => {
      setSearchTitulo(pendingSearchTitulo);
    }, 300);
    return () => clearTimeout(id);
  }, [pendingSearchTitulo]);

  const totalPages = data?.data?.totalPages ?? 1;
  const hasNextPage = data?.data?.hasNextPage ?? false;
  const hasPrevPage = data?.data?.hasPrevPage ?? false;
  const tiposDemanda: TipoDemandaModel[] = data?.data?.docs ?? [];

  return (
    <div className="min-h-screen bg-global-bg">
      <div className="px-6 sm:px-6 py-6 md:py-8">
        <div className="mx-auto space-y-6">
          <div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
            <div className="relative flex gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Pesquisar por título"
                  value={pendingSearchTitulo}
                  onChange={(e) => setPendingSearchTitulo(e.target.value)}
                  className="w-64 pl-9"
                  data-test="input-titulo"
                />
              </div>
              <Select value={selectedTipo || "all"} onValueChange={(value) => setSelectedTipo(value === "all" ? "" : value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {TIPOS_DEMANDA.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Button
                className="bg-global-text-primary hover:bg-global-text-secondary text-white"
                onClick={() => setOpenCreate(true)}
                data-test="button-adicionar-tipo-demanda"
              >
                <Plus className="h-4 w-4 mr-2" /> Adicionar tipo de demanda
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        Carregando tipos de demanda...
                      </td>
                    </tr>
                  ) : tiposDemanda.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        Nenhum tipo de demanda encontrado.
                      </td>
                    </tr>
                  ) : (
                    tiposDemanda.map((tipoDemanda) => (
                      <tr key={tipoDemanda._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tipoDemanda.titulo}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">{tipoDemanda.descricao}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tipoDemanda.tipo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setTipoDemandaEditando(tipoDemanda)}
                              className="p-1.5 hover:bg-gray-100 rounded cursor-pointer"
                              aria-label={`Editar ${tipoDemanda.titulo}`}
                            >
                              <Pencil className="h-4 w-4 text-global-text-primary" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setTipoDemandaToDelete(tipoDemanda);
                                setOpenDelete(true);
                              }}
                              className="p-1.5 hover:bg-red-50 rounded cursor-pointer"
                              aria-label={`Excluir ${tipoDemanda.titulo}`}
                            >
                              <Trash className="h-4 w-4 text-red-600" />
                            </button>
                          </div>
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

      {openCreate && (
        <CreateTipoDemandaModal
          open={openCreate}
          onOpenChange={(open) => {
            setOpenCreate(open);
            if (!open) {
              refetch();
            }
          }}
        />
      )}

      {tipoDemandaEditando && (
        <CreateTipoDemandaModal
          open={!!tipoDemandaEditando}
          tipoDemanda={tipoDemandaEditando}
          onOpenChange={(open) => {
            if (!open) {
              setTipoDemandaEditando(null);
              refetch();
            }
          }}
        />
      )}

      <DeleteConfirmModal
        open={openDelete}
        onOpenChange={(open) => {
          setOpenDelete(open);
          if (!open) setTipoDemandaToDelete(null);
        }}
        onConfirm={async () => {
          if (!tipoDemandaToDelete?._id) return;
          
          if (tipoDemandaToDelete.link_imagem) {
            try {
              await tipoDemandaService.deletarFotoTipoDemanda(tipoDemandaToDelete._id);
            } catch (error) {
              console.warn('Erro ao deletar foto, continuando com exclusão do tipo de demanda:', error);
            }
          }

          await tipoDemandaService.deletarTipoDemanda(tipoDemandaToDelete._id);
          toast.success('Tipo de demanda excluído com sucesso!');
          refetch();
        }}
        title="Excluir tipo de demanda"
        description="Você tem certeza que deseja excluir o tipo de demanda"
        itemName={tipoDemandaToDelete?.titulo ?? ''}
      />
    </div>
  );
}


