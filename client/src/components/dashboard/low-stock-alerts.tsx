import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";

export default function LowStockAlerts() {
  const { data: lowStockItems, isLoading } = useQuery({
    queryKey: ["/api/inventory/low-stock"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border-l-4 border-red-400 pl-4 py-2">
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const criticalCount = lowStockItems?.filter((item: any) => 
    item.quantityAvailable <= Math.floor(item.reorderPoint * 0.5)
  ).length || 0;

  const getBorderColor = (available: number, reorderPoint: number) => {
    if (available <= Math.floor(reorderPoint * 0.5)) return "border-red-400";
    if (available <= Math.floor(reorderPoint * 0.8)) return "border-orange-400";
    return "border-yellow-400";
  };

  const getTextColor = (available: number, reorderPoint: number) => {
    if (available <= Math.floor(reorderPoint * 0.5)) return "text-red-600";
    if (available <= Math.floor(reorderPoint * 0.8)) return "text-orange-600";
    return "text-yellow-600";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Low Stock Alerts
          </CardTitle>
          {criticalCount > 0 && (
            <Badge variant="destructive">
              {criticalCount} Critical
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!lowStockItems || lowStockItems.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No low stock items</p>
        ) : (
          <div className="space-y-4">
            {lowStockItems.slice(0, 5).map((item: any) => (
              <div
                key={item.id}
                className={`flex items-center justify-between border-l-4 pl-4 py-2 ${getBorderColor(
                  item.quantityAvailable,
                  item.reorderPoint
                )}`}
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.product?.name || "Unknown Product"}
                  </p>
                  <p className="text-xs text-gray-600">
                    SKU: {item.product?.sku || "N/A"}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-bold ${getTextColor(
                      item.quantityAvailable,
                      item.reorderPoint
                    )}`}
                  >
                    {item.quantityAvailable} units
                  </p>
                  <p className="text-xs text-gray-500">
                    Min: {item.reorderPoint}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
