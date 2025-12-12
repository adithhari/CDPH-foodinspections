import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import type { Inspection } from "../types";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function ResultBreakdownBar({ inspections }: { inspections: Inspection[] }) {
  const grouped = inspections.reduce<Record<string, number>>((acc, i) => {
    const key = (i.result ?? "Unknown").trim();
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const labels = Object.keys(grouped);
  const data = Object.values(grouped);

  return (
    <div style={{ height: 300 }}>
      <Bar
        data={{
          labels,
          datasets: [
            {
              label: "Count",
              data,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } },
        }}
      />
    </div>
  );
}
