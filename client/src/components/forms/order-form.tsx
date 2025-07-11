import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertOrderSchema, insertOrderItemSchema, type InsertOrder } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";

const orderFormSchema = z.object({
  order: insertOrderSchema,
  items: z.array(insertOrderItemSchema.omit({ orderId: true })),
});

type OrderFormData = z.infer<typeof orderFormSchema>;

interface OrderFormProps {
  onSuccess?: () => void;
}

export default function OrderForm({ onSuccess }: OrderFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers } = useQuery({
    queryKey: ["/api/customers"],
  });

  const { data: products } = useQuery({
    queryKey: ["/api/products"],
  });

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      order: {
        orderNumber: `ORD-${Date.now()}`,
        customerId: 0,
        orderDate: new Date(),
        status: "pending",
        subtotal: "0",
        taxAmount: "0",
        shippingAmount: "0",
        totalAmount: "0",
        notes: "",
      },
      items: [
        {
          productId: 0,
          quantity: 1,
          unitPrice: "0",
          totalPrice: "0",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = watchedItems.reduce((sum, item) => {
      return sum + (Number(item.totalPrice) || 0);
    }, 0);
    
    const taxAmount = subtotal * 0.15; // 15% VAT
    const shippingAmount = 0; // Free shipping for now
    const totalAmount = subtotal + taxAmount + shippingAmount;

    form.setValue("order.subtotal", subtotal.toFixed(2));
    form.setValue("order.taxAmount", taxAmount.toFixed(2));
    form.setValue("order.shippingAmount", shippingAmount.toFixed(2));
    form.setValue("order.totalAmount", totalAmount.toFixed(2));
  };

  const updateItemTotal = (index: number) => {
    const item = watchedItems[index];
    const total = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    form.setValue(`items.${index}.totalPrice`, total.toFixed(2));
    calculateTotals();
  };

  const mutation = useMutation({
    mutationFn: async (data: OrderFormData) => {
      await apiRequest("POST", "/api/orders", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order Created",
        description: "Order has been successfully created.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create order.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OrderFormData) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Order Details */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="order.orderNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order Number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="order.customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer</FormLabel>
                <Select onValueChange={(value) => field.onChange(Number(value))}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers?.map((customer: any) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Order Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Order Items</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({
                productId: 0,
                quantity: 1,
                unitPrice: "0",
                totalPrice: "0",
              })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-5 gap-4 items-end">
              <FormField
                control={form.control}
                name={`items.${index}.productId`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(Number(value));
                        const product = products?.find((p: any) => p.id === Number(value));
                        if (product) {
                          form.setValue(`items.${index}.unitPrice`, product.price);
                          updateItemTotal(index);
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products?.map((product: any) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`items.${index}.quantity`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => {
                          field.onChange(Number(e.target.value));
                          updateItemTotal(index);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`items.${index}.unitPrice`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          updateItemTotal(index);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`items.${index}.totalPrice`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Order Totals */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>R{Number(form.watch("order.subtotal")).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (15%):</span>
            <span>R{Number(form.watch("order.taxAmount")).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping:</span>
            <span>R{Number(form.watch("order.shippingAmount")).toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total:</span>
            <span>R{Number(form.watch("order.totalAmount")).toLocaleString()}</span>
          </div>
        </div>

        <FormField
          control={form.control}
          name="order.notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Order notes..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Creating..." : "Create Order"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
