// src/lib/demandaUtils.ts

import type { Demanda, Pedido, StatusDemanda } from "@/types/demanda";

/**
 * Mapeia o status da API para o tipo StatusDemanda
 */
const STATUS_MAPPING: Record<string, StatusDemanda> = {
  "Em aberto": "Em aberto",
  "Em andamento": "Em andamento", 
  "Concluída": "Concluída",
  "Recusada": "Recusada"
};

/**
 * Transforma um objeto Demanda da API em um objeto Pedido para exibição
 */
export function transformarDemandaParaPedido(demanda: Demanda): Pedido {
  const statusMapeado = STATUS_MAPPING[demanda.status] || "Em aberto";

  return {
    id: demanda._id,
    titulo: `Demanda sobre ${demanda.tipo}`,
    status: statusMapeado,
    descricao: demanda.descricao,
    link_imagem: demanda.link_imagem 
      ? (Array.isArray(demanda.link_imagem) 
          ? demanda.link_imagem 
          : [demanda.link_imagem])
      : undefined,
    link_imagem_resolucao: demanda.link_imagem_resolucao 
      ? (Array.isArray(demanda.link_imagem_resolucao) 
          ? demanda.link_imagem_resolucao 
          : [demanda.link_imagem_resolucao])
      : undefined,
    endereco: demanda.endereco ? {
      bairro: demanda.endereco.bairro || "",
      logradouro: demanda.endereco.logradouro || "",
      numero: String(demanda.endereco.numero) || "",
      cep: demanda.endereco.cep || "",
      complemento: demanda.endereco.complemento || "",
    } : undefined,
    progresso: {
      aprovado: true,
      emProgresso: statusMapeado === "Em andamento" || statusMapeado === "Concluída",
      concluido: statusMapeado === "Concluída" 
    },
    conclusao: statusMapeado === "Concluída" && demanda.resolucao ? {
      descricao: demanda.resolucao,
      imagem: demanda.link_imagem_resolucao 
        ? (Array.isArray(demanda.link_imagem_resolucao) 
            ? demanda.link_imagem_resolucao 
            : [demanda.link_imagem_resolucao])
        : undefined,
      dataConclusao: demanda.updatedAt ? new Date(demanda.updatedAt).toLocaleDateString('pt-BR') : ""
    } : undefined,
    avaliacao: statusMapeado === "Concluída" && demanda.feedback && demanda.avaliacao_resolucao ? {
      feedback: demanda.feedback,
      avaliacao_resolucao: demanda.avaliacao_resolucao
    } : undefined
  };
}

/**
 * Retorna os status de filtro baseado na seleção do usuário
 */
export function obterStatusPorFiltro(filtro: string): string[] | undefined {
  const FILTROS_STATUS: Record<string, string[] | undefined> = {
    todos: undefined,
    aceito: ["Em andamento"],
    concluida: ["Concluída"],
    recusado: ["Recusada"],
    aguardando: ["Em aberto"]
  };

  // Retorna undefined se não encontrar o filtro ou se for explicitamente undefined
  return FILTROS_STATUS[filtro];
}

/**
 * Interface para parâmetros de busca de demandas
 */
export interface BuscarDemandasParams {
  page: number;
  limit?: number;
  status?: string;
}

/**
 * Retorna o texto de descrição do filtro baseado na quantidade
 */
export function obterTextoFiltro(
  total: number,
  filtroSelecionado: string
): string {
  const quantidade = `${total} ${total === 1 ? 'pedido' : 'pedidos'}`;
  const sufixo = filtroSelecionado === 'todos' ? 'no total' : 'encontrado(s)';
  return `${quantidade} ${sufixo}`;
}
