-- Initialize database for Kasa Restaurant Management System

-- Create enum type for user roles
CREATE TYPE user_role AS ENUM ('admin', 'executive', 'chef', 'manager', 'employee');

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role DEFAULT 'employee',
    restaurant_id INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_restaurant_id ON users(restaurant_id);

-- Insert a default restaurant
INSERT INTO restaurants (name, address, phone, email) 
VALUES ('Main Restaurant', '123 Main Street', '+1-555-0123', 'main@kasa-restaurant.com')
ON CONFLICT DO NOTHING;

-- Insert a default admin user (password: admin123)
-- Note: In production, never use default passwords!
INSERT INTO users (email, password_hash, first_name, last_name, role, restaurant_id)
VALUES (
    'admin@kasa-restaurant.com',
    '$2b$10$8K9wXFJgKQ3VQVoJ6Hq8POxJfUZQfU5tTZ9GQ8gFYK9XW1Z3N6N7W',
    'Admin',
    'User',
    'admin',
    1
) ON CONFLICT DO NOTHING;
