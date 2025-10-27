
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface DonutChartData {
  categoria: string;
  quantidade: number;
  cor: string;
}

interface DonutChartCardProps {
  title: string;
  data: DonutChartData[];
}

export function DonutChartCard({ title, data }: DonutChartCardProps) {
  const totalDemandas = data.reduce((sum, item) => sum + item.quantidade, 0);
  
  const dataComPorcentagem = data.map(item => ({
    ...item,
    porcentagem: Math.round((item.quantidade / totalDemandas) * 100)
  }));

  return (
    <div 
      className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
      style={{ outline: 'none' }}
    >
      <h3 className="text-md font-semibold text-gray-700 mb-4">{title}</h3>

      <div className="flex items-center justify-between h-[300px]">
        <div className="flex-1 h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
              <Pie
                data={data as any}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="quantidade"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                }}
                formatter={(value: number, name: string, props: any) => [
                  `${value} demandas (${Math.round((value / totalDemandas) * 100)}%)`,
                  props.payload.categoria
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-2 p-4">
          <div className="space-y-3">
            {dataComPorcentagem.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.cor }}
                  />
                  <div className="text-sm font-medium text-gray-700">
                    {item.categoria}
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-600">
                  {item.porcentagem}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
