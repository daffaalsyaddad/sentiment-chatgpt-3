import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const SENTIMENT_COLORS = {
  positif: "#34d399",
  negatif: "#fb7185",
  netral: "#fbbf24",
};

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  const data = payload[0]?.payload;

  return (
    <div className="rounded-lg border border-slate-700/80 bg-slate-950/95 px-4 py-3 shadow-2xl">
      <p className="text-sm font-semibold capitalize text-white">
        {data.name}
      </p>
      <p className="mt-1 text-xs text-slate-400">{data.value} review</p>
    </div>
  );
}

function SentimentChart({ stats }) {
  const chartData = [
    { name: "positif", value: Number(stats?.positif || 0) },
    { name: "negatif", value: Number(stats?.negatif || 0) },
    { name: "netral", value: Number(stats?.netral || 0) },
  ];

  const hasData = chartData.some((item) => item.value > 0);

  if (!hasData) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-lg border border-slate-700/70 bg-slate-950/40 p-6 text-center text-sm leading-6 text-slate-400">
        Data distribusi sentimen belum tersedia dari backend.
      </div>
    );
  }

  return (
    <div className="h-[280px] w-full sm:h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            dataKey="value"
            innerRadius="58%"
            outerRadius="82%"
            paddingAngle={4}
            stroke="rgba(15, 23, 42, 0.9)"
            strokeWidth={3}
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.name}
                fill={SENTIMENT_COLORS[entry.name]}
              />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SentimentChart;
