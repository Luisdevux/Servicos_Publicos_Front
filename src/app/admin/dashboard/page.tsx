"use client";
import { MetricCard } from "@/components/MetricCard";
import { ChartCard } from "@/components/ChartCard";
import { 
  FolderKanban, 
  Users, 
  IdCardLanyard, 
  Building2 
} from "lucide-react";

const metricas = [
  {
    id: 1,
    title: "Demandas",
    value: "7,265",
    icon: <FolderKanban className="h-6 w-6" />
  },
  {
    id: 2,
    title: "Novos Colaboradores",
    value: "3,671",
    icon: <Users className="h-6 w-6" />
  },
  {
    id: 3,
    title: "Novos Operadores",
    value: "156",
    icon: <IdCardLanyard className="h-6 w-6" />
  },
  {
    id: 4,
    title: "Novas Empresas Terceirizadas",
    value: "28",
    icon: <Building2 className="h-6 w-6" />
  }
]

const dadosDemandas = [
  { categoria: "Coleta", quantidade: 18, cor: "#8b5cf6" },
  { categoria: "Iluminação", quantidade: 29, cor: "#94E9B8" },
  { categoria: "Animais", quantidade: 22, cor: "#000000" },
  { categoria: "Árvores", quantidade: 31, cor: "#3b82f6" },
  { categoria: "Pavimentação", quantidade: 14, cor: "#9F9FF8" },
  { categoria: "Saneamento", quantidade: 26, cor: "#10b981" }
]

export default function DashboardPage() {
  return (
    <div className="space-y-6 pt-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ">
        {metricas.map((metrica) => (
          <MetricCard 
            key={metrica.id} 
            title={metrica.title} 
            value={metrica.value} 
            icon={metrica.icon} 
          />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard 
          title="Quantidade de demandas solicitadas"
          data={dadosDemandas}
          colors={dadosDemandas.map((item) => item.cor)}
        />
      </div>
    </div>
  );
}

