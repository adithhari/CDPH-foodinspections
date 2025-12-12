import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import dayjs from "dayjs";
import type { Inspection } from "../types";
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function PassRateOverTime({ inspections }: { inspections: Inspection[] }) {
  const grouped = inspections
    .slice()
    .sort((a, b) => a.inspection_date.localeCompare(b.inspection_date))
    .reduce<Record<string, { pass: number; total: number }>>((acc, i) => {
      const m = dayjs(i.inspection_date).format("YYYY-MM");
      if (!acc[m]) acc[m] = { pass: 0, total: 0 };
      acc[m].total += 1;
      if ((i.result ?? "").toLowerCase().startsWith("pass")) acc[m].pass += 1;
      return acc;
    }, {});
  const labels = Object.keys(grouped);
  const pct = labels.map(m => (grouped[m].pass / grouped[m].total) * 100);

  return <Line data={{
    labels,
    datasets: [{ label: "Pass rate (%)", data: pct }]
  }} options={{ responsive: true, maintainAspectRatio: false }} />;
}
