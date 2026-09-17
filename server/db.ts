import { Pool } from 'pg';
import { Product, Store, Category, Order, OrderStatus, Coupon, AgentTrace, ForecastItem, AnomalySignal, Address } from '../src/types';
import { SEED_STORES, SEED_CATEGORIES, SEED_PRODUCTS, SEED_COUPONS, SEED_FORECASTS, SEED_ANOMALIES } from '../src/data/seedData';

export interface AuditLog {
  id: string;
  timestamp: string;
  eventType: string;
  entityId: string;
  details: Record<string, any>;
}

// Helper: convert a DB product row to the Product type
function rowToProduct(row: any): Product {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    brand: row.brand,
    category: row.category,
    subcategory: row.subcategory,
    description: row.description,
    mrp: parseFloat(row.mrp),
    sellingPrice: parseFloat(row.selling_price),
    discountPercentage: parseFloat(row.discount_percentage),
    unit: row.unit,
    weight: row.weight,
    rating: parseFloat(row.rating),
    reviewsCount: row.reviews_count,
    tags: row.tags || [],
    image: row.image,
    isVegetarian: row.is_vegetarian,
    shelfLife: row.shelf_life,
    countryOfOrigin: row.country_of_origin,
    inStock: row.in_stock,
    storeInventory: row.store_inventory || {},
  };
}

function rowToStore(row: any): Store {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    address: row.address,
    zone: row.zone,
    etaMinutes: row.eta_minutes,
    isActive: row.is_active,
    coordinates: row.coordinates || { lat: 0, lng: 0 },
    operationalHours: row.operational_hours,
  };
}

function rowToCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    icon: row.icon,
    bannerColor: row.banner_color,
    itemCount: row.item_count,
  };
}

function rowToCoupon(row: any): Coupon {
  return {
    code: row.code,
    discountType: row.discount_type,
    value: parseFloat(row.value),
    minOrderValue: parseFloat(row.min_order_value),
    description: row.description,
  };
}

function rowToOrder(row: any): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    storeId: row.store_id,
    storeName: row.store_name,
    items: row.items || [],
    subtotal: parseFloat(row.subtotal),
    discount: parseFloat(row.discount),
    couponCode: row.coupon_code,
    deliveryFee: parseFloat(row.delivery_fee),
    handlingFee: parseFloat(row.handling_fee),
    total: parseFloat(row.total),
    status: row.status,
    deliveryAddress: row.delivery_address || {},
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    deliveryPartner: row.delivery_partner || undefined,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    estimatedDeliveryTime: row.estimated_delivery_time,
    deliveredAt: row.delivered_at ? (row.delivered_at instanceof Date ? row.delivered_at.toISOString() : row.delivered_at) : undefined,
    statusHistory: row.status_history || [],
  };
}

function rowToForecast(row: any): ForecastItem {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    productName: row.product_name,
    category: row.category,
    storeId: row.store_id,
    currentStock: row.current_stock,
    hourlyDemandRate: row.hourly_demand_rate ? parseFloat(row.hourly_demand_rate) : undefined,
    hoursUntilStockout: parseFloat(row.hours_until_stockout),
    stockoutRisk: row.stockout_risk,
    predictedTomorrowDemand: row.predicted_tomorrow_demand,
    recommendedReplenish: row.recommended_replenish,
    recommendedRestockQuantity: row.recommended_restock_quantity,
    historicalDemand: row.historical_demand || [],
  };
}

function rowToAnomaly(row: any): AnomalySignal {
  return {
    id: row.id,
    type: row.type,
    severity: row.severity,
    title: row.title,
    description: row.description,
    timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : row.timestamp,
    detectedAt: row.detected_at ? (row.detected_at instanceof Date ? row.detected_at.toISOString() : row.detected_at) : undefined,
    impactScore: row.impact_score ? parseFloat(row.impact_score) : undefined,
    actionRecommended: row.action_recommended,
    resolved: row.resolved,
    storeId: row.store_id,
    metadata: row.metadata || {},
  };
}

