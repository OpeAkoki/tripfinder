CREATE TABLE customers (
 id SERIAL PRIMARY KEY,
 name VARCHAR(120) NOT NULL,
 email VARCHAR(160) UNIQUE NOT NULL,
 password_hash VARCHAR(200) NOT NULL,
 role VARCHAR(20) NOT NULL DEFAULT 'customer', -- customer|advisor|admin
 type VARCHAR(20) NOT NULL DEFAULT 'guest', -- member|guest
 points_balance INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE packages (
 id SERIAL PRIMARY KEY,
 title VARCHAR(160) NOT NULL,
 destination VARCHAR(120) NOT NULL,
 description TEXT,
 price_per_person NUMERIC(10,2) NOT NULL,
 departure_date DATE NOT NULL,
 capacity INTEGER NOT NULL,
 image_url VARCHAR(300)
);
CREATE TABLE bookings (
 id SERIAL PRIMARY KEY,
 customer_id INTEGER NOT NULL REFERENCES customers(id),
 package_id INTEGER NOT NULL REFERENCES packages(id),
 travellers INTEGER NOT NULL CHECK (travellers > 0),
 booking_date DATE NOT NULL,
 status VARCHAR(20) NOT NULL DEFAULT 'pending',
 total_price NUMERIC(10,2) NOT NULL,
 points_earned INTEGER NOT NULL DEFAULT 0,
 created_at TIMESTAMP NOT NULL DEFAULT now()
);
