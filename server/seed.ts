import 'dotenv/config';
import { Pool } from 'pg';
import { SEED_STORES, SEED_CATEGORIES, SEED_PRODUCTS, SEED_COUPONS, SEED_FORECASTS, SEED_ANOMALIES } from '../src/data/seedData';

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  console.log('🌱 Seeding Clickit database...\n');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Clear existing data
    await client.query('DELETE FROM event_stream');
    await client.query('DELETE FROM agent_traces');
    await client.query('DELETE FROM orders');
    await client.query('DELETE FROM forecasts');
    await client.query('DELETE FROM anomalies');
    await client.query('DELETE FROM products');
    await client.query('DELETE FROM coupons');
    await client.query('DELETE FROM categories');
    await client.query('DELETE FROM stores');
    console.log('  ✓ Cleared existing data');

    // Seed Stores
    for (const s of SEED_STORES) {
      await client.query(
        `INSERT INTO stores (id, name, code, address, zone, eta_minutes, is_active, coordinates, operational_hours)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [s.id, s.name, s.code, s.address, s.zone, s.etaMinutes, s.isActive, JSON.stringify(s.coordinates), s.operationalHours]
      );
    }
    console.log(`  ✓ Seeded ${SEED_STORES.length} stores`);

    // Seed Categories
    for (const c of SEED_CATEGORIES) {
      await client.query(
        `INSERT INTO categories (id, name, slug, icon, banner_color, item_count)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [c.id, c.name, c.slug, c.icon, c.bannerColor, c.itemCount]
      );
    }
    console.log(`  ✓ Seeded ${SEED_CATEGORIES.length} categories`);

    // Seed Products
    for (const p of SEED_PRODUCTS) {
      await client.query(
        `INSERT INTO products (id, sku, name, brand, category, subcategory, description, mrp, selling_price, discount_percentage, unit, weight, rating, reviews_count, tags, image, is_vegetarian, shelf_life, country_of_origin, in_stock, store_inventory)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
        [
          p.id, p.sku, p.name, p.brand, p.category, p.subcategory, p.description,
          p.mrp, p.sellingPrice, p.discountPercentage, p.unit, p.weight,
          p.rating, p.reviewsCount, p.tags, p.image,
          p.isVegetarian ?? null, p.shelfLife ?? null, p.countryOfOrigin ?? null,
          p.inStock, JSON.stringify(p.storeInventory),
        ]
      );
    }
    console.log(`  ✓ Seeded ${SEED_PRODUCTS.length} products`);

    // Seed Coupons
    for (const c of SEED_COUPONS) {
      await client.query(
        `INSERT INTO coupons (code, discount_type, value, min_order_value, description)
         VALUES ($1, $2, $3, $4, $5)`,
        [c.code, c.discountType, c.value, c.minOrderValue, c.description]
      );
    }
    console.log(`  ✓ Seeded ${SEED_COUPONS.length} coupons`);

    // Seed Forecasts
    for (const f of SEED_FORECASTS) {
      const id = `fc-${f.sku}`;
      await client.query(
        `INSERT INTO forecasts (id, sku, name, product_name, category, store_id, current_stock, hourly_demand_rate, hours_until_stockout, stockout_risk, predicted_tomorrow_demand, recommended_replenish, recommended_restock_quantity, historical_demand)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          id, f.sku, f.name, f.productName ?? null, f.category,
          f.storeId ?? null, f.currentStock, f.hourlyDemandRate ?? null,
          f.hoursUntilStockout, f.stockoutRisk, f.predictedTomorrowDemand,
          f.recommendedReplenish ?? null, f.recommendedRestockQuantity ?? null,
          JSON.stringify(f.historicalDemand ?? []),
        ]
      );
    }
    console.log(`  ✓ Seeded ${SEED_FORECASTS.length} forecasts`);

    // Seed Anomalies
    for (const a of SEED_ANOMALIES) {
      await client.query(
        `INSERT INTO anomalies (id, type, severity, title, description, timestamp, detected_at, impact_score, action_recommended, resolved, store_id, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          a.id, a.type, a.severity, a.title ?? null, a.description,
          a.timestamp ? new Date().toISOString() : null,
          a.detectedAt ?? null, a.impactScore ?? null,
          a.actionRecommended ?? null, a.resolved,
          a.storeId ?? null, JSON.stringify(a.metadata ?? {}),
        ]
      );
    }
    console.log(`  ✓ Seeded ${SEED_ANOMALIES.length} anomalies`);

    // Seed initial order (same as InMemDatabase)
    const now = new Date();
    const orderId = 'ord-1001';
    const orderNumber = 'CKT-94821';
    const items = [
      {
        productId: 'prod-001', name: 'Amul Taaza Homogenised Toned Milk', brand: 'Amul',
        price: 56, mrp: 58, quantity: 2,
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80', unit: '1 L',
      },
      {
        productId: 'prod-019', name: 'The Health Factory Zero Maida Whole Wheat Bread', brand: 'The Health Factory',
        price: 55, mrp: 60, quantity: 1,
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80', unit: '350 g',
      },
      {
        productId: 'prod-006', name: 'Fresh Farm White Eggs (Pack of 6)', brand: 'Clickit Farm Fresh',
        price: 48, mrp: 52, quantity: 1,
        image: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=500&auto=format&fit=crop&q=80', unit: '6 pcs',
      },
    ];
    const statusHistory = [
      { status: 'CONFIRMED', timestamp: new Date(now.getTime() - 8 * 60_000).toISOString(), note: 'Payment verified via UPI' },
      { status: 'STORE_ACCEPTED', timestamp: new Date(now.getTime() - 7 * 60_000).toISOString(), note: 'Dark store started picking items' },
      { status: 'PACKED', timestamp: new Date(now.getTime() - 5 * 60_000).toISOString(), note: 'Bag sealed & quality verified' },
      { status: 'ASSIGNED', timestamp: new Date(now.getTime() - 4 * 60_000).toISOString(), note: 'Ramesh Kumar assigned' },
      { status: 'PICKED_UP', timestamp: new Date(now.getTime() - 3 * 60_000).toISOString(), note: 'Ramesh picked up order from Hub' },
      { status: 'OUT_FOR_DELIVERY', timestamp: new Date(now.getTime() - 2 * 60_000).toISOString(), note: 'Rider is on the way (0.6 km away)' },
    ];
    const deliveryAddress = {
      id: 'addr-01', label: 'Home', street: 'Flat 402, Green Glen Layout, Bellandur',
      area: 'Koramangala 4th Block', city: 'Bengaluru', pincode: '560034',
      coordinates: { lat: 12.936, lng: 77.628 }, isDefault: true,
    };
    const deliveryPartner = {
      id: 'del-01', name: 'Ramesh Kumar', phone: '+91 91234 56789',
      vehicleType: 'EV Electric Scooter (KA-01-EQ-9042)', rating: 4.95,
      currentLocation: { lat: 12.9355, lng: 77.626 },
    };

    await client.query(
      `INSERT INTO orders (id, order_number, customer_id, customer_name, customer_phone, store_id, store_name, items, subtotal, discount, coupon_code, delivery_fee, handling_fee, total, status, delivery_address, payment_method, payment_status, delivery_partner, created_at, estimated_delivery_time, status_history)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
      [
        orderId, orderNumber, 'usr-001', 'Aarav Sharma', '+91 98765 43210',
        'store-blr-01', 'Clickit Hub — Koramangala 4th Block',
        JSON.stringify(items), 215, 25, 'FREEDEL', 0, 4, 194,
        'OUT_FOR_DELIVERY', JSON.stringify(deliveryAddress),
        'UPI', 'PAID', JSON.stringify(deliveryPartner),
        new Date(now.getTime() - 8 * 60_000).toISOString(),
        'in 3 mins', JSON.stringify(statusHistory),
      ]
    );
    console.log('  ✓ Seeded initial order CKT-94821');

    await client.query('COMMIT');
    console.log('\n✅ Database seeded successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(() => process.exit(1));
