import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, FileText, Settings } from "lucide-react";
import { Link } from "wouter";

export default function QuickActions() {
  const actions = [
    {
      title: "Add Product",
      icon: Plus,
      href: "/products",
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Sync Data",
      icon: RefreshCw,
      href: "/integrations",
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Generate Report",
      icon: FileText,
      href: "/analytics",
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Manage APIs",
      icon: Settings,
      href: "/integrations",
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Common administrative tasks and operations
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} href={action.href}>
                <Button
                  variant="outline"
                  className="flex flex-col items-center p-4 h-auto border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-2 ${action.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {action.title}
                  </span>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
