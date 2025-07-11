// netlify/functions/api.js
import serverless from "serverless-http";
import express from "express";
import { createServer } from "http";
import {
  pgTable,
  text,
  serial,
  integer,
  decimal,
  timestamp,
  varchar,
  boolean,
  jsonb
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import { eq, desc, asc, sql, lt } from "drizzle-orm";
import { z } from "zod";
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var schema_exports = {};
__export(schema_exports, {
  customers: () => customers,
  customersRelations: () => customersRelations,
  erpIntegrations: () => erpIntegrations,
  insertCustomerSchema: () => insertCustomerSchema,
  insertErpIntegrationSchema: () => insertErpIntegrationSchema,
  insertInventorySchema: () => insertInventorySchema,
  insertOrderItemSchema: () => insertOrderItemSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertProductSchema: () => insertProductSchema,
  insertUserSchema: () => insertUserSchema,
  inventory: () => inventory,
  inventoryRelations: () => inventoryRelations,
  orderItems: () => orderItems,
  orderItemsRelations: () => orderItemsRelations,
  orders: () => orders,
  ordersRelations: () => ordersRelations,
  products: () => products,
  productsRelations: () => productsRelations,
  users: () => users
});
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").default("user"),
  createdAt: timestamp("created_at").defaultNow()
});
var products = pgTable("products", {
  id: serial("id").primaryKey(),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  weight: decimal("weight", { precision: 8, scale: 2 }),
  dimensions: jsonb("dimensions"),
  // {length, width, height}
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  customerCode: varchar("customer_code", { length: 50 }).notNull().unique(),
  companyName: text("company_name").notNull(),
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  province: text("province"),
  postalCode: text("postal_code"),
  country: text("country").default("South Africa"),
  taxNumber: text("tax_number"),
  creditLimit: decimal("credit_limit", { precision: 12, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  orderDate: timestamp("order_date").defaultNow(),
  requiredDate: timestamp("required_date"),
  shippedDate: timestamp("shipped_date"),
  status: text("status").default("pending"),
  // pending, processing, shipped, completed, cancelled
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default("0"),
  shippingAmount: decimal("shipping_amount", { precision: 12, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 12, scale: 2 }).notNull()
});
var inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  locationCode: varchar("location_code", { length: 50 }).default("MAIN"),
  quantityOnHand: integer("quantity_on_hand").default(0),
  quantityReserved: integer("quantity_reserved").default(0),
  quantityAvailable: integer("quantity_available").default(0),
  reorderPoint: integer("reorder_point").default(0),
  maxStockLevel: integer("max_stock_level"),
  lastCountDate: timestamp("last_count_date"),
  updatedAt: timestamp("updated_at").defaultNow()
});
var erpIntegrations = pgTable("erp_integrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  // sap, odoo, kingdee, etc.
  status: text("status").default("inactive"),
  // active, inactive, error, connecting
  apiEndpoint: text("api_endpoint"),
  lastSyncDate: timestamp("last_sync_date"),
  syncStatus: text("sync_status").default("pending"),
  // success, error, pending
  configuration: jsonb("configuration"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders)
}));
var ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id]
  }),
  orderItems: many(orderItems)
}));
var orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id]
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id]
  })
}));
var productsRelations = relations(products, ({ many, one }) => ({
  orderItems: many(orderItems),
  inventory: one(inventory)
}));
var inventoryRelations = relations(inventory, ({ one }) => ({
  product: one(products, {
    fields: [inventory.productId],
    references: [products.id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  orderId: true
});
var insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  updatedAt: true
});
var insertErpIntegrationSchema = createInsertSchema(erpIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  // Product operations
  async getProducts() {
    const result = await db.select().from(products).leftJoin(inventory, eq(products.id, inventory.productId)).orderBy(desc(products.createdAt));
    return result.map(({ products: product, inventory: inv }) => ({
      ...product,
      inventory: inv || void 0
    }));
  }
  async getProduct(id) {
    const [result] = await db.select().from(products).leftJoin(inventory, eq(products.id, inventory.productId)).where(eq(products.id, id));
    if (!result) return void 0;
    return {
      ...result.products,
      inventory: result.inventory || void 0
    };
  }
  async createProduct(product) {
    const [newProduct] = await db.insert(products).values(product).returning();
    await db.insert(inventory).values({
      productId: newProduct.id,
      quantityOnHand: 0,
      quantityReserved: 0,
      quantityAvailable: 0,
      reorderPoint: 10,
      locationCode: "MAIN"
    });
    return newProduct;
  }
  async updateProduct(id, product) {
    const [updatedProduct] = await db.update(products).set({ ...product, updatedAt: /* @__PURE__ */ new Date() }).where(eq(products.id, id)).returning();
    return updatedProduct;
  }
  async deleteProduct(id) {
    await db.delete(products).where(eq(products.id, id));
  }
  // Customer operations
  async getCustomers() {
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }
  async getCustomer(id) {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || void 0;
  }
  async createCustomer(customer) {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }
  async updateCustomer(id, customer) {
    const [updatedCustomer] = await db.update(customers).set({ ...customer, updatedAt: /* @__PURE__ */ new Date() }).where(eq(customers.id, id)).returning();
    return updatedCustomer;
  }
  async deleteCustomer(id) {
    await db.delete(customers).where(eq(customers.id, id));
  }
  // Order operations
  async getOrders() {
    const result = await db.select().from(orders).leftJoin(customers, eq(orders.customerId, customers.id)).leftJoin(orderItems, eq(orders.id, orderItems.orderId)).leftJoin(products, eq(orderItems.productId, products.id)).orderBy(desc(orders.createdAt));
    const ordersMap = /* @__PURE__ */ new Map();
    result.forEach(({ orders: order, customers: customer, order_items: item, products: product }) => {
      if (!ordersMap.has(order.id)) {
        ordersMap.set(order.id, {
          ...order,
          customer,
          orderItems: []
        });
      }
      if (item && product) {
        ordersMap.get(order.id).orderItems.push({
          ...item,
          product
        });
      }
    });
    return Array.from(ordersMap.values());
  }
  async getOrder(id) {
    const result = await db.select().from(orders).leftJoin(customers, eq(orders.customerId, customers.id)).leftJoin(orderItems, eq(orders.id, orderItems.orderId)).leftJoin(products, eq(orderItems.productId, products.id)).where(eq(orders.id, id));
    if (result.length === 0) return void 0;
    const order = result[0].orders;
    const customer = result[0].customers;
    const items = result.filter((r) => r.order_items && r.products).map((r) => ({ ...r.order_items, product: r.products }));
    return {
      ...order,
      customer,
      orderItems: items
    };
  }
  async createOrder(order, items) {
    const [newOrder] = await db.insert(orders).values(order).returning();
    const orderItemsWithOrderId = items.map((item) => ({
      ...item,
      orderId: newOrder.id
    }));
    await db.insert(orderItems).values(orderItemsWithOrderId);
    return newOrder;
  }
  async updateOrder(id, order) {
    const [updatedOrder] = await db.update(orders).set({ ...order, updatedAt: /* @__PURE__ */ new Date() }).where(eq(orders.id, id)).returning();
    return updatedOrder;
  }
  async deleteOrder(id) {
    await db.delete(orderItems).where(eq(orderItems.orderId, id));
    await db.delete(orders).where(eq(orders.id, id));
  }
  // Inventory operations
  async getInventory() {
    const result = await db.select().from(inventory).leftJoin(products, eq(inventory.productId, products.id)).orderBy(asc(inventory.quantityAvailable));
    return result.map(({ inventory: inv, products: product }) => ({
      ...inv,
      product
    }));
  }
  async getLowStockItems() {
    const result = await db.select().from(inventory).leftJoin(products, eq(inventory.productId, products.id)).where(lt(inventory.quantityAvailable, inventory.reorderPoint)).orderBy(asc(inventory.quantityAvailable));
    return result.map(({ inventory: inv, products: product }) => ({
      ...inv,
      product
    }));
  }
  async updateInventory(productId, inventoryUpdate) {
    const [updatedInventory] = await db.update(inventory).set({ ...inventoryUpdate, updatedAt: /* @__PURE__ */ new Date() }).where(eq(inventory.productId, productId)).returning();
    return updatedInventory;
  }
  // ERP Integration operations
  async getErpIntegrations() {
    return await db.select().from(erpIntegrations).orderBy(desc(erpIntegrations.createdAt));
  }
  async createErpIntegration(integration) {
    const [newIntegration] = await db.insert(erpIntegrations).values(integration).returning();
    return newIntegration;
  }
  async updateErpIntegration(id, integration) {
    const [updatedIntegration] = await db.update(erpIntegrations).set({ ...integration, updatedAt: /* @__PURE__ */ new Date() }).where(eq(erpIntegrations.id, id)).returning();
    return updatedIntegration;
  }
  // Dashboard/Analytics operations
  async getDashboardKpis() {
    const [orderStats] = await db.select({
      totalOrders: sql`count(*)::int`,
      totalRevenue: sql`sum(total_amount)::text`
    }).from(orders);
    const [productCount] = await db.select({
      totalProducts: sql`count(*)::int`
    }).from(products).where(eq(products.isActive, true));
    const [customerCount] = await db.select({
      totalCustomers: sql`count(*)::int`
    }).from(customers).where(eq(customers.isActive, true));
    return {
      totalOrders: orderStats.totalOrders || 0,
      totalRevenue: orderStats.totalRevenue || "0",
      totalProducts: productCount.totalProducts || 0,
      totalCustomers: customerCount.totalCustomers || 0
    };
  }
  async getSalesData() {
    const result = await db.select({
      month: sql`to_char(order_date, 'Mon YYYY')`,
      revenue: sql`sum(total_amount)::numeric`
    }).from(orders).where(sql`order_date >= '2024-08-01'`).groupBy(sql`extract(year from order_date), extract(month from order_date), to_char(order_date, 'Mon YYYY')`).orderBy(sql`extract(year from order_date), extract(month from order_date)`);
    return result.map((row) => ({
      month: row.month,
      revenue: Number(row.revenue) || 0
    }));
  }
  async getOrderStatusDistribution() {
    const result = await db.select({
      status: orders.status,
      count: sql`count(*)::int`
    }).from(orders).groupBy(orders.status);
    return result.map((row) => ({
      status: row.status || "unknown",
      count: row.count || 0
    }));
  }
};
var storage = new DatabaseStorage();
async function registerRoutes(app2) {
  app2.get("/api/dashboard/kpis", async (req, res) => {
    try {
      const kpis = await storage.getDashboardKpis();
      res.json(kpis);
    } catch (error) {
      console.error("Error fetching KPIs:", error);
      res.status(500).json({ message: "Failed to fetch dashboard KPIs" });
    }
  });
  app2.get("/api/dashboard/sales", async (req, res) => {
    try {
      const salesData = await storage.getSalesData();
      res.json(salesData);
    } catch (error) {
      console.error("Error fetching sales data:", error);
      res.status(500).json({ message: "Failed to fetch sales data" });
    }
  });
  app2.get("/api/dashboard/order-status", async (req, res) => {
    try {
      const orderStatus = await storage.getOrderStatusDistribution();
      res.json(orderStatus);
    } catch (error) {
      console.error("Error fetching order status:", error);
      res.status(500).json({ message: "Failed to fetch order status distribution" });
    }
  });
  app2.get("/api/products", async (req, res) => {
    try {
      const products2 = await storage.getProducts();
      res.json(products2);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  app2.get("/api/products/:id", async (req, res) => {
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
  app2.post("/api/products", async (req, res) => {
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
  app2.put("/api/products/:id", async (req, res) => {
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
  app2.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });
  app2.get("/api/customers", async (req, res) => {
    try {
      const customers2 = await storage.getCustomers();
      res.json(customers2);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });
  app2.get("/api/customers/:id", async (req, res) => {
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
  app2.post("/api/customers", async (req, res) => {
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
  app2.put("/api/customers/:id", async (req, res) => {
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
  app2.delete("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCustomer(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });
  app2.get("/api/orders", async (req, res) => {
    try {
      const orders2 = await storage.getOrders();
      res.json(orders2);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  app2.get("/api/orders/:id", async (req, res) => {
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
    items: z.array(insertOrderItemSchema)
  });
  app2.post("/api/orders", async (req, res) => {
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
  app2.put("/api/orders/:id", async (req, res) => {
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
  app2.delete("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteOrder(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ message: "Failed to delete order" });
    }
  });
  app2.get("/api/inventory", async (req, res) => {
    try {
      const inventory2 = await storage.getInventory();
      res.json(inventory2);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });
  app2.get("/api/inventory/low-stock", async (req, res) => {
    try {
      const lowStockItems = await storage.getLowStockItems();
      res.json(lowStockItems);
    } catch (error) {
      console.error("Error fetching low stock items:", error);
      res.status(500).json({ message: "Failed to fetch low stock items" });
    }
  });
  app2.get("/api/integrations", async (req, res) => {
    try {
      const integrations = await storage.getErpIntegrations();
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching integrations:", error);
      res.status(500).json({ message: "Failed to fetch ERP integrations" });
    }
  });
  app2.post("/api/integrations", async (req, res) => {
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
  app2.put("/api/integrations/:id", async (req, res) => {
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
  app2.post("/api/integrations/:id/sync", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.updateErpIntegration(id, {
        lastSyncDate: /* @__PURE__ */ new Date(),
        syncStatus: "success"
      });
      res.json({ message: "Sync completed successfully" });
    } catch (error) {
      console.error("Error syncing integration:", error);
      res.status(500).json({ message: "Failed to sync ERP integration" });
    }
  });
  app2.delete("/api/clear-data", async (req, res) => {
    try {
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
  app2.post("/api/seed-data", async (req, res) => {
    try {
      const customers2 = [
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
      for (const customer of customers2) {
        const created = await storage.createCustomer(customer);
        createdCustomers.push(created);
      }
      const products2 = [
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
      for (const product of products2) {
        const created = await storage.createProduct(product);
        createdProducts.push(created);
      }
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
      for (const inventory2 of inventoryData) {
        await storage.updateInventory(inventory2.productId, inventory2);
      }
      const orders2 = [
        // August 2024
        {
          customerId: createdCustomers[0].id,
          orderNumber: "ORD-2024-008",
          orderDate: /* @__PURE__ */ new Date("2024-08-15"),
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
          orderDate: /* @__PURE__ */ new Date("2024-09-10"),
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
          orderDate: /* @__PURE__ */ new Date("2024-09-25"),
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
          orderDate: /* @__PURE__ */ new Date("2024-10-08"),
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
          orderDate: /* @__PURE__ */ new Date("2024-10-22"),
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
          orderDate: /* @__PURE__ */ new Date("2024-11-05"),
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
          orderDate: /* @__PURE__ */ new Date("2024-11-18"),
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
          orderDate: /* @__PURE__ */ new Date("2024-12-10"),
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
          orderDate: /* @__PURE__ */ new Date("2025-01-05"),
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
          orderDate: /* @__PURE__ */ new Date("2025-01-10"),
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
      for (const orderData of orders2) {
        const { items, ...order } = orderData;
        await storage.createOrder(order, items);
      }
      const integrations = [
        {
          name: "SAP Business One",
          type: "sap",
          status: "active",
          apiEndpoint: "https://api.sap.com/v1/businessone",
          syncStatus: "success",
          lastSyncDate: /* @__PURE__ */ new Date("2024-02-10T14:30:00Z"),
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
          lastSyncDate: /* @__PURE__ */ new Date("2024-02-10T12:15:00Z"),
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
          lastSyncDate: /* @__PURE__ */ new Date("2024-02-09T16:45:00Z"),
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
          lastSyncDate: /* @__PURE__ */ new Date("2024-02-10T13:20:00Z"),
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
          orders: orders2.length,
          integrations: integrations.length
        }
      });
    } catch (error) {
      console.error("Error seeding data:", error);
      res.status(500).json({ message: "Failed to seed mock data" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}
var app = express();
registerRoutes(app);
var handler = serverless(app);
export {
  handler
};
