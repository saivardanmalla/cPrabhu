import { Router, Request, Response } from 'express';
import { db } from './db';
import { cognitiveEngine } from './cognitive';
import { OrderStatus } from '../src/types';

export const apiRouter = Router();

// Health Check
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    platform: 'Clickit AI Quick-Commerce',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Categories
apiRouter.get('/categories', async (req: Request, res: Response) => {
  res.json({ success: true, data: await db.getCategories() });
});

// Stores
apiRouter.get('/stores', async (req: Request, res: Response) => {
  res.json({ success: true, data: await db.getStores() });
});

// Coupons
apiRouter.get('/coupons', async (req: Request, res: Response) => {
  res.json({ success: true, data: await db.getCoupons() });
});

// Products
apiRouter.get('/products', async (req: Request, res: Response) => {
  const category = req.query.category as string | undefined;
  const q = req.query.q as string | undefined;
  const storeId = (req.query.storeId as string) || 'store-blr-01';

  const products = await db.getProducts(category, q, storeId);
  res.json({ success: true, count: products.length, data: products });
});

apiRouter.get('/products/:id', async (req: Request, res: Response) => {
  const product = await db.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found' } });
  }
  res.json({ success: true, data: product });
});

// Calculate Cart with Server-Side Verification
apiRouter.post('/cart/calculate', async (req: Request, res: Response) => {
  const { items, couponCode, storeId = 'store-blr-01' } = req.body;

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_CART', message: 'Cart items required' } });
  }

  let subtotal = 0;
  let mrpTotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    const product = await db.getProductById(item.productId);
    if (!product) continue;

    const effStoreId = storeId.startsWith('detected-') ? 'store-blr-01' : storeId;
    const available = product.storeInventory[effStoreId] ?? 0;
    const requestedQty = item.quantity;
    const verifiedQty = Math.min(requestedQty, available);

    const itemTotal = product.sellingPrice * requestedQty;
    const itemMrpTotal = product.mrp * requestedQty;

    subtotal += itemTotal;
    mrpTotal += itemMrpTotal;

    verifiedItems.push({
      product,
      quantity: requestedQty,
      inStock: available >= requestedQty,
      availableStock: available,
      price: product.sellingPrice,
      mrp: product.mrp,
    });
  }

  let discount = mrpTotal - subtotal;
  let couponDiscount = 0;

  if (couponCode) {
    const coupons = await db.getCoupons();
    const coupon = coupons.find((c) => c.code.toUpperCase() === couponCode.toUpperCase());
    if (coupon && subtotal >= coupon.minOrderValue) {
      if (coupon.discountType === 'FLAT') {
        couponDiscount = coupon.value;
      } else {
        couponDiscount = Math.round((subtotal * coupon.value) / 100);
      }
    }
  }

  const deliveryFee = subtotal > 199 || couponCode === 'FREEDEL' ? 0 : 25;
  const handlingFee = subtotal > 0 ? 4 : 0;
  const total = Math.max(0, subtotal - couponDiscount + deliveryFee + handlingFee);

  res.json({
    success: true,
    data: {
      items: verifiedItems,
      subtotal,
      mrpTotal,
      mrpSavings: discount,
      couponDiscount,
      deliveryFee,
      handlingFee,
      total,
      eligibleForFreeDelivery: subtotal > 199,
      freeDeliveryThreshold: 199,
    },
  });
});

// Orders
apiRouter.get('/orders', async (req: Request, res: Response) => {
  res.json({ success: true, data: await db.getOrders() });
});

apiRouter.get('/orders/:id', async (req: Request, res: Response) => {
  const order = await db.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, error: { code: 'ORDER_NOT_FOUND', message: 'Order not found' } });
  }
  res.json({ success: true, data: order });
});

