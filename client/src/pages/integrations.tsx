import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, CheckCircle, Clock, AlertCircle, RefreshCw, Settings } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertErpIntegrationSchema, type InsertErpIntegration } from "@shared/schema";

interface IntegrationFormProps {
  integration?: any;
  onSuccess?: () => void;
}

function IntegrationForm({ integration, onSuccess }: IntegrationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertErpIntegration>({
    resolver: zodResolver(insertErpIntegrationSchema),
    defaultValues: {
      name: integration?.name || "",
      type: integration?.type || "",
      status: integration?.status || "inactive",
      apiEndpoint: integration?.apiEndpoint || "",
      syncStatus: integration?.syncStatus || "pending",
      configuration: integration?.configuration || {},
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertErpIntegration) => {
      if (integration) {
        await apiRequest("PUT", `/api/integrations/${integration.id}`, data);
      } else {
        await apiRequest("POST", "/api/integrations", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({
        title: integration ? "Integration Updated" : "Integration Created",
        description: `ERP integration has been successfully ${integration ? "updated" : "created"}.`,
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save integration.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertErpIntegration) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Integration Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. SAP Production System" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ERP Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ERP type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="sap">SAP</SelectItem>
                    <SelectItem value="odoo">Odoo</SelectItem>
                    <SelectItem value="kingdee">Kingdee</SelectItem>
                    <SelectItem value="yongyou">Yongyou</SelectItem>
                    <SelectItem value="oracle">Oracle ERP</SelectItem>
                    <SelectItem value="netsuite">NetSuite</SelectItem>
                    <SelectItem value="custom">Custom ERP</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="apiEndpoint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Endpoint</FormLabel>
              <FormControl>
                <Input placeholder="https://api.erp-system.com/v1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="connecting">Connecting</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="syncStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sync Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : integration ? "Update Integration" : "Create Integration"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Integrations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: integrations, isLoading } = useQuery({
    queryKey: ["/api/integrations"],
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const syncMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/integrations/${id}/sync`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({
        title: "Sync Started",
        description: "ERP integration sync has been initiated.",
      });
    },
    onError: () => {
      toast({
        title: "Sync Failed",
        description: "Failed to start ERP integration sync.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/integrations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({
        title: "Integration Deleted",
        description: "ERP integration has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete ERP integration.",
        variant: "destructive",
      });
    },
  });

  const filteredIntegrations = integrations?.filter((integration: any) =>
    integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    integration.type.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "connecting":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "connecting":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const activeIntegrations = integrations?.filter((i: any) => i.status === "active").length || 0;
  const totalIntegrations = integrations?.length || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ERP Integrations</h1>
          <p className="text-gray-600">Manage your ERP system connections and data synchronization</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Integration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New ERP Integration</DialogTitle>
            </DialogHeader>
            <IntegrationForm onSuccess={() => setIsCreateModalOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Integrations</p>
                <p className="text-2xl font-bold text-gray-900">{totalIntegrations}</p>
                <p className="text-xs text-gray-500">Configured systems</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Connections</p>
                <p className="text-2xl font-bold text-gray-900">{activeIntegrations}</p>
                <p className="text-xs text-green-600">Currently syncing</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sync Operations</p>
                <p className="text-2xl font-bold text-gray-900">24/7</p>
                <p className="text-xs text-orange-600">Real-time monitoring</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search integrations by name or type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration: any) => (
          <Card key={integration.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(integration.status)}
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                </div>
                <Badge className={getStatusColor(integration.status)}>
                  {integration.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium uppercase">{integration.type}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sync Status:</span>
                  <span className={`font-medium ${
                    integration.syncStatus === 'success' ? 'text-green-600' : 
                    integration.syncStatus === 'error' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {integration.syncStatus === 'success' ? '✓ Synced' : 
                     integration.syncStatus === 'error' ? '✗ Error' : '⏳ Pending'}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Sync:</span>
                  <span className="text-gray-900">
                    {integration.lastSyncDate 
                      ? new Date(integration.lastSyncDate).toLocaleString()
                      : 'Never'
                    }
                  </span>
                </div>

                {integration.apiEndpoint && (
                  <div className="text-sm">
                    <span className="text-gray-600">Endpoint:</span>
                    <p className="text-xs text-gray-900 break-all mt-1">{integration.apiEndpoint}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Integration</DialogTitle>
                        </DialogHeader>
                        <IntegrationForm integration={integration} />
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(integration.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {integration.status === "active" && (
                    <Button 
                      size="sm" 
                      onClick={() => syncMutation.mutate(integration.id)}
                      disabled={syncMutation.isPending}
                    >
                      <RefreshCw className={`h-4 w-4 mr-1 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                      Sync
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredIntegrations.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Integrations Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? "No integrations match your search criteria." : "Get started by adding your first ERP integration."}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Integration
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
