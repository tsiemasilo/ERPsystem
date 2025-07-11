import {
  users,
  products,
  customers,
  orders,
  orderItems,
  inventory,
  erpIntegrations,
  type User,
  type InsertUser,
  type Product,
  type InsertProduct,
  type Customer,
  type InsertCustomer,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Inventory,
  type InsertInventory,
  type ErpIntegration,
  type InsertErpIntegration,
  type OrderWithCustomer,
  type ProductWithInventory,
  type InventoryWithProduct,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, sql, and, lt } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Product operations
  getProducts(): Promise<ProductWithInventory[]>;
  getProduct(id: number): Promise<ProductWithInventory | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Customer operations
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: number): Promise<void>;

  // Order operations
  getOrders(): Promise<OrderWithCustomer[]>;
  getOrder(id: number): Promise<OrderWithCustomer | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order>;
  deleteOrder(id: number): Promise<void>;

  // Inventory operations
  getInventory(): Promise<InventoryWithProduct[]>;
  getLowStockItems(): Promise<InventoryWithProduct[]>;
  updateInventory(productId: number, inventory: Partial<InsertInventory>): Promise<Inventory>;

  // ERP Integration operations
  getErpIntegrations(): Promise<ErpIntegration[]>;
  createErpIntegration(integration: InsertErpIntegration): Promise<ErpIntegration>;
  updateErpIntegration(id: number, integration: Partial<InsertErpIntegration>): Promise<ErpIntegration>;

  // Dashboard/Analytics operations
  getDashboardKpis(): Promise<{
    totalOrders: number;
    totalRevenue: string;
    totalProducts: number;
    totalCustomers: number;
  }>;
  getSalesData(): Promise<{ month: string; revenue: number }[]>;
  getOrderStatusDistribution(): Promise<{ status: string; count: number }[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Product operations
  async getProducts(): Promise<ProductWithInventory[]> {
    const result = await db
      .select()
      .from(products)
      .leftJoin(inventory, eq(products.id, inventory.productId))
      .orderBy(desc(products.createdAt));

    return result.map(({ products: product, inventory: inv }) => ({
      ...product,
      inventory: inv || undefined,
    }));
  }

  async getProduct(id: number): Promise<ProductWithInventory | undefined> {
    const [result] = await db
      .select()
      .from(products)
      .leftJoin(inventory, eq(products.id, inventory.productId))
      .where(eq(products.id, id));

    if (!result) return undefined;

    return {
      ...result.products,
      inventory: result.inventory || undefined,
    };
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();

    // Create initial inventory record
    await db.insert(inventory).values({
      productId: newProduct.id,
      quantityOnHand: 0,
      quantityReserved: 0,
      quantityAvailable: 0,
      reorderPoint: 10,
      locationCode: "MAIN",
    });

    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db
      .insert(customers)
      .values(customer)
      .returning();
    return newCustomer;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer> {
    const [updatedCustomer] = await db
      .update(customers)
      .set({ ...customer, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return updatedCustomer;
  }

  async deleteCustomer(id: number): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  // Order operations
  async getOrders(): Promise<OrderWithCustomer[]> {
    const result = await db
      .select()
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(products, eq(orderItems.productId, products.id))
      .orderBy(desc(orders.createdAt));

    // Group results by order
    const ordersMap = new Map<number, OrderWithCustomer>();

    result.forEach(({ orders: order, customers: customer, order_items: item, products: product }) => {
      if (!ordersMap.has(order.id)) {
        ordersMap.set(order.id, {
          ...order,
          customer: customer!,
          orderItems: [],
        });
      }

      if (item && product) {
        ordersMap.get(order.id)!.orderItems.push({
          ...item,
          product,
        });
      }
    });

    return Array.from(ordersMap.values());
  }

  async getOrder(id: number): Promise<OrderWithCustomer | undefined> {
    const result = await db
      .select()
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orders.id, id));

    if (result.length === 0) return undefined;

    const order = result[0].orders;
    const customer = result[0].customers!;
    const items = result
      .filter(r => r.order_items && r.products)
      .map(r => ({ ...r.order_items!, product: r.products! }));

    return {
      ...order,
      customer,
      orderItems: items,
    };
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const [newOrder] = await db
      .insert(orders)
      .values(order)
      .returning();

    // Insert order items
    const orderItemsWithOrderId = items.map(item => ({
      ...item,
      orderId: newOrder.id,
    }));

    await db.insert(orderItems).values(orderItemsWithOrderId);

    return newOrder;
  }

  async updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ ...order, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  async deleteOrder(id: number): Promise<void> {
    await db.delete(orderItems).where(eq(orderItems.orderId, id));
    await db.delete(orders).where(eq(orders.id, id));
  }

  // Inventory operations
  async getInventory(): Promise<InventoryWithProduct[]> {
    const result = await db
      .select()
      .from(inventory)
      .leftJoin(products, eq(inventory.productId, products.id))
      .orderBy(asc(inventory.quantityAvailable));

    return result.map(({ inventory: inv, products: product }) => ({
      ...inv,
      product: product!,
    }));
  }

  async getLowStockItems(): Promise<InventoryWithProduct[]> {
    const result = await db
      .select()
      .from(inventory)
      .leftJoin(products, eq(inventory.productId, products.id))
      .where(lt(inventory.quantityAvailable, inventory.reorderPoint))
      .orderBy(asc(inventory.quantityAvailable));

    return result.map(({ inventory: inv, products: product }) => ({
      ...inv,
      product: product!,
    }));
  }

  async updateInventory(productId: number, inventoryUpdate: Partial<InsertInventory>): Promise<Inventory> {
    const [updatedInventory] = await db
      .update(inventory)
      .set({ ...inventoryUpdate, updatedAt: new Date() })
      .where(eq(inventory.productId, productId))
      .returning();
    return updatedInventory;
  }

  // ERP Integration operations
  async getErpIntegrations(): Promise<ErpIntegration[]> {
    return await db.select().from(erpIntegrations).orderBy(desc(erpIntegrations.createdAt));
  }

  async createErpIntegration(integration: InsertErpIntegration): Promise<ErpIntegration> {
    const [newIntegration] = await db
      .insert(erpIntegrations)
      .values(integration)
      .returning();
    return newIntegration;
  }

  async updateErpIntegration(id: number, integration: Partial<InsertErpIntegration>): Promise<ErpIntegration> {
    const [updatedIntegration] = await db
      .update(erpIntegrations)
      .set({ ...integration, updatedAt: new Date() })
      .where(eq(erpIntegrations.id, id))
      .returning();
    return updatedIntegration;
  }

  // Dashboard/Analytics operations
  async getDashboardKpis(): Promise<{
    totalOrders: number;
    totalRevenue: string;
    totalProducts: number;
    totalCustomers: number;
  }> {
    const [orderStats] = await db
      .select({
        totalOrders: sql<number>`count(*)::int`,
        totalRevenue: sql<string>`sum(total_amount)::text`,
      })
      .from(orders);

    const [productCount] = await db
      .select({
        totalProducts: sql<number>`count(*)::int`,
      })
      .from(products)
      .where(eq(products.isActive, true));

    const [customerCount] = await db
      .select({
        totalCustomers: sql<number>`count(*)::int`,
      })
      .from(customers)
      .where(eq(customers.isActive, true));

    return {
      totalOrders: orderStats.totalOrders || 0,
      totalRevenue: orderStats.totalRevenue || "0",
      totalProducts: productCount.totalProducts || 0,
      totalCustomers: customerCount.totalCustomers || 0,
    };
  }

  async getSalesData(): Promise<{ month: string; revenue: number }[]> {
    const result = await db
      .select({
        month: sql<string>`to_char(order_date, 'Mon YYYY')`,
        revenue: sql<number>`sum(total_amount)::numeric`,
      })
      .from(orders)
      .where(sql`order_date >= '2024-08-01'`)
      .groupBy(sql`extract(year from order_date), extract(month from order_date), to_char(order_date, 'Mon YYYY')`)
      .orderBy(sql`extract(year from order_date), extract(month from order_date)`);

    return result.map(row => ({
      month: row.month,
      revenue: Number(row.revenue) || 0,
    }));
  }

  async getOrderStatusDistribution(): Promise<{ status: string; count: number }[]> {
    const result = await db
      .select({
        status: orders.status,
        count: sql<number>`count(*)::int`,
      })
      .from(orders)
      .groupBy(orders.status);

    return result.map(row => ({
      status: row.status || 'unknown',
      count: row.count || 0,
    }));
  }
}

export const storage = new DatabaseStorage();
