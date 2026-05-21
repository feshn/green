-- Green Pharmacy: базовая схема, триггеры, 2FA, базовые views
-- auth_codes.phone без FK на users — код до регистрации

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DROP TYPE IF EXISTS order_status CASCADE;
CREATE TYPE order_status AS ENUM (
    'in_cart',
    'paid',
    'assembling',
    'packed',
    'in_transit',
    'ready',
    'completed',
    'cancelled'
);

CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE pharmacies (
    id SERIAL PRIMARY KEY,
    city_id INT REFERENCES cities(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6)
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE product_categories (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE(product_id, category_id)
);

CREATE TABLE dosage_form (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE manufacturers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE product_details (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE UNIQUE,
    dosage_form_id INT REFERENCES dosage_form(id) ON DELETE SET NULL,
    composition TEXT,
    manufacturer_id INT REFERENCES manufacturers(id) ON DELETE SET NULL,
    usage_instructions TEXT,
    main_image_url TEXT
);

CREATE TABLE product_prices (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    old_price NUMERIC(10, 2) CHECK (old_price >= 0),
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_main BOOLEAN DEFAULT false
);

CREATE TABLE users (
    id TEXT PRIMARY KEY,
    phone TEXT NOT NULL UNIQUE,
    name TEXT,
    opd_accepted BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'picker', 'courier')),
    name TEXT NOT NULL,
    surname TEXT NOT NULL
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    status order_status NOT NULL DEFAULT 'in_cart',
    total_price NUMERIC(10, 2) DEFAULT 0.00,
    pharmacy_id INT REFERENCES pharmacies(id) ON DELETE SET NULL,
    delivery_date DATE,
    verification_code TEXT,
    picker_id INT REFERENCES employees(id) ON DELETE SET NULL,
    courier_id INT REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    price_at_purchase NUMERIC(10, 2) NOT NULL CHECK (price_at_purchase >= 0),
    UNIQUE(order_id, product_id)
);

CREATE TABLE order_history (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    status order_status NOT NULL,
    employee_id INT REFERENCES employees(id) ON DELETE SET NULL,
    changed_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE auth_codes (
    id SERIAL PRIMARY KEY,
    phone TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT false,
    attempts INT DEFAULT 0
);

-- Пересчёт total_price
CREATE OR REPLACE FUNCTION calculate_order_total()
RETURNS TRIGGER AS $$
DECLARE
    current_order_id INT;
    calculated_total NUMERIC(10, 2);
BEGIN
    IF TG_OP = 'DELETE' THEN
        current_order_id := OLD.order_id;
    ELSE
        current_order_id := NEW.order_id;
    END IF;

    SELECT COALESCE(SUM(quantity * price_at_purchase), 0)
    INTO calculated_total
    FROM order_items
    WHERE order_id = current_order_id;

    UPDATE orders SET total_price = calculated_total WHERE id = current_order_id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_order_total
    AFTER INSERT OR UPDATE OR DELETE ON order_items
    FOR EACH ROW EXECUTE FUNCTION calculate_order_total();

-- Код выдачи при ready
CREATE OR REPLACE FUNCTION generate_verification_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.verification_code IS NULL AND NEW.status = 'ready' THEN
        NEW.verification_code := floor(random() * (999999 - 100000 + 1) + 100000)::TEXT;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_verification_code
    BEFORE INSERT OR UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION generate_verification_code();

-- SMS-коды
CREATE OR REPLACE FUNCTION prepare_auth_code()
RETURNS TRIGGER AS $$
BEGIN
    NEW.code := floor(random() * (999999 - 100000 + 1) + 100000)::TEXT;
    NEW.expires_at := NOW() + INTERVAL '5 minutes';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prepare_auth_code
    BEFORE INSERT ON auth_codes
    FOR EACH ROW EXECUTE FUNCTION prepare_auth_code();

CREATE OR REPLACE FUNCTION verify_user_code(user_phone TEXT, input_code TEXT)
RETURNS TEXT AS $$
DECLARE
    active_code RECORD;
BEGIN
    SELECT * INTO active_code
    FROM auth_codes
    WHERE phone = user_phone AND is_used = false AND expires_at > NOW()
    ORDER BY created_at DESC LIMIT 1;

    IF NOT FOUND THEN
        RETURN 'КОД_НЕ_НАЙДЕН_ИЛИ_ИСТЕК';
    END IF;

    IF active_code.attempts >= 5 THEN
        RETURN 'КОД_ЗАБЛОКИРОВАН_ПРЕВЫШЕНЫ_ПОПЫТКИ';
    END IF;

    IF active_code.code = input_code THEN
        UPDATE auth_codes SET is_used = true WHERE id = active_code.id;
        RETURN 'УСПЕШНО';
    ELSE
        UPDATE auth_codes SET attempts = attempts + 1 WHERE id = active_code.id;
        IF (active_code.attempts + 1) >= 5 THEN
            RETURN 'КОД_АННУЛИРОВАН_НАЖМИТЕ_ПОВТОРНО';
        ELSE
            RETURN 'НЕВЕРНО_ОСТАЛОСЬ_ПОПЫТОК: ' || (5 - (active_code.attempts + 1));
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION verify_user_code(TEXT, TEXT) TO anon, authenticated;
