-- Clickit PostgreSQL Schema
-- Run: psql -U postgres -d clickit -f server/schema.sql

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50) NOT NULL,
  banner_color VARCHAR(50) NOT NULL,
  item_count INTEGER DEFAULT 0
);

-- Stores
CREATE TABLE IF NOT EXISTS stores (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  address TEXT NOT NULL,
  zone VARCHAR(100) NOT NULL,
  eta_minutes INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  coordinates JSONB NOT NULL DEFAULT '{}',
  operational_hours VARCHAR(100) NOT NULL DEFAULT '24/7'
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(50) PRIMARY KEY,
  sku VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(300) NOT NULL,
  brand VARCHAR(200) NOT NULL,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  mrp NUMERIC(10, 2) NOT NULL,
  selling_price NUMERIC(10, 2) NOT NULL,
  discount_percentage NUMERIC(5, 2) DEFAULT 0,
  unit VARCHAR(50) NOT NULL,
  weight VARCHAR(50) NOT NULL DEFAULT '',
  rating NUMERIC(3, 2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  image TEXT NOT NULL DEFAULT '',
  is_vegetarian BOOLEAN DEFAULT NULL,
  shelf_life VARCHAR(100) DEFAULT NULL,
  country_of_origin VARCHAR(100) DEFAULT NULL,
  in_stock BOOLEAN DEFAULT TRUE,
  store_inventory JSONB NOT NULL DEFAULT '{}'
);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
  code VARCHAR(50) PRIMARY KEY,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('PERCENT', 'FLAT')),
  value NUMERIC(10, 2) NOT NULL,
  min_order_value NUMERIC(10, 2) DEFAULT 0,
  description TEXT NOT NULL DEFAULT ''
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(50) PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id VARCHAR(50) NOT NULL,
  customer_name VARCHAR(200) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  store_id VARCHAR(50) NOT NULL REFERENCES stores(id),
  store_name VARCHAR(200) NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  coupon_code VARCHAR(50) DEFAULT NULL,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  handling_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'CREATED',
  delivery_address JSONB NOT NULL DEFAULT '{}',
  payment_method VARCHAR(30) NOT NULL DEFAULT 'UPI',
  payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  delivery_partner JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  estimated_delivery_time VARCHAR(100) DEFAULT NULL,
  delivered_at TIMESTAMPTZ DEFAULT NULL,
  status_history JSONB NOT NULL DEFAULT '[]'
);

-- Agent Traces
CREATE TABLE IF NOT EXISTS agent_traces (
  id VARCHAR(100) PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  query TEXT NOT NULL,
  perception JSONB NOT NULL DEFAULT '{}',
  working_memory JSONB NOT NULL DEFAULT '{}',
  reasoning TEXT NOT NULL DEFAULT '',
  plan JSONB NOT NULL DEFAULT '[]',
  selected_agents JSONB NOT NULL DEFAULT '[]',
  tools_called JSONB NOT NULL DEFAULT '[]',
  decision TEXT NOT NULL DEFAULT '',
  verification JSONB NOT NULL DEFAULT '{}',
  final_response TEXT NOT NULL DEFAULT '',
  recommended_products JSONB DEFAULT '[]'
);

-- Forecasts
CREATE TABLE IF NOT EXISTS forecasts (
  id VARCHAR(50) PRIMARY KEY,
  sku VARCHAR(50) NOT NULL,
  name VARCHAR(300) NOT NULL,
  product_name VARCHAR(300) DEFAULT NULL,
  category VARCHAR(100) NOT NULL,
  store_id VARCHAR(50) DEFAULT NULL,
  current_stock INTEGER DEFAULT 0,
  hourly_demand_rate NUMERIC(10, 2) DEFAULT NULL,
  hours_until_stockout NUMERIC(10, 2) DEFAULT 0,
  stockout_risk VARCHAR(30) NOT NULL DEFAULT 'OPTIMAL',
  predicted_tomorrow_demand INTEGER DEFAULT 0,
  recommended_replenish INTEGER DEFAULT NULL,
  recommended_restock_quantity INTEGER DEFAULT NULL,
  historical_demand JSONB DEFAULT '[]'
);

-- Anomalies
CREATE TABLE IF NOT EXISTS anomalies (
  id VARCHAR(50) PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('HIGH', 'MEDIUM', 'LOW')),
  title VARCHAR(300) DEFAULT NULL,
  description TEXT NOT NULL DEFAULT '',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  detected_at TIMESTAMPTZ DEFAULT NULL,
  impact_score NUMERIC(5, 2) DEFAULT NULL,
  action_recommended TEXT DEFAULT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  store_id VARCHAR(50) DEFAULT NULL,
  metadata JSONB DEFAULT '{}'
);

-- Event Stream
CREATE TABLE IF NOT EXISTS event_stream (
  id VARCHAR(100) PRIMARY KEY,
  event VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_traces_timestamp ON agent_traces(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_event_stream_timestamp ON event_stream(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_forecasts_sku ON forecasts(sku);
CREATE INDEX IF NOT EXISTS idx_anomalies_resolved ON anomalies(resolved);
