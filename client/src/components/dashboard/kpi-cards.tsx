import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, DollarSign, Package, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function KpiCards() {
  const { data: kpis, isLoading } = useQuery({
    queryKey: ["/api/dashboard/kpis"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="ml-4 space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Orders",
      value: kpis?.totalOrders?.toLocaleString() || "0",
      change: "+12.5% from last month",
      icon: ShoppingCart,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Revenue",
      value: `R${Number(kpis?.totalRevenue || 0).toLocaleString()}`,
      change: "+8.2% from last month",
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Products",
      value: kpis?.totalProducts?.toLocaleString() || "0",
      change: "Active inventory items",
      icon: Package,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Customers",
      value: kpis?.totalCustomers?.toLocaleString() || "0",
      change: "+156 new this month",
      icon: Users,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-xs text-green-600">{card.change}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
