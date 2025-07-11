import KpiCards from "@/components/dashboard/kpi-cards";
import SalesChart from "@/components/dashboard/sales-chart";
import OrderStatusChart from "@/components/dashboard/order-status-chart";
import RecentOrders from "@/components/dashboard/recent-orders";
import LowStockAlerts from "@/components/dashboard/low-stock-alerts";
import IntegrationStatus from "@/components/dashboard/integration-status";
import QuickActions from "@/components/dashboard/quick-actions";

export default function Dashboard() {
  return (
    <div className="p-6 space-y-8">
      {/* KPI Cards */}
      <KpiCards />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />
        <OrderStatusChart />
      </div>

      {/* Data Tables Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RecentOrders />
        <LowStockAlerts />
      </div>

      {/* Integration Status */}
      <IntegrationStatus />

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}
