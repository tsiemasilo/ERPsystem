import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, BarChart3, PieChart, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { chartOptions } from "@/lib/chart-config";

export default function Analytics() {
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ["/api/dashboard/kpis"],
  });

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ["/api/dashboard/sales"],
  });

  const { data: orderStatus, isLoading: orderStatusLoading } = useQuery({
    queryKey: ["/api/dashboard/order-status"],
  });

  const { data: inventory } = useQuery({
    queryKey: ["/api/inventory"],
  });

  const { data: lowStockItems } = useQuery({
    queryKey: ["/api/inventory/low-stock"],
  });

  if (kpisLoading || salesLoading || orderStatusLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Sales trend calculation
  const salesGrowth = salesData && salesData.length >= 2 
    ? ((salesData[salesData.length - 1]?.revenue - salesData[salesData.length - 2]?.revenue) / salesData[salesData.length - 2]?.revenue * 100)
    : 0;

  // Inventory metrics
  const totalInventoryValue = inventory?.reduce((sum: number, item: any) => 
    sum + (item.quantityAvailable * (Number(item.product?.price) || 0)), 0) || 0;
  
  const lowStockPercentage = inventory?.length > 0 
    ? ((lowStockItems?.length || 0) / inventory.length * 100) 
    : 0;

  // Chart data
  const salesChartData = {
    labels: salesData?.map((item: any) => item.month) || [],
    datasets: [
      {
        label: "Revenue",
        data: salesData?.map((item: any) => item.revenue) || [],
        borderColor: "#1976D2",
        backgroundColor: "rgba(25, 118, 210, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const orderStatusChartData = {
    labels: orderStatus?.map((item: any) => item.status) || [],
    datasets: [
      {
        data: orderStatus?.map((item: any) => item.count) || [],
        backgroundColor: ["#4CAF50", "#FF9800", "#2196F3", "#9E9E9E", "#F44336"],
      },
    ],
  };

  // Inventory by category
  const inventoryByCategory = inventory?.reduce((acc: any, item: any) => {
    const category = item.product?.category || "Uncategorized";
    acc[category] = (acc[category] || 0) + item.quantityAvailable;
    return acc;
  }, {}) || {};

  const inventoryChartData = {
    labels: Object.keys(inventoryByCategory),
    datasets: [
      {
        data: Object.values(inventoryByCategory),
        backgroundColor: [
          "#1976D2", "#4CAF50", "#FF9800", "#9C27B0", "#F44336", "#00BCD4", "#795548"
        ],
      },
    ],
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Analytics</h1>
          <p className="text-gray-600">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select defaultValue="30days">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="12months">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  R{Number(kpis?.totalRevenue || 0).toLocaleString()}
                </p>
                <div className="flex items-center text-xs">
                  {salesGrowth >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={salesGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                    {Math.abs(salesGrowth).toFixed(1)}% vs last period
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  R{kpis?.totalOrders > 0 
                    ? (Number(kpis.totalRevenue) / kpis.totalOrders).toLocaleString(undefined, { maximumFractionDigits: 0 })
                    : "0"
                  }
                </p>
                <p className="text-xs text-green-600">+5.2% vs last period</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <PieChart className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  R{totalInventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-gray-500">Across all locations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Stock Health</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(100 - lowStockPercentage).toFixed(1)}%
                </p>
                <p className="text-xs text-purple-600">
                  {lowStockItems?.length || 0} items need attention
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Line data={salesChartData} options={chartOptions.line} />
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Doughnut data={orderStatusChartData} options={chartOptions.doughnut} />
            </div>
          </CardContent>
        </Card>

        {/* Inventory by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar 
                data={inventoryChartData} 
                options={{
                  ...chartOptions.bar,
                  indexAxis: 'y',
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="professional-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Current Value</th>
                  <th>Previous Period</th>
                  <th>Change</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-medium">Total Orders</td>
                  <td>{kpis?.totalOrders?.toLocaleString()}</td>
                  <td>2,547</td>
                  <td className="text-green-600">+12.5%</td>
                  <td><TrendingUp className="h-4 w-4 text-green-600" /></td>
                </tr>
                <tr>
                  <td className="font-medium">Customer Acquisition</td>
                  <td>{kpis?.totalCustomers?.toLocaleString()}</td>
                  <td>5,267</td>
                  <td className="text-green-600">+156</td>
                  <td><TrendingUp className="h-4 w-4 text-green-600" /></td>
                </tr>
                <tr>
                  <td className="font-medium">Active Products</td>
                  <td>{kpis?.totalProducts?.toLocaleString()}</td>
                  <td>18,423</td>
                  <td className="text-blue-600">+119</td>
                  <td><TrendingUp className="h-4 w-4 text-blue-600" /></td>
                </tr>
                <tr>
                  <td className="font-medium">Low Stock Items</td>
                  <td>{lowStockItems?.length || 0}</td>
                  <td>7</td>
                  <td className="text-red-600">-4</td>
                  <td><TrendingDown className="h-4 w-4 text-green-600" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
