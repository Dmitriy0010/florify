-- ============================================================
-- MIGRATION 4: Employees (employees, salary configs, timesheet, statements)
--               Delivery (zones, slots, tasks)
-- ============================================================

-- ============================================================
-- EMPLOYEES
-- ============================================================

CREATE TABLE employees (
    id           UUID PRIMARY KEY,
    user_id      UUID NOT NULL UNIQUE,
    first_name   VARCHAR(120) NOT NULL,
    last_name    VARCHAR(120) NOT NULL,
    phone        VARCHAR(50),
    role         VARCHAR(50) NOT NULL,
    hire_date    DATE NOT NULL,
    dismiss_date DATE,
    active       BOOLEAN NOT NULL DEFAULT TRUE,
    avatar_url   VARCHAR(500),
    store_id     UUID NOT NULL REFERENCES stores(id)
);

CREATE TABLE employee_salary_configs (
    id              UUID PRIMARY KEY,
    employee_id     UUID NOT NULL REFERENCES employees(id),
    type            VARCHAR(50) NOT NULL,
    base_amount     NUMERIC(19,2) NOT NULL DEFAULT 0,
    sales_percent   NUMERIC(7,4) NOT NULL DEFAULT 0,
    bonus_per_order NUMERIC(19,2) NOT NULL DEFAULT 0,
    valid_from      DATE NOT NULL,
    CONSTRAINT uq_employee_salary_configs_employee_valid_from UNIQUE (employee_id, valid_from)
);

CREATE TABLE employee_timesheet (
    id          UUID PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id),
    date        DATE NOT NULL,
    checkin_at  TIMESTAMPTZ NOT NULL,
    checkout_at TIMESTAMPTZ,
    hours_worked NUMERIC(8,2) NOT NULL DEFAULT 0,
    CONSTRAINT uq_employee_timesheet_employee_date UNIQUE (employee_id, date)
);

CREATE TABLE employee_salary_statements (
    id           UUID PRIMARY KEY,
    employee_id  UUID NOT NULL REFERENCES employees(id),
    period       VARCHAR(7) NOT NULL,
    store_id     UUID NOT NULL REFERENCES stores(id),
    base_salary  NUMERIC(19,2) NOT NULL DEFAULT 0,
    sales_bonus  NUMERIC(19,2) NOT NULL DEFAULT 0,
    order_bonus  NUMERIC(19,2) NOT NULL DEFAULT 0,
    manual_bonus NUMERIC(19,2) NOT NULL DEFAULT 0,
    deductions   NUMERIC(19,2) NOT NULL DEFAULT 0,
    total_payout NUMERIC(19,2) NOT NULL DEFAULT 0,
    status       VARCHAR(30) NOT NULL,
    approved_by  UUID,
    paid_at      TIMESTAMPTZ,
    CONSTRAINT uq_employee_salary_statements_employee_period UNIQUE (employee_id, period)
);
CREATE INDEX idx_ess_store ON employee_salary_statements(store_id);

-- ============================================================
-- DELIVERY
-- ============================================================

CREATE TABLE delivery_zones (
    id               UUID PRIMARY KEY,
    name             VARCHAR(255) NOT NULL,
    polygon          TEXT,
    delivery_fee     DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) NOT NULL,
    active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ NOT NULL,
    CONSTRAINT uq_delivery_zone_name UNIQUE (name),
    CONSTRAINT chk_delivery_zone_fee CHECK (delivery_fee >= 0),
    CONSTRAINT chk_delivery_zone_min_amount CHECK (min_order_amount >= 0)
);
CREATE INDEX idx_delivery_zone_active ON delivery_zones(active);

CREATE TABLE delivery_slots (
    id           UUID PRIMARY KEY,
    date         DATE NOT NULL,
    start_time   TIME NOT NULL,
    end_time     TIME NOT NULL,
    max_capacity INTEGER NOT NULL,
    current_load INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT uq_delivery_slot_date_time UNIQUE (date, start_time, end_time),
    CONSTRAINT chk_delivery_slot_capacity CHECK (max_capacity > 0),
    CONSTRAINT chk_delivery_slot_load CHECK (current_load >= 0),
    CONSTRAINT chk_delivery_slot_load_max CHECK (current_load <= max_capacity),
    CONSTRAINT chk_delivery_slot_time CHECK (start_time < end_time)
);
CREATE INDEX idx_delivery_slot_date ON delivery_slots(date);

CREATE TABLE delivery_tasks (
    id                  UUID PRIMARY KEY,
    order_id            UUID NOT NULL,
    slot_id             UUID REFERENCES delivery_slots(id) ON DELETE SET NULL,
    zone_id             UUID REFERENCES delivery_zones(id) ON DELETE SET NULL,
    courier_id          UUID,
    delivery_address    TEXT NOT NULL,
    latitude            DOUBLE PRECISION,
    longitude           DOUBLE PRECISION,
    status              VARCHAR(50) NOT NULL,
    estimated_arrival   TIMESTAMPTZ,
    actual_delivered_at TIMESTAMPTZ,
    failure_reason      TEXT,
    created_at          TIMESTAMPTZ NOT NULL,
    updated_at          TIMESTAMPTZ,
    CONSTRAINT uq_delivery_task_order_id UNIQUE (order_id),
    CONSTRAINT chk_delivery_task_status CHECK (
        status IN ('CREATED','ASSIGNED','PICKED_UP','DELIVERED','FAILED')
    )
);
CREATE INDEX idx_delivery_task_courier_id ON delivery_tasks(courier_id);
CREATE INDEX idx_delivery_task_status ON delivery_tasks(status);
CREATE INDEX idx_delivery_task_slot_id ON delivery_tasks(slot_id);
