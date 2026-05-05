-- Create payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY,
    external_id VARCHAR(255),
    order_id UUID NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    confirmation_url TEXT,
    qr_code_data TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add reference to payments in orders table
ALTER TABLE orders ADD COLUMN current_payment_id UUID;
ALTER TABLE orders ADD CONSTRAINT fk_orders_current_payment FOREIGN KEY (current_payment_id) REFERENCES payments (id);

-- Index for performance
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_external_id ON payments(external_id);
