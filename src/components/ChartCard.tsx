"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ChartData {
  categoria: string;
  quantidade: number;
  cor: string;
}

interface ChartCardProps {
  title: string;
  data: ChartData[];
  colors: string[];
}

export function ChartCard({ title, data }: ChartCardProps) {
  return (
    <div 
      className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow "
      style={{ outline: 'none' }}
    >
      <h3 className="text-md font-semibold text-gray-700 mb-4">{title}</h3>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data}
            onMouseEnter={() => {}}
            onMouseLeave={() => {}}
          >
            <XAxis
              dataKey="categoria"
              stroke="#9ca3af"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              interval={0}
              angle={0} 
              dy={10}
              axisLine={false} 
              tickLine={false}
            />
            <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "3px",
              }}
            />
            <Bar dataKey="quantidade" radius={[8, 8, 8, 8]} maxBarSize={60}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.cor} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
