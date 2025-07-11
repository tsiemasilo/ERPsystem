import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Package, 
  Warehouse, 
  ShoppingCart, 
  Users, 
  Plug, 
  TrendingUp,
  Building2
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Products", href: "/products", icon: Package },
  { name: "Inventory", href: "/inventory", icon: Warehouse },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Integrations", href: "/integrations", icon: Plug },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
];

const erpSystems = [
  { name: "SAP Integration", status: "Active", color: "bg-green-500" },
  { name: "Odoo System", status: "Synced", color: "bg-green-500" },
  { name: "Kingdee ERP", status: "Pending", color: "bg-yellow-500" },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Ace Online SA</h1>
            <p className="text-sm text-gray-600">ERP Integration Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        <div className="px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.name} href={item.href}>
                  <a
                    className={cn(
                      "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-blue-50 border-r-2 border-blue-600 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </a>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ERP Systems Status */}
        <div className="mt-8 px-3">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            ERP Systems
          </h3>
          <div className="mt-2 space-y-1">
            {erpSystems.map((system) => (
              <div key={system.name} className="flex items-center px-3 py-2 text-sm">
                <div className={cn("w-2 h-2 rounded-full mr-3", system.color)} />
                <span className="text-gray-700 flex-1">{system.name}</span>
                <span className={cn(
                  "text-xs",
                  system.status === "Active" || system.status === "Synced" 
                    ? "text-green-600" 
                    : "text-yellow-600"
                )}>
                  {system.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