apiRouter.post('/orders', async (req: Request, res: Response) => {
  const { customerName, customerPhone, storeId, items, deliveryAddress, paymentMethod, couponCode } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ success: false, error: { code: 'EMPTY_ORDER', message: 'Order must contain at least 1 item' } });
  }

  // Calculate totals on backend
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const prod = await db.getProductById(item.productId);
    if (!prod) continue;
    orderItems.push({
      productId: prod.id,
      name: prod.name,
      brand: prod.brand,
      price: prod.sellingPrice,
      mrp: prod.mrp,
      quantity: item.quantity,
      image: prod.image,
      unit: prod.unit,
    });
    subtotal += prod.sellingPrice * item.quantity;
  }

  let couponDiscount = 0;
  if (couponCode) {
    const coupons = await db.getCoupons();
    const coupon = coupons.find((c) => c.code.toUpperCase() === couponCode.toUpperCase());
    if (coupon && subtotal >= coupon.minOrderValue) {
      couponDiscount = coupon.discountType === 'FLAT' ? coupon.value : Math.round((subtotal * coupon.value) / 100);
    }
  }

  const deliveryFee = subtotal > 199 || couponCode === 'FREEDEL' ? 0 : 25;
  const handlingFee = 4;
  const total = Math.max(0, subtotal - couponDiscount + deliveryFee + handlingFee);

  const stores = await db.getStores();
  const store = stores.find((s) => s.id === storeId) || stores[0];

  const result = await db.createOrder({
    customerId: 'usr-current',
    customerName: customerName || 'Valued Customer',
    customerPhone: customerPhone || '+91 98765 43210',
    storeId: store.id,
    storeName: store.name,
    items: orderItems,
    subtotal,
    discount: couponDiscount,
    couponCode,
    deliveryFee,
    handlingFee,
    total,
    status: 'CONFIRMED',
    deliveryAddress: deliveryAddress || {
      id: 'addr-default',
      label: 'Home',
      street: '12th Main Road, Sector 3',
      area: 'Koramangala',
      city: 'Bengaluru',
      pincode: '560034',
      coordinates: { lat: 12.9352, lng: 77.6245 },
    },
    paymentMethod: paymentMethod || 'UPI',
    paymentStatus: 'PAID',
    deliveryPartner: {
      id: 'del-p-01',
      name: 'Vikas Patel',
      phone: '+91 98112 33445',
      vehicleType: 'Electric Scooter (KA-03-EV-7819)',
      rating: 4.9,
      currentLocation: store.coordinates,
    },
    estimatedDeliveryTime: `in ${store.etaMinutes} mins`,
  });

  if (!result.success) {
    return res.status(409).json({ success: false, error: { code: 'INSUFFICIENT_STOCK', message: result.error } });
  }

  res.status(201).json({ success: true, data: result.order });
});

// Update Order Status
apiRouter.patch('/orders/:id/status', async (req: Request, res: Response) => {
  const { status, note } = req.body as { status: OrderStatus; note?: string };
  const updated = await db.updateOrderStatus(req.params.id, status, note);
  if (!updated) {
    return res.status(404).json({ success: false, error: { code: 'ORDER_NOT_FOUND', message: 'Order not found' } });
  }
  res.json({ success: true, data: updated });
});

// Store Inventory Adjustments
apiRouter.post('/inventory/adjust', async (req: Request, res: Response) => {
  const { productId, storeId, newStock } = req.body;
  if (!productId || !storeId || typeof newStock !== 'number') {
    return res.status(400).json({ success: false, error: { code: 'INVALID_REQUEST', message: 'productId, storeId, and newStock required' } });
  }

  const ok = await db.updateProductStock(productId, storeId, newStock);
  if (!ok) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
  }

  res.json({ success: true, message: 'Stock updated successfully' });
});

// Clickit AI Assistant & Multi-Agent Engine
apiRouter.post('/ai/assistant', async (req: Request, res: Response) => {
  try {
    const { query, storeId, cartItemsCount } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_QUERY', message: 'Query is required' } });
    }

    const output = await cognitiveEngine.processQuery({
      query,
      storeId,
      cartItemsCount,
    });

    res.json({
      success: true,
      data: {
        response: output.response,
        trace: output.trace,
        products: output.products || [],
      },
    });
  } catch (err: any) {
    console.error('AI assistant error:', err);
    res.status(500).json({ success: false, error: { code: 'AI_ERROR', message: err.message || 'Internal AI error' } });
  }
});

// Agent Traces
apiRouter.get('/agents/traces', async (req: Request, res: Response) => {
  res.json({ success: true, data: await db.getAgentTraces() });
});

// Intelligence
apiRouter.get('/intelligence/forecasts', async (req: Request, res: Response) => {
  res.json({ success: true, data: await db.getForecasts() });
});

apiRouter.get('/intelligence/anomalies', async (req: Request, res: Response) => {
  res.json({ success: true, data: await db.getAnomalies() });
});

apiRouter.post('/intelligence/anomalies/:id/resolve', async (req: Request, res: Response) => {
  const resolved = await db.resolveAnomaly(req.params.id);
  res.json({ success: resolved });
});

// Event Stream
apiRouter.get('/events', async (req: Request, res: Response) => {
  res.json({ success: true, data: await db.getEventStream() });
});