function rowToAgentTrace(row: any): AgentTrace {
  return {
    id: row.id,
    timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : row.timestamp,
    query: row.query,
    perception: row.perception || {},
    workingMemory: row.working_memory || {},
    reasoning: row.reasoning,
    plan: row.plan || [],
    selectedAgents: row.selected_agents || [],
    toolsCalled: row.tools_called || [],
    decision: row.decision,
    verification: row.verification || {},
    finalResponse: row.final_response,
    recommendedProducts: row.recommended_products || [],
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// In-Memory Fallback Database (uses seed data — no PostgreSQL required)
// ──────────────────────────────────────────────────────────────────────────────

class InMemoryDatabase {
  private products: Product[];
  private stores: Store[];
  private categories: Category[];
  private coupons: Coupon[];
  private forecasts: ForecastItem[];
  private anomalies: AnomalySignal[];
  private orders: Order[] = [];
  private agentTraces: AgentTrace[] = [];
  private eventStream: { id: string; event: string; payload: any; timestamp: string }[] = [];

  constructor() {
    this.products = JSON.parse(JSON.stringify(SEED_PRODUCTS));
    this.stores = JSON.parse(JSON.stringify(SEED_STORES));
    this.categories = JSON.parse(JSON.stringify(SEED_CATEGORIES));
    this.coupons = JSON.parse(JSON.stringify(SEED_COUPONS));
    this.forecasts = JSON.parse(JSON.stringify(SEED_FORECASTS));
    this.anomalies = JSON.parse(JSON.stringify(SEED_ANOMALIES));
    console.log('✅ In-memory database initialized with seed data (PostgreSQL unavailable)');
  }

  getProducts(category?: string, query?: string, storeId = 'store-blr-01'): Product[] {
    let results = this.products;
    if (category && category !== 'all') {
      results = results.filter((p) => p.category === category);
    }
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          (p.subcategory && p.subcategory.toLowerCase().includes(q)) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }
    return results.map((p) => {
      const effStoreId = storeId.startsWith('detected-') ? 'store-blr-01' : storeId;
      const stock = p.storeInventory[effStoreId] ?? 0;
      return { ...p, inStock: stock > 0 };
    });
  }

  getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id || p.sku === id);
  }

  getCategories(): Category[] {
    return this.categories;
  }

  getStores(): Store[] {
    return this.stores;
  }

  getCoupons(): Coupon[] {
    return this.coupons;
  }

  updateProductStock(productId: string, storeId: string, newStock: number): boolean {
    const product = this.products.find((p) => p.id === productId);
    if (!product) return false;
    product.storeInventory[storeId] = Math.max(0, newStock);
    product.inStock = Object.values(product.storeInventory).some((qty) => qty > 0);
    this.logEvent('InventoryManualAdjustment', { productId, storeId, newStock });
    return true;
  }

  getOrders(): Order[] {
    return [...this.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrderById(id: string): Order | undefined {
    return this.orders.find((o) => o.id === id || o.orderNumber === id);
  }

  createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'statusHistory'>): { success: boolean; order?: Order; error?: string } {
    // Validate stock
    for (const item of orderData.items) {
      const product = this.products.find((p) => p.id === item.productId);
      if (!product) continue;
      const effStoreId = orderData.storeId.startsWith('detected-') ? 'store-blr-01' : orderData.storeId;
      const available = product.storeInventory[effStoreId] ?? 0;
      if (available < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${product.name}". Requested: ${item.quantity}, Available: ${available}`,
        };
      }
    }

    // Deduct stock
    for (const item of orderData.items) {
      const product = this.products.find((p) => p.id === item.productId);
      if (!product) continue;
      const effStoreId = orderData.storeId.startsWith('detected-') ? 'store-blr-01' : orderData.storeId;
      product.storeInventory[effStoreId] = Math.max(0, (product.storeInventory[effStoreId] ?? 0) - item.quantity);
      product.inStock = Object.values(product.storeInventory).some((qty) => qty > 0);
    }

    const newId = `ord-${Date.now()}`;
    const orderNumber = `CKT-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString();
    const statusHistory: { status: OrderStatus; timestamp: string; note: string }[] = [
      { status: 'CREATED', timestamp: now, note: 'Order placed' },
      { status: 'CONFIRMED', timestamp: now, note: 'Payment verified & dark store notified' },
    ];

    const order: Order = {
      ...orderData,
      id: newId,
      orderNumber,
      createdAt: now,
      status: 'CONFIRMED',
      estimatedDeliveryTime: 'in 9-11 mins',
      statusHistory,
    };

    this.orders.push(order);
    this.logEvent('OrderCreated', { orderId: order.id, orderNumber: order.orderNumber, total: order.total, itemCount: order.items.length, storeId: order.storeId });
    return { success: true, order };
  }

  updateOrderStatus(orderId: string, newStatus: OrderStatus, note?: string): Order | undefined {
    const order = this.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return undefined;

    if (newStatus === 'CANCELLED' && order.status !== 'DELIVERED') {
      for (const item of order.items) {
        const product = this.products.find((p) => p.id === item.productId);
        if (product) {
          product.storeInventory[order.storeId] = (product.storeInventory[order.storeId] || 0) + item.quantity;
          product.inStock = true;
        }
      }
      order.paymentStatus = 'REFUNDED';
    }

    order.status = newStatus;
    const now = new Date().toISOString();
    order.statusHistory.push({
      status: newStatus,
      timestamp: now,
      note: note || `Order transitioned to ${newStatus}`,
    });

    if (newStatus === 'DELIVERED') {
      order.deliveredAt = now;
      order.estimatedDeliveryTime = 'Delivered';
    }

    this.logEvent('OrderStatusUpdated', { orderId: order.id, newStatus, timestamp: now });
    return order;
  }

  recordAgentTrace(trace: AgentTrace) {
    this.agentTraces.unshift(trace);
    if (this.agentTraces.length > 50) this.agentTraces = this.agentTraces.slice(0, 50);
  }

  getAgentTraces(): AgentTrace[] {
    return this.agentTraces;
  }

  getForecasts(): ForecastItem[] {
    return this.forecasts;
  }

  getAnomalies(): AnomalySignal[] {
    return this.anomalies;
  }

  resolveAnomaly(id: string): boolean {
    const anomaly = this.anomalies.find((a) => a.id === id);
    if (!anomaly) return false;
    anomaly.resolved = true;
    return true;
  }

  logEvent(event: string, payload: any) {
    const entry = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      event,
      payload,
      timestamp: new Date().toISOString(),
    };
    this.eventStream.unshift(entry);
    if (this.eventStream.length > 100) this.eventStream = this.eventStream.slice(0, 100);
  }

  getEventStream() {
    return this.eventStream;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// PostgreSQL Database (used when a PG connection is available)
// ──────────────────────────────────────────────────────────────────────────────

class PostgresDatabase {
  private pool: Pool;
  private ready: Promise<void>;

  constructor() {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/clickit';
    this.pool = new Pool({ connectionString });
    this.ready = this.initialize();
  }

  private async initialize() {
    try {
      const client = await this.pool.connect();
      // Quick check: see if tables exist
      const result = await client.query(
        `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products')`
      );
      client.release();
      if (!result.rows[0].exists) {
        console.warn('⚠️  PostgreSQL tables not found. Run: npm run db:setup && npm run db:seed');
      } else {
        console.log('✅ PostgreSQL connected to Clickit database');
      }
    } catch (err) {
      console.error('❌ PostgreSQL connection failed:', err);
      console.warn('⚠️  Falling back will not work — please ensure PostgreSQL is running.');
    }
  }

  // --- Products & Search ---
  async getProducts(category?: string, query?: string, storeId = 'store-blr-01'): Promise<Product[]> {
    await this.ready;
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];
    let idx = 1;

    if (category && category !== 'all') {
      sql += ` AND category = $${idx++}`;
      params.push(category);
    }
    if (query && query.trim()) {
      const q = `%${query.toLowerCase().trim()}%`;
      sql += ` AND (LOWER(name) LIKE $${idx} OR LOWER(brand) LIKE $${idx} OR LOWER(subcategory) LIKE $${idx} OR EXISTS (SELECT 1 FROM unnest(tags) AS t WHERE LOWER(t) LIKE $${idx}))`;
      params.push(q);
      idx++;
    }

    const result = await this.pool.query(sql, params);
    return result.rows.map((row) => {
      const product = rowToProduct(row);
      const stock = product.storeInventory[storeId] ?? 0;
      return { ...product, inStock: stock > 0 };
    });
  }

  async getProductById(id: string): Promise<Product | undefined> {
    await this.ready;
    const result = await this.pool.query('SELECT * FROM products WHERE id = $1 OR sku = $1', [id]);
    return result.rows.length > 0 ? rowToProduct(result.rows[0]) : undefined;
  }

  async getCategories(): Promise<Category[]> {
    await this.ready;
    const result = await this.pool.query('SELECT * FROM categories');
    return result.rows.map(rowToCategory);
  }

  async getStores(): Promise<Store[]> {
    await this.ready;
    const result = await this.pool.query('SELECT * FROM stores');
    return result.rows.map(rowToStore);
  }

  async getCoupons(): Promise<Coupon[]> {
    await this.ready;
    const result = await this.pool.query('SELECT * FROM coupons');
    return result.rows.map(rowToCoupon);
  }

  // --- Inventory ACID Transactions ---
  async checkAndReserveStock(items: { productId: string; quantity: number }[], storeId: string): Promise<{ success: boolean; error?: string }> {
    await this.ready;
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Verify all items have enough stock
      for (const item of items) {
        const result = await client.query('SELECT * FROM products WHERE id = $1 FOR UPDATE', [item.productId]);
        if (result.rows.length === 0) {
          await client.query('ROLLBACK');
          return { success: false, error: `Product ID ${item.productId} not found.` };
        }
        const product = rowToProduct(result.rows[0]);
        const available = product.storeInventory[storeId] ?? 0;
        if (available < item.quantity) {
          await client.query('ROLLBACK');
          return {
            success: false,
            error: `Insufficient stock for "${product.name}". Requested: ${item.quantity}, Available in ${storeId}: ${available}`,
          };
        }
      }

      // 2. Deduct atomically
      for (const item of items) {
        const result = await client.query('SELECT * FROM products WHERE id = $1 FOR UPDATE', [item.productId]);
        const product = rowToProduct(result.rows[0]);
        const newStock = Math.max(0, (product.storeInventory[storeId] ?? 0) - item.quantity);
        product.storeInventory[storeId] = newStock;
        const inStock = Object.values(product.storeInventory).some((qty) => qty > 0);

        await client.query(
          'UPDATE products SET store_inventory = $1, in_stock = $2 WHERE id = $3',
          [JSON.stringify(product.storeInventory), inStock, item.productId]
        );

        await this.logEventInternal(client, 'InventoryChanged', {
          productId: product.id,
          sku: product.sku,
          storeId,
          delta: -item.quantity,
          remaining: newStock,
        });
      }

      await client.query('COMMIT');
      return { success: true };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async restoreStock(items: { productId: string; quantity: number }[], storeId: string) {
    await this.ready;
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      for (const item of items) {
        const result = await client.query('SELECT * FROM products WHERE id = $1 FOR UPDATE', [item.productId]);
        if (result.rows.length > 0) {
          const product = rowToProduct(result.rows[0]);
          product.storeInventory[storeId] = (product.storeInventory[storeId] || 0) + item.quantity;
          const inStock = Object.values(product.storeInventory).some((qty) => qty > 0);

          await client.query(
            'UPDATE products SET store_inventory = $1, in_stock = $2 WHERE id = $3',
            [JSON.stringify(product.storeInventory), inStock, item.productId]
          );

          await this.logEventInternal(client, 'InventoryRestored', {
            productId: product.id,
            storeId,
            restoredQuantity: item.quantity,
            newStock: product.storeInventory[storeId],
          });
        }
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async updateProductStock(productId: string, storeId: string, newStock: number): Promise<boolean> {
    await this.ready;
    const result = await this.pool.query('SELECT * FROM products WHERE id = $1', [productId]);
    if (result.rows.length === 0) return false;

    const product = rowToProduct(result.rows[0]);
    product.storeInventory[storeId] = Math.max(0, newStock);
    const inStock = Object.values(product.storeInventory).some((qty) => qty > 0);

    await this.pool.query(
      'UPDATE products SET store_inventory = $1, in_stock = $2 WHERE id = $3',
      [JSON.stringify(product.storeInventory), inStock, productId]
    );
    await this.logEvent('InventoryManualAdjustment', { productId, storeId, newStock });
    return true;
  }

  // --- Orders ---
  async getOrders(): Promise<Order[]> {
    await this.ready;
    const result = await this.pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    return result.rows.map(rowToOrder);
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    await this.ready;
    const result = await this.pool.query('SELECT * FROM orders WHERE id = $1 OR order_number = $1', [id]);
    return result.rows.length > 0 ? rowToOrder(result.rows[0]) : undefined;
  }

  async createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'statusHistory'>): Promise<{ success: boolean; order?: Order; error?: string }> {
    await this.ready;
    // 1. Validate and reserve inventory
    const reservation = await this.checkAndReserveStock(
      orderData.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      orderData.storeId
    );

    if (!reservation.success) {
      return { success: false, error: reservation.error };
    }

    const newId = `ord-${Date.now()}`;
    const orderNumber = `CKT-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString();
    const statusHistory: { status: OrderStatus; timestamp: string; note: string }[] = [
      { status: 'CREATED', timestamp: now, note: 'Order placed' },
      { status: 'CONFIRMED', timestamp: now, note: 'Payment verified & dark store notified' },
    ];

    const order: Order = {
      ...orderData,
      id: newId,
      orderNumber,
      createdAt: now,
      status: 'CONFIRMED',
      estimatedDeliveryTime: 'in 9-11 mins',
      statusHistory,
    };

    await this.pool.query(
      `INSERT INTO orders (id, order_number, customer_id, customer_name, customer_phone, store_id, store_name, items, subtotal, discount, coupon_code, delivery_fee, handling_fee, total, status, delivery_address, payment_method, payment_status, delivery_partner, created_at, estimated_delivery_time, status_history)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
      [
        order.id, order.orderNumber, order.customerId, order.customerName, order.customerPhone,
        order.storeId, order.storeName, JSON.stringify(order.items),
        order.subtotal, order.discount, order.couponCode || null,
        order.deliveryFee, order.handlingFee, order.total,
        order.status, JSON.stringify(order.deliveryAddress),
        order.paymentMethod, order.paymentStatus,
        order.deliveryPartner ? JSON.stringify(order.deliveryPartner) : null,
        order.createdAt, order.estimatedDeliveryTime, JSON.stringify(order.statusHistory),
      ]
    );

    await this.logEvent('OrderCreated', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      itemCount: order.items.length,
      storeId: order.storeId,
    });

    return { success: true, order };
  }

  async updateOrderStatus(orderId: string, newStatus: OrderStatus, note?: string): Promise<Order | undefined> {
    await this.ready;
    const result = await this.pool.query('SELECT * FROM orders WHERE id = $1 OR order_number = $1', [orderId]);
    if (result.rows.length === 0) return undefined;

    const order = rowToOrder(result.rows[0]);

    // Handle cancellation — restore stock
    if (newStatus === 'CANCELLED' && order.status !== 'DELIVERED') {
      await this.restoreStock(
        order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        order.storeId
      );
      order.paymentStatus = 'REFUNDED';
    }

    order.status = newStatus;
    const now = new Date().toISOString();
    order.statusHistory.push({
      status: newStatus,
      timestamp: now,
      note: note || `Order transitioned to ${newStatus}`,
    });

    if (newStatus === 'DELIVERED') {
      order.deliveredAt = now;
      order.estimatedDeliveryTime = 'Delivered';
    }

    await this.pool.query(
      `UPDATE orders SET status = $1, payment_status = $2, status_history = $3, delivered_at = $4, estimated_delivery_time = $5 WHERE id = $6`,
      [order.status, order.paymentStatus, JSON.stringify(order.statusHistory), order.deliveredAt || null, order.estimatedDeliveryTime, order.id]
    );

    await this.logEvent('OrderStatusUpdated', { orderId: order.id, newStatus, timestamp: now });

    return order;
  }

  // --- Agents & Traces ---
  async recordAgentTrace(trace: AgentTrace) {
    await this.ready;
    await this.pool.query(
      `INSERT INTO agent_traces (id, timestamp, query, perception, working_memory, reasoning, plan, selected_agents, tools_called, decision, verification, final_response, recommended_products)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        trace.id, trace.timestamp, trace.query,
        JSON.stringify(trace.perception), JSON.stringify(trace.workingMemory),
        trace.reasoning, JSON.stringify(trace.plan), JSON.stringify(trace.selectedAgents),
        JSON.stringify(trace.toolsCalled), trace.decision, JSON.stringify(trace.verification),
        trace.finalResponse, JSON.stringify(trace.recommendedProducts || []),
      ]
    );

    // Keep only latest 50
    await this.pool.query(
      `DELETE FROM agent_traces WHERE id NOT IN (SELECT id FROM agent_traces ORDER BY timestamp DESC LIMIT 50)`
    );
  }

  async getAgentTraces(): Promise<AgentTrace[]> {
    await this.ready;
    const result = await this.pool.query('SELECT * FROM agent_traces ORDER BY timestamp DESC LIMIT 50');
    return result.rows.map(rowToAgentTrace);
  }

  // --- Intelligence & Forecasts ---
  async getForecasts(): Promise<ForecastItem[]> {
    await this.ready;
    const result = await this.pool.query('SELECT * FROM forecasts');
    return result.rows.map(rowToForecast);
  }

  async getAnomalies(): Promise<AnomalySignal[]> {
    await this.ready;
    const result = await this.pool.query('SELECT * FROM anomalies');
    return result.rows.map(rowToAnomaly);
  }

  async resolveAnomaly(id: string): Promise<boolean> {
    await this.ready;
    const result = await this.pool.query('UPDATE anomalies SET resolved = TRUE WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // --- Event Stream & Audits ---
  private async logEventInternal(client: any, event: string, payload: any) {
    const id = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await client.query(
      'INSERT INTO event_stream (id, event, payload, timestamp) VALUES ($1, $2, $3, NOW())',
      [id, event, JSON.stringify(payload)]
    );
  }

  async logEvent(event: string, payload: any) {
    await this.ready;
    const id = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await this.pool.query(
      'INSERT INTO event_stream (id, event, payload, timestamp) VALUES ($1, $2, $3, NOW())',
      [id, event, JSON.stringify(payload)]
    );

    // Keep only latest 100
    await this.pool.query(
      `DELETE FROM event_stream WHERE id NOT IN (SELECT id FROM event_stream ORDER BY timestamp DESC LIMIT 100)`
    );
  }

  async getEventStream() {
    await this.ready;
    const result = await this.pool.query('SELECT * FROM event_stream ORDER BY timestamp DESC LIMIT 100');
    return result.rows.map((row) => ({
      id: row.id,
      event: row.event,
      payload: row.payload,
      timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : row.timestamp,
    }));
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Auto-detect: try PostgreSQL, fall back to in-memory
// ──────────────────────────────────────────────────────────────────────────────

async function createDatabase(): Promise<InMemoryDatabase | PostgresDatabase> {
  try {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/clickit';
    const testPool = new Pool({ connectionString });
    const client = await testPool.connect();
    client.release();
    await testPool.end();
    return new PostgresDatabase();
  } catch {
    console.warn('⚠️  PostgreSQL not available — using in-memory database with seed data.');
    return new InMemoryDatabase();
  }
}

// Export a synchronous fallback immediately; replaced once async check completes
export let db: InMemoryDatabase | PostgresDatabase = new InMemoryDatabase();

createDatabase().then((instance) => {
  db = instance;
});
