"use client";

import { useMemo } from 'react';
import type { BairroSelecionado } from './MapBairrosDemandasClient';
import type { Demanda, TipoDemanda } from '@/types/demanda';
import { TIPOS_DEMANDA } from '@/types/demanda';
import { normalizeBairroNome, coordenadasParaSVGPath } from '@/lib/kmlParser';

interface BairroInfoCardProps {
  bairroSelecionado: BairroSelecionado | null;
  demandas: Demanda[];
}

interface DemandaPorTipo {
  tipo: TipoDemanda;
  quantidade: number;
}

export default function BairroInfoCard({ bairroSelecionado, demandas }: BairroInfoCardProps) {
  // calcula demandas por tipo para o bairro selecionado
  const demandasPorTipo = useMemo((): DemandaPorTipo[] => {
    if (!bairroSelecionado || demandas.length === 0) {
      return [];
    }

    const nomeBairroNormalizado = normalizeBairroNome(bairroSelecionado.nome);
    
    const demandasDoBairro = demandas.filter(demanda => {
      const bairroDemanda = demanda.endereco?.bairro || '';
      return normalizeBairroNome(bairroDemanda) === nomeBairroNormalizado;
    });

    const tiposMap: Record<string, number> = {};
    demandasDoBairro.forEach(demanda => {
      const tipo = demanda.tipo || 'Outros';
      tiposMap[tipo] = (tiposMap[tipo] || 0) + 1;
    });

    // retorna todos os tipos de demanda
    return TIPOS_DEMANDA.map(tipo => ({
      tipo,
      quantidade: tiposMap[tipo] || 0
    }));
  }, [bairroSelecionado, demandas]);

  if (!bairroSelecionado) {
    return null;
  }

  return (
    <div className="w-full h-full bg-gray-50 rounded-md p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
      <h3 className="text-lg font-bold text-gray-800">{bairroSelecionado.nome}</h3>
      
      <div className="grid grid-cols-2 gap-6 flex-1 w-full items-center">
        <div className="flex justify-center items-center">
          <svg
            width="380"
            height="380"
            viewBox="0 0 120 120"
            className="rounded"
          >
            <path
              d={coordenadasParaSVGPath(bairroSelecionado.coordenadas, 120, 120)}
              fill={bairroSelecionado.cor}
              stroke={bairroSelecionado.cor}
              strokeWidth="1"
              opacity="1"
            />
          </svg>
        </div>

        <div className="flex flex-col gap-3 justify-center">
          {demandasPorTipo.map((item) => (
            <div key={item.tipo} className="flex justify-evenly gap-3 items-center">
              <span className="text-md text-gray-500 text-center flex-1">{item.tipo}</span>
              <span className="text-md font-bold text-gray-800 text-center flex-1">
                {item.quantidade} {item.quantidade === 1 ? 'Demanda' : 'Demandas'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

