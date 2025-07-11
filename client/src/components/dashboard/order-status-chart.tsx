import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Skeleton } from "@/components/ui/skeleton";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function OrderStatusChart() {
  const { data: orderStatus, isLoading } = useQuery({
    queryKey: ["/api/dashboard/order-status"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-64" />
        </CardContent>
      </Card>
    );
  }

  const chartData = {
    labels: orderStatus?.map((item: any) => item.status) || [],
    datasets: [
      {
        data: orderStatus?.map((item: any) => item.count) || [],
        backgroundColor: [
          "#4CAF50", // completed - green
          "#FF9800", // processing - orange  
          "#2196F3", // shipped - blue
          "#9E9E9E", // pending - gray
          "#F44336", // cancelled - red
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Doughnut data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
