import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export interface SalesChartPoint {
  date: string;
  revenue: number;
  orders: number;
}

interface SalesChartProps {
  data: SalesChartPoint[];
}

function formatLabel(date: string) {
  const d = new Date(date + 'T12:00:00');
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function SalesChart({ data }: SalesChartProps) {
  const hasSales = data.some((d) => d.revenue > 0);

  if (!hasSales) {
    return (
      <p className="py-12 text-center text-sm text-slate-500">
        No paid orders in this period yet. Place a test order to see the chart.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatLabel}
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip
          formatter={(value, name) => {
            const n = Number(value ?? 0);
            if (name === 'revenue') return [`$${n.toFixed(2)}`, 'Revenue'];
            return [n, 'Orders'];
          }}
          labelFormatter={(label) => formatLabel(String(label))}
          contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
        />
        <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}
