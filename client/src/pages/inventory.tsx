import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Edit, AlertTriangle, Package, TrendingDown, TrendingUp } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const inventoryUpdateSchema = z.object({
  quantityOnHand: z.number().min(0),
  quantityReserved: z.number().min(0),
  reorderPoint: z.number().min(0),
  maxStockLevel: z.number().min(0).optional(),
});

type InventoryUpdateData = z.infer<typeof inventoryUpdateSchema>;

interface InventoryUpdateFormProps {
  inventory: any;
  onSuccess?: () => void;
}

function InventoryUpdateForm({ inventory, onSuccess }: InventoryUpdateFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InventoryUpdateData>({
    resolver: zodResolver(inventoryUpdateSchema),
    defaultValues: {
      quantityOnHand: inventory.quantityOnHand || 0,
      quantityReserved: inventory.quantityReserved || 0,
      reorderPoint: inventory.reorderPoint || 0,
      maxStockLevel: inventory.maxStockLevel || 0,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InventoryUpdateData) => {
      const updateData = {
        ...data,
        quantityAvailable: data.quantityOnHand - data.quantityReserved,
      };
      await apiRequest("PUT", `/api/inventory/${inventory.productId}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/low-stock"] });
      toast({
        title: "Inventory Updated",
        description: "Inventory levels have been successfully updated.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update inventory.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InventoryUpdateData) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantityOnHand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity on Hand</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantityReserved"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity Reserved</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="reorderPoint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reorder Point</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxStockLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Stock Level</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Updating..." : "Update Inventory"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: inventory, isLoading } = useQuery({
    queryKey: ["/api/inventory"],
  });

  const { data: lowStockItems } = useQuery({
    queryKey: ["/api/inventory/low-stock"],
  });

  const filteredInventory = inventory?.filter((item: any) =>
    item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product?.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStockStatus = (available: number, reorderPoint: number) => {
    if (available <= 0) return { label: "Out of Stock", color: "bg-red-100 text-red-800", icon: AlertTriangle };
    if (available <= Math.floor(reorderPoint * 0.5)) return { label: "Critical", color: "bg-red-100 text-red-800", icon: TrendingDown };
    if (available <= reorderPoint) return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800", icon: TrendingDown };
    return { label: "In Stock", color: "bg-green-100 text-green-800", icon: TrendingUp };
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalItems = inventory?.length || 0;
  const lowStockCount = lowStockItems?.length || 0;
  const outOfStockCount = inventory?.filter((item: any) => item.quantityAvailable <= 0).length || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Monitor and manage your stock levels</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
                <p className="text-xs text-gray-500">Across all locations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900">{lowStockCount}</p>
                <p className="text-xs text-yellow-600">Require attention</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-gray-900">{outOfStockCount}</p>
                <p className="text-xs text-red-600">Immediate action needed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search inventory by product name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Levels ({filteredInventory.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="professional-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Location</th>
                  <th>On Hand</th>
                  <th>Reserved</th>
                  <th>Available</th>
                  <th>Reorder Point</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item: any) => {
                  const status = getStockStatus(item.quantityAvailable, item.reorderPoint);
                  const StatusIcon = status.icon;
                  
                  return (
                    <tr key={item.id}>
                      <td className="font-medium">{item.product?.name || "Unknown Product"}</td>
                      <td>{item.product?.sku || "N/A"}</td>
                      <td>{item.locationCode}</td>
                      <td>{item.quantityOnHand}</td>
                      <td>{item.quantityReserved}</td>
                      <td>{item.quantityAvailable}</td>
                      <td>{item.reorderPoint}</td>
                      <td>
                        <Badge className={`inline-flex items-center gap-1 ${status.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </td>
                      <td>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Inventory - {item.product?.name}</DialogTitle>
                            </DialogHeader>
                            <InventoryUpdateForm inventory={item} />
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
