"use client";

import { useState } from "react";
import Banner from "@/components/banner";
import { ChevronLeft, ChevronRight, ClipboardList, Filter } from "lucide-react";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import CardPedido, { Pedido } from "@/components/cardPedido";
import DetalhesDemandaModal from "@/components/detalheDemandaModal";

const pedidosMock: Pedido[] = [
  {
    id: "1",
    titulo: "Demanda sobre Limpeza Urbana",
    status: "aceito",
    descricao: "Tem restos de construção em frente a minha casa, preciso que coletem pois está atrapalhando a passagem.",
    imagem: ["/banner.png", "/banner.png"],
    endereco: {
      bairro: "Bela Vista",
      tipoLogradouro: "Avenida",
      logradouro: "Bela Vista",
      numero: "9999"
    },
    progresso: {
      aprovado: true,
      emProgresso: true,
      concluido: false,
    },
  },
  {
    id: "2",
    titulo: "Demanda sobre Coleta de Lixo",
    status: "aceito",
    descricao: "Lixeira da rua está quebrada há uma semana, precisamos de uma nova.",
    imagem: "/banner.png",
    endereco: {
      bairro: "Centro",
      tipoLogradouro: "Rua",
      logradouro: "São João",
      numero: "123"
    },
    progresso: {
      aprovado: true,
      emProgresso: true,
      concluido: false,
    },
  },
  {
    id: "3",
    titulo: "Demanda sobre Asfaltamento",
    status: "aceito",
    descricao: "A rua está com muitas crateras, dificultando a passagem de veículos. Várias fotos mostram o estado crítico da pavimentação.",
    imagem: ["/banner.png", "/banner.png", "/banner.png", "/banner.png"],
    endereco: {
      bairro: "Jardim América",
      tipoLogradouro: "Rua",
      logradouro: "das Flores",
      numero: "456"
    },
    progresso: {
      aprovado: true,
      emProgresso: true,
      concluido: false,
    },
  },
  {
    id: "4",
    titulo: "Demanda sobre Iluminação Pública",
    status: "aceito",
    descricao: "Lâmpada da rua queimou e está escuro à noite, causando insegurança.",
    imagem: ["/banner.png", "/banner.png", "/banner.png"],
    endereco: {
      bairro: "Bela Vista",
      tipoLogradouro: "Avenida",
      logradouro: "Bela Vista",
      numero: "9999"
    },
    progresso: {
      aprovado: true,
      emProgresso: true,
      concluido: true,
    },
    conclusao: {
      descricao: "No dia 17/10/2024 a troca de lâmpada foi feita pela empresa Energisa. O problema foi resolvido completamente.",
      imagem: ["/banner.png", "/banner.png", "/banner.png"],
      dataConclusao: "17/10/2024"
    }
  },
  {
    id: "5",
    titulo: "Demanda sobre Limpeza Urbana",
    status: "recusado",
    descricao: "Solicitação de limpeza em área particular não contemplada pelo serviço público.",
    endereco: {
      bairro: "Vila Nova",
      tipoLogradouro: "Rua",
      logradouro: "Particular",
      numero: "S/N"
    }
  },
  {
    id: "6",
    titulo: "Demanda sobre Pavimentação",
    status: "recusado",
    descricao: "Solicitação fora do cronograma de obras da prefeitura para este ano.",
    endereco: {
      bairro: "Zona Rural",
      tipoLogradouro: "Estrada",
      logradouro: "Rural",
      numero: "KM 5"
    }
  },
];

export default function MeusPedidosPage() {
  const [filtroSelecionado, setFiltroSelecionado] = useState("todos");
  const [pedidos, setPedidos] = useState(pedidosMock);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const ITENS_POR_PAGINA = 6;

  const handleFiltroChange = (value: string) => {
    setFiltroSelecionado(value);
    setPaginaAtual(1); 
  };

  const handlePaginaAnterior = () => {
    setPaginaAtual(paginaAtual - 1);
  };

  const handleProximaPagina = () => {
    setPaginaAtual(paginaAtual + 1);
  };

  const handleVerMais = (id: string) => {
    const pedido = pedidos.find(p => p.id === id);
    if (pedido) {
      setPedidoSelecionado(pedido);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPedidoSelecionado(null);
  };

  const pedidosFiltrados = pedidos.filter(pedido => {
    if (filtroSelecionado === "todos") {
      return true;
    }
    return pedido.status === filtroSelecionado;
  });

  const totalPaginas = Math.ceil(pedidosFiltrados.length / ITENS_POR_PAGINA);
  const indiceInicial = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const indiceFinal = indiceInicial + ITENS_POR_PAGINA;
  const pedidosPaginados = pedidosFiltrados.slice(indiceInicial, indiceFinal);

  return (
    <div className="min-h-screen bg-[var(--global-bg)]">
      <Banner
        icone={ClipboardList}
        titulo="Meus Pedidos"
        className="mb-6 md:mb-8"
      />

      <div className="px-6 sm:px-6 lg:px-40 py-6 md:py-8">
        <div className="mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-4">
              <Filter className="h-4 w-4 text-[var(--global-text-primary)]" />
              <span className="text-sm text-[var(--global-text-primary)]">Filtrar por:</span>
              <Select value={filtroSelecionado} onValueChange={handleFiltroChange}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Todos os pedidos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os pedidos</SelectItem>
                  <SelectItem value="aceito">Aceitos</SelectItem>
                  <SelectItem value="recusado">Recusados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {pedidosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16 mb-8">
              {pedidosPaginados.map((pedido) => (
                <CardPedido
                  key={pedido.id}
                  pedido={pedido}
                  onVerMais={handleVerMais}
                />
              ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-16 mb-8 py-12">
            <ClipboardList className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-[var(--global-text-primary)] mb-2">
              Nenhum pedido encontrado
            </h3>
            <p className="text-sm text-gray-500 text-center">
              {filtroSelecionado === "todos" 
                ? "Você ainda não possui pedidos registrados."
                : `Não há pedidos com status "${filtroSelecionado}".`
              }
            </p>
          </div>
        )}

        <div className="flex items-center justify-center gap-4">
            <button
              onClick={handlePaginaAnterior}
              disabled={paginaAtual === 1}
              className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-2 text-sm text-[var(--global-text-primary)]">
              <span>Página {paginaAtual} de {totalPaginas}</span>
            </div>
            
            <button
              onClick={handleProximaPagina}
              disabled={paginaAtual === totalPaginas}
              className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

      </div>

      <DetalhesDemandaModal
        pedido={pedidoSelecionado}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
