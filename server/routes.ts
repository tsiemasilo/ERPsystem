import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { 
  insertProductSchema, 
  insertCustomerSchema, 
  insertOrderSchema,
  insertOrderItemSchema,
  insertErpIntegrationSchema,
  products,
  customers,
  orders,
  orderItems,
  inventory,
  erpIntegrations
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard/Analytics routes
  app.get("/api/dashboard/kpis", async (req, res) => {
    try {
      const kpis = await storage.getDashboardKpis();
      res.json(kpis);
    } catch (error) {
      console.error("Error fetching KPIs:", error);
      res.status(500).json({ message: "Failed to fetch dashboard KPIs" });
    }
  });

  app.get("/api/dashboard/sales", async (req, res) => {
    try {
      const salesData = await storage.getSalesData();
      res.json(salesData);
    } catch (error) {
      console.error("Error fetching sales data:", error);
      res.status(500).json({ message: "Failed to fetch sales data" });
    }
  });

  app.get("/api/dashboard/order-status", async (req, res) => {
    try {
      const orderStatus = await storage.getOrderStatusDistribution();
      res.json(orderStatus);
    } catch (error) {
      console.error("Error fetching order status:", error);
      res.status(500).json({ message: "Failed to fetch order status distribution" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, productData);
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Customer routes
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      console.error("Error creating customer:", error);
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customerData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, customerData);
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      console.error("Error updating customer:", error);
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCustomer(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Order routes
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  const createOrderSchema = z.object({
    order: insertOrderSchema,
    items: z.array(insertOrderItemSchema),
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const { order: orderData, items } = createOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData, items);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.put("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const orderData = insertOrderSchema.partial().parse(req.body);
      const order = await storage.updateOrder(id, orderData);
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  app.delete("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteOrder(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ message: "Failed to delete order" });
    }
  });

  // Inventory routes
  app.get("/api/inventory", async (req, res) => {
    try {
      const inventory = await storage.getInventory();
      res.json(inventory);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  app.get("/api/inventory/low-stock", async (req, res) => {
    try {
      const lowStockItems = await storage.getLowStockItems();
      res.json(lowStockItems);
    } catch (error) {
      console.error("Error fetching low stock items:", error);
      res.status(500).json({ message: "Failed to fetch low stock items" });
    }
  });

  // ERP Integration routes
  app.get("/api/integrations", async (req, res) => {
    try {
      const integrations = await storage.getErpIntegrations();
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching integrations:", error);
      res.status(500).json({ message: "Failed to fetch ERP integrations" });
    }
  });

  app.post("/api/integrations", async (req, res) => {
    try {
      const integrationData = insertErpIntegrationSchema.parse(req.body);
      const integration = await storage.createErpIntegration(integrationData);
      res.status(201).json(integration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid integration data", errors: error.errors });
      }
      console.error("Error creating integration:", error);
      res.status(500).json({ message: "Failed to create ERP integration" });
    }
  });

  app.put("/api/integrations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const integrationData = insertErpIntegrationSchema.partial().parse(req.body);
      const integration = await storage.updateErpIntegration(id, integrationData);
      res.json(integration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid integration data", errors: error.errors });
      }
      console.error("Error updating integration:", error);
      res.status(500).json({ message: "Failed to update ERP integration" });
    }
  });

  // ERP sync simulation endpoint
  app.post("/api/integrations/:id/sync", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // Simulate sync process
      await storage.updateErpIntegration(id, {
        lastSyncDate: new Date(),
        syncStatus: "success",
      });
      res.json({ message: "Sync completed successfully" });
    } catch (error) {
      console.error("Error syncing integration:", error);
      res.status(500).json({ message: "Failed to sync ERP integration" });
    }
  });

  // Clear database endpoint
  app.delete("/api/clear-data", async (req, res) => {
    try {
      // Clear in correct order due to foreign key constraints
      await db.delete(orderItems);
      await db.delete(orders);
      await db.delete(inventory);
      await db.delete(products);
      await db.delete(customers);
      await db.delete(erpIntegrations);
      
      res.json({ message: "Database cleared successfully" });
    } catch (error) {
      console.error("Error clearing data:", error);
      res.status(500).json({ message: "Failed to clear database" });
    }
  });

  // Seed database with mock data endpoint
  app.post("/api/seed-data", async (req, res) => {
    try {
      // Create customers first
      const customers = [
        {
          customerCode: "VOD001",
          companyName: "Vodacom Business Solutions",
          contactPerson: "Thabo Mthembu",
          email: "thabo.mthembu@vodacom.co.za",
          phone: "+27 11 653 5000",
          address: "Vodacom Corporate Park, 082 Vodacom Boulevard, Midrand, 1685",
          creditLimit: "500000"
        },
        {
          customerCode: "PNP001",
          companyName: "Pick n Pay Retailers",
          contactPerson: "Sarah van der Merwe",
          email: "sarah.vandermerwe@pnp.co.za",
          phone: "+27 21 658 1000",
          address: "101 Rosmead Avenue, Kenilworth, Cape Town, 7708",
          creditLimit: "750000"
        },
        {
          customerCode: "STE001",
          companyName: "Steinhoff Africa Retail",
          contactPerson: "David Mbeki",
          email: "david.mbeki@steinhoff.com",
          phone: "+27 21 808 4400",
          address: "28 Sixth Street, Wynberg, Cape Town, 7800",
          creditLimit: "1000000"
        },
        {
          customerCode: "TIG001",
          companyName: "Tiger Brands Limited",
          contactPerson: "Jennifer Adams",
          email: "jennifer.adams@tigerbrands.com",
          phone: "+27 11 840 4000",
          address: "3 Tiger Crescent, Bryanston, Sandton, 2021",
          creditLimit: "600000"
        },
        {
          customerCode: "BID001",
          companyName: "Bidvest Group Services",
          contactPerson: "Michael Johnson",
          email: "michael.johnson@bidvest.co.za",
          phone: "+27 11 772 8700",
          address: "18 Crescent Drive, Melrose Arch, Johannesburg, 2196",
          creditLimit: "800000"
        }
      ];

      const createdCustomers = [];
      for (const customer of customers) {
        const created = await storage.createCustomer(customer);
        createdCustomers.push(created);
      }

      // Create products
      const products = [
        {
          sku: "LAPTOP-001",
          name: "Dell Latitude 7420 Business Laptop",
          description: "14-inch laptop with Intel i7, 16GB RAM, 512GB SSD",
          category: "Electronics",
          price: "28500",
          isActive: true
        },
        {
          sku: "DESK-001",
          name: "Executive Office Desk - Mahogany",
          description: "Premium executive desk with built-in cable management",
          category: "Furniture",
          price: "12500",
          isActive: true
        },
        {
          sku: "PHONE-001",
          name: "Samsung Galaxy S24 Business Edition",
          description: "Latest smartphone with enterprise security features",
          category: "Electronics",
          price: "18900",
          isActive: true
        },
        {
          sku: "CHAIR-001",
          name: "Ergonomic Executive Chair",
          description: "Premium leather executive chair with lumbar support",
          category: "Furniture",
          price: "8750",
          isActive: true
        },
        {
          sku: "PRINTER-001",
          name: "HP LaserJet Pro M404dn",
          description: "High-speed monochrome laser printer for office use",
          category: "Electronics",
          price: "4200",
          isActive: true
        },
        {
          sku: "PROJECTOR-001",
          name: "Epson PowerLite 1795F Wireless",
          description: "Full HD wireless projector for conference rooms",
          category: "Electronics",
          price: "15600",
          isActive: true
        },
        {
          sku: "TABLE-001",
          name: "Conference Table - 12 Seater",
          description: "Solid wood conference table with built-in power outlets",
          category: "Furniture",
          price: "22000",
          isActive: true
        },
        {
          sku: "MONITOR-001",
          name: "LG UltraWide 34-inch Monitor",
          description: "34-inch curved ultrawide monitor with USB-C connectivity",
          category: "Electronics",
          price: "9800",
          isActive: true
        },
        {
          sku: "CABINET-001",
          name: "Filing Cabinet - 4 Drawer Steel",
          description: "Lockable steel filing cabinet with anti-tip mechanism",
          category: "Furniture",
          price: "3400",
          isActive: true
        },
        {
          sku: "TABLET-001",
          name: "iPad Pro 12.9-inch with Apple Pencil",
          description: "Professional tablet with M2 chip and accessories",
          category: "Electronics",
          price: "24500",
          isActive: true
        }
      ];

      const createdProducts = [];
      for (const product of products) {
        const created = await storage.createProduct(product);
        createdProducts.push(created);
      }

      // Create inventory for products
      const inventoryData = [
        { productId: createdProducts[0].id, quantityAvailable: 45, reorderPoint: 10, locationCode: "WARE-A" },
        { productId: createdProducts[1].id, quantityAvailable: 12, reorderPoint: 3, locationCode: "WARE-B" },
        { productId: createdProducts[2].id, quantityAvailable: 78, reorderPoint: 15, locationCode: "WARE-A" },
        { productId: createdProducts[3].id, quantityAvailable: 25, reorderPoint: 5, locationCode: "WARE-B" },
        { productId: createdProducts[4].id, quantityAvailable: 18, reorderPoint: 4, locationCode: "WARE-A" },
        { productId: createdProducts[5].id, quantityAvailable: 8, reorderPoint: 2, locationCode: "WARE-B" },
        { productId: createdProducts[6].id, quantityAvailable: 5, reorderPoint: 1, locationCode: "WARE-B" },
        { productId: createdProducts[7].id, quantityAvailable: 32, reorderPoint: 8, locationCode: "WARE-A" },
        { productId: createdProducts[8].id, quantityAvailable: 22, reorderPoint: 5, locationCode: "WARE-A" },
        { productId: createdProducts[9].id, quantityAvailable: 15, reorderPoint: 3, locationCode: "WARE-A" }
      ];

      for (const inventory of inventoryData) {
        await storage.updateInventory(inventory.productId, inventory);
      }

      // Create orders with historical data spread across recent months
      const orders = [
        // August 2024
        {
          customerId: createdCustomers[0].id,
          orderNumber: "ORD-2024-008",
          orderDate: new Date('2024-08-15'),
          status: "delivered",
          subtotal: "85500",
          totalAmount: "85500",
          items: [
            { productId: createdProducts[0].id, quantity: 2, unitPrice: "28500", totalPrice: "57000" },
            { productId: createdProducts[1].id, quantity: 1, unitPrice: "12500", totalPrice: "12500" },
            { productId: createdProducts[5].id, quantity: 1, unitPrice: "15600", totalPrice: "15600" }
          ]
        },
        // September 2024
        {
          customerId: createdCustomers[1].id,
          orderNumber: "ORD-2024-009",
          orderDate: new Date('2024-09-10'),
          status: "delivered",
          subtotal: "124300",
          totalAmount: "124300",
          items: [
            { productId: createdProducts[2].id, quantity: 3, unitPrice: "18900", totalPrice: "56700" },
            { productId: createdProducts[0].id, quantity: 2, unitPrice: "28500", totalPrice: "57000" },
            { productId: createdProducts[4].id, quantity: 1, unitPrice: "4200", totalPrice: "4200" }
          ]
        },
        {
          customerId: createdCustomers[2].id,
          orderNumber: "ORD-2024-010",
          orderDate: new Date('2024-09-25'),
          status: "delivered",
          subtotal: "67400",
          totalAmount: "67400",
          items: [
            { productId: createdProducts[6].id, quantity: 1, unitPrice: "22000", totalPrice: "22000" },
            { productId: createdProducts[3].id, quantity: 3, unitPrice: "8750", totalPrice: "26250" },
            { productId: createdProducts[2].id, quantity: 1, unitPrice: "18900", totalPrice: "18900" }
          ]
        },
        // October 2024
        {
          customerId: createdCustomers[3].id,
          orderNumber: "ORD-2024-011",
          orderDate: new Date('2024-10-08'),
          status: "delivered",
          subtotal: "156200",
          totalAmount: "156200",
          items: [
            { productId: createdProducts[0].id, quantity: 3, unitPrice: "28500", totalPrice: "85500" },
            { productId: createdProducts[9].id, quantity: 2, unitPrice: "24500", totalPrice: "49000" },
            { productId: createdProducts[6].id, quantity: 1, unitPrice: "22000", totalPrice: "22000" }
          ]
        },
        {
          customerId: createdCustomers[4].id,
          orderNumber: "ORD-2024-012",
          orderDate: new Date('2024-10-22'),
          status: "delivered",
          subtotal: "89350",
          totalAmount: "89350",
          items: [
            { productId: createdProducts[1].id, quantity: 4, unitPrice: "12500", totalPrice: "50000" },
            { productId: createdProducts[3].id, quantity: 2, unitPrice: "8750", totalPrice: "17500" },
            { productId: createdProducts[8].id, quantity: 6, unitPrice: "3400", totalPrice: "20400" }
          ]
        },
        // November 2024
        {
          customerId: createdCustomers[0].id,
          orderNumber: "ORD-2024-013",
          orderDate: new Date('2024-11-05'),
          status: "delivered",
          subtotal: "198700",
          totalAmount: "198700",
          items: [
            { productId: createdProducts[0].id, quantity: 4, unitPrice: "28500", totalPrice: "114000" },
            { productId: createdProducts[2].id, quantity: 2, unitPrice: "18900", totalPrice: "37800" },
            { productId: createdProducts[5].id, quantity: 3, unitPrice: "15600", totalPrice: "46800" }
          ]
        },
        {
          customerId: createdCustomers[1].id,
          orderNumber: "ORD-2024-014",
          orderDate: new Date('2024-11-18'),
          status: "shipped",
          subtotal: "112450",
          totalAmount: "112450",
          items: [
            { productId: createdProducts[6].id, quantity: 2, unitPrice: "22000", totalPrice: "44000" },
            { productId: createdProducts[9].id, quantity: 1, unitPrice: "24500", totalPrice: "24500" },
            { productId: createdProducts[0].id, quantity: 1, unitPrice: "28500", totalPrice: "28500" },
            { productId: createdProducts[5].id, quantity: 1, unitPrice: "15600", totalPrice: "15600" }
          ]
        },
        // December 2024
        {
          customerId: createdCustomers[2].id,
          orderNumber: "ORD-2024-015",
          orderDate: new Date('2024-12-10'),
          status: "delivered",
          subtotal: "245800",
          totalAmount: "245800",
          items: [
            { productId: createdProducts[0].id, quantity: 5, unitPrice: "28500", totalPrice: "142500" },
            { productId: createdProducts[1].id, quantity: 3, unitPrice: "12500", totalPrice: "37500" },
            { productId: createdProducts[2].id, quantity: 2, unitPrice: "18900", totalPrice: "37800" },
            { productId: createdProducts[3].id, quantity: 3, unitPrice: "8750", totalPrice: "26250" }
          ]
        },
        // January 2025 (current orders)
        {
          customerId: createdCustomers[3].id,
          orderNumber: "ORD-2025-001",
          orderDate: new Date('2025-01-05'),
          status: "processing",
          subtotal: "178900",
          totalAmount: "178900",
          items: [
            { productId: createdProducts[9].id, quantity: 3, unitPrice: "24500", totalPrice: "73500" },
            { productId: createdProducts[0].id, quantity: 2, unitPrice: "28500", totalPrice: "57000" },
            { productId: createdProducts[6].id, quantity: 1, unitPrice: "22000", totalPrice: "22000" },
            { productId: createdProducts[3].id, quantity: 3, unitPrice: "8750", totalPrice: "26250" }
          ]
        },
        {
          customerId: createdCustomers[4].id,
          orderNumber: "ORD-2025-002",
          orderDate: new Date('2025-01-10'),
          status: "pending",
          subtotal: "134700",
          totalAmount: "134700",
          items: [
            { productId: createdProducts[0].id, quantity: 3, unitPrice: "28500", totalPrice: "85500" },
            { productId: createdProducts[2].id, quantity: 1, unitPrice: "18900", totalPrice: "18900" },
            { productId: createdProducts[1].id, quantity: 2, unitPrice: "12500", totalPrice: "25000" },
            { productId: createdProducts[4].id, quantity: 1, unitPrice: "4200", totalPrice: "4200" }
          ]
        }
      ];

      for (const orderData of orders) {
        const { items, ...order } = orderData;
        await storage.createOrder(order, items);
      }

      // Create ERP integrations
      const integrations = [
        {
          name: "SAP Business One",
          type: "sap",
          status: "active",
          apiEndpoint: "https://api.sap.com/v1/businessone",
          syncStatus: "success",
          lastSyncDate: new Date('2024-02-10T14:30:00Z'),
          configuration: {
            apiKey: "sap_prod_key_2024_za_001",
            companyDb: "ACEOL_ZA",
            serverUrl: "https://sap-b1.aceonline.co.za"
          }
        },
        {
          name: "Odoo ERP Cloud",
          type: "odoo",
          status: "active",
          apiEndpoint: "https://mycompany.odoo.co.za/api/v2",
          syncStatus: "success",
          lastSyncDate: new Date('2024-02-10T12:15:00Z'),
          configuration: {
            apiKey: "odoo_cloud_key_za_prod_001",
            database: "aceol_prod",
            username: "integration_user"
          }
        },
        {
          name: "Kingdee Cloud",
          type: "kingdee",
          status: "inactive",
          apiEndpoint: "https://api.kingdee.com/v3/za",
          syncStatus: "error",
          lastSyncDate: new Date('2024-02-09T16:45:00Z'),
          configuration: {
            apiKey: "kingdee_za_enterprise_key_001",
            accountId: "ACE_ZA_001",
            region: "za-central"
          }
        },
        {
          name: "Microsoft Dynamics 365",
          type: "dynamics365",
          status: "active",
          apiEndpoint: "https://api.dynamics.microsoft.com/v1",
          syncStatus: "success",
          lastSyncDate: new Date('2024-02-10T13:20:00Z'),
          configuration: {
            apiKey: "dynamics_365_za_prod_key_001",
            organizationUrl: "https://aceonline.crm4.dynamics.com",
            clientId: "d365-ace-client-001"
          }
        }
      ];

      for (const integration of integrations) {
        await storage.createErpIntegration(integration);
      }

      res.json({ 
        message: "Mock data seeded successfully",
        summary: {
          customers: createdCustomers.length,
          products: createdProducts.length,
          orders: orders.length,
          integrations: integrations.length
        }
      });
    } catch (error) {
      console.error("Error seeding data:", error);
      res.status(500).json({ message: "Failed to seed mock data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
