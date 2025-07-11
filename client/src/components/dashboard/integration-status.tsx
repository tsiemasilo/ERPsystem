import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function IntegrationStatus() {
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ERP Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <Skeleton className="h-6 w-32 mb-3" />
                <div className="space-y-2">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case "connecting":
        return <Clock className="h-3 w-3 text-yellow-500" />;
      default:
        return <AlertCircle className="h-3 w-3 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600";
      case "connecting":
        return "text-yellow-600";
      default:
        return "text-red-600";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ERP Integration Status</CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Real-time synchronization status with connected ERP systems
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {integrations?.map((integration: any) => (
            <div key={integration.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  {getStatusIcon(integration.status)}
                  <h4 className="font-medium text-gray-900 ml-2">{integration.name}</h4>
                </div>
                <Badge variant="outline" className={getStatusColor(integration.status)}>
                  {integration.status}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="text-gray-900 uppercase">{integration.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sync Status</span>
                  <span className={`${integration.syncStatus === 'success' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {integration.syncStatus === 'success' ? '✓ Synced' : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Sync</span>
                  <span className="text-gray-900">
                    {integration.lastSyncDate 
                      ? new Date(integration.lastSyncDate).toLocaleString()
                      : 'Never'
                    }
                  </span>
                </div>
              </div>

              {integration.status === "active" && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => syncMutation.mutate(integration.id)}
                  disabled={syncMutation.isPending}
                >
                  {syncMutation.isPending ? "Syncing..." : "Sync Now"}
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
