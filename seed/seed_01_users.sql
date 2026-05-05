-- =============================================================
-- SEED 01: USERS (florists, couriers, customers)
-- Password for ALL staff: Florify123!
-- Password for ALL customers: Client123!
-- =============================================================

-- BCrypt hashes
-- Florify123! => $2b$10$Y9HH7nDwtrop5SUyAR9rYOzKOTijYYK3GyWlBrsbjP81Hfjz8C9SS
-- Client123!  => generated below

DO $$
DECLARE
  hash_staff  TEXT := '$2b$10$Y9HH7nDwtrop5SUyAR9rYOzKOTijYYK3GyWlBrsbjP81Hfjz8C9SS';
  hash_client TEXT := '$2b$10$Y9HH7nDwtrop5SUyAR9rYOzKOTijYYK3GyWlBrsbjP81Hfjz8C9SS';
  store_id    UUID := '00000000-0000-0000-0000-000000000001';

  -- Florist IDs
  u_f1 UUID := 'a1000000-0000-0000-0000-000000000001';
  u_f2 UUID := 'a1000000-0000-0000-0000-000000000002';
  u_f3 UUID := 'a1000000-0000-0000-0000-000000000003';
  -- Courier IDs
  u_c1 UUID := 'a2000000-0000-0000-0000-000000000001';
  u_c2 UUID := 'a2000000-0000-0000-0000-000000000002';
  -- Customer user IDs
  u_k1  UUID := 'a3000000-0000-0000-0000-000000000001';
  u_k2  UUID := 'a3000000-0000-0000-0000-000000000002';
  u_k3  UUID := 'a3000000-0000-0000-0000-000000000003';
  u_k4  UUID := 'a3000000-0000-0000-0000-000000000004';
  u_k5  UUID := 'a3000000-0000-0000-0000-000000000005';
  u_k6  UUID := 'a3000000-0000-0000-0000-000000000006';
  u_k7  UUID := 'a3000000-0000-0000-0000-000000000007';
  u_k8  UUID := 'a3000000-0000-0000-0000-000000000008';
  u_k9  UUID := 'a3000000-0000-0000-0000-000000000009';
  u_k10 UUID := 'a3000000-0000-0000-0000-000000000010';
  u_k11 UUID := 'a3000000-0000-0000-0000-000000000011';
  u_k12 UUID := 'a3000000-0000-0000-0000-000000000012';
  u_k13 UUID := 'a3000000-0000-0000-0000-000000000013';
  u_k14 UUID := 'a3000000-0000-0000-0000-000000000014';
  u_k15 UUID := 'a3000000-0000-0000-0000-000000000015';

BEGIN

-- ── FLORISTS ──────────────────────────────────────────────────
INSERT INTO users (id, email, phone, first_name, last_name, password_hash, active, created_at)
VALUES
  (u_f1, 'florist1@florify.ru', '+79001110001', 'Анна',    'Петрова',   hash_staff, true, NOW()),
  (u_f2, 'florist2@florify.ru', '+79001110002', 'Мария',   'Иванова',   hash_staff, true, NOW()),
  (u_f3, 'florist3@florify.ru', '+79001110003', 'Светлана','Сидорова',  hash_staff, true, NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles (user_id, role) VALUES
  (u_f1,'FLORIST'),(u_f2,'FLORIST'),(u_f3,'FLORIST')
ON CONFLICT DO NOTHING;

INSERT INTO employees (id, user_id, first_name, last_name, phone, role, hire_date, active, store_id)
VALUES
  (gen_random_uuid(), u_f1, 'Анна',    'Петрова',  '+79001110001', 'FLORIST', '2024-01-15', true, store_id),
  (gen_random_uuid(), u_f2, 'Мария',   'Иванова',  '+79001110002', 'FLORIST', '2024-03-01', true, store_id),
  (gen_random_uuid(), u_f3, 'Светлана','Сидорова',  '+79001110003', 'FLORIST', '2024-06-10', true, store_id)
ON CONFLICT (user_id) DO NOTHING;

-- ── COURIERS ─────────────────────────────────────────────────
INSERT INTO users (id, email, phone, first_name, last_name, password_hash, active, created_at)
VALUES
  (u_c1, 'courier1@florify.ru', '+79002220001', 'Дмитрий', 'Козлов',   hash_staff, true, NOW()),
  (u_c2, 'courier2@florify.ru', '+79002220002', 'Алексей', 'Морозов',  hash_staff, true, NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles (user_id, role) VALUES
  (u_c1,'COURIER'),(u_c2,'COURIER')
ON CONFLICT DO NOTHING;

INSERT INTO employees (id, user_id, first_name, last_name, phone, role, hire_date, active, store_id)
VALUES
  (gen_random_uuid(), u_c1, 'Дмитрий','Козлов',  '+79002220001', 'COURIER', '2024-02-01', true, store_id),
  (gen_random_uuid(), u_c2, 'Алексей','Морозов',  '+79002220002', 'COURIER', '2024-05-15', true, store_id)
ON CONFLICT (user_id) DO NOTHING;

-- ── CUSTOMER USERS ───────────────────────────────────────────
INSERT INTO users (id, email, phone, first_name, last_name, password_hash, active, created_at)
VALUES
  (u_k1,  'client1@mail.ru',  '+79100000001', 'Ольга',      'Новикова',    hash_client, true, NOW()),
  (u_k2,  'client2@mail.ru',  '+79100000002', 'Татьяна',    'Романова',    hash_client, true, NOW()),
  (u_k3,  'client3@mail.ru',  '+79100000003', 'Екатерина',  'Белова',      hash_client, true, NOW()),
  (u_k4,  'client4@mail.ru',  '+79100000004', 'Наталья',    'Лебедева',    hash_client, true, NOW()),
  (u_k5,  'client5@mail.ru',  '+79100000005', 'Ирина',      'Смирнова',    hash_client, true, NOW()),
  (u_k6,  'client6@mail.ru',  '+79100000006', 'Андрей',     'Попов',       hash_client, true, NOW()),
  (u_k7,  'client7@mail.ru',  '+79100000007', 'Сергей',     'Соколов',     hash_client, true, NOW()),
  (u_k8,  'client8@mail.ru',  '+79100000008', 'Максим',     'Волков',      hash_client, true, NOW()),
  (u_k9,  'client9@mail.ru',  '+79100000009', 'Виктория',   'Захарова',    hash_client, true, NOW()),
  (u_k10, 'client10@mail.ru', '+79100000010', 'Александра', 'Медведева',   hash_client, true, NOW()),
  (u_k11, 'client11@mail.ru', '+79100000011', 'Людмила',    'Федорова',    hash_client, true, NOW()),
  (u_k12, 'client12@mail.ru', '+79100000012', 'Вера',       'Орлова',      hash_client, true, NOW()),
  (u_k13, 'client13@mail.ru', '+79100000013', 'Юлия',       'Соловьева',   hash_client, true, NOW()),
  (u_k14, 'client14@mail.ru', '+79100000014', 'Галина',     'Тихонова',    hash_client, true, NOW()),
  (u_k15, 'client15@mail.ru', '+79100000015', 'Надежда',    'Кузьмина',    hash_client, true, NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT id, 'CUSTOMER' FROM users WHERE email LIKE 'client%@mail.ru'
ON CONFLICT DO NOTHING;

-- ── CUSTOMERS + LOYALTY ──────────────────────────────────────
INSERT INTO customers (id, phone, email, first_name, last_name, birth_date, gender, source, user_id, active, created_at, updated_at)
VALUES
  ('b1000000-0000-0000-0000-000000000001', '+79100000001', 'client1@mail.ru',  'Ольга',      'Новикова',  '1990-03-15', 'FEMALE', 'WEB', u_k1,  true, NOW(), NOW()),
  ('b1000000-0000-0000-0000-000000000002', '+79100000002', 'client2@mail.ru',  'Татьяна',    'Романова',  '1985-07-22', 'FEMALE', 'WEB', u_k2,  true, NOW(), NOW()),
  ('b1000000-0000-0000-0000-000000000003', '+79100000003', 'client3@mail.ru',  'Екатерина',  'Белова',    '1992-11-05', 'FEMALE', 'WEB', u_k3,  true, NOW(), NOW()),
  ('b1000000-0000-0000-0000-000000000004', '+79100000004', 'client4@mail.ru',  'Наталья',    'Лебедева',  '1988-01-30', 'FEMALE', 'WEB', u_k4,  true, NOW(), NOW()),
  ('b1000000-0000-0000-0000-000000000005', '+79100000005', 'client5@mail.ru',  'Ирина',      'Смирнова',  '1995-06-18', 'FEMALE', 'WEB', u_k5,  true, NOW(), NOW()),
  ('b1000000-0000-0000-0000-000000000006', '+79100000006', 'client6@mail.ru',  'Андрей',     'Попов',     '1983-09-12', 'MALE',   'WEB', u_k6,  true, NOW(), NOW()),
  ('b1000000-0000-0000-0000-000000000007', '+79100000007', 'client7@mail.ru',  'Сергей',     'Соколов',   '1978-04-25', 'MALE',   'WEB', u_k7,  true, NOW(), NOW()),
  ('b1000000-0000-0000-0000-000000000008', '+79100000008', 'client8@mail.ru',  'Максим',     'Волков',    '1991-12-08', 'MALE',   'WEB', u_k8,  true, NOW(), NOW()),
  ('b1000000-0000-0000-0000-000000000009', '+79100000009', 'client9@mail.ru',  'Виктория',   'Захарова',  '1994-02-14', 'FEMALE', 'WEB', u_k9,  true, NOW(), NOW()),
  ('b1000000-0000-0000-0000-000000000010', '+79100000010', 'client10@mail.ru', 'Александра', 'Медведева', '1987-08-03', 'FEMALE', 'WEB', u_k10, true, NOW(), NOW()),
  ('b1000000-0000-0000-0000-000000000011', '+79100000011', 'client11@mail.ru', 'Людмила',    'Федорова',  '1975-05-20', 'FEMALE', 'WEB', u_k11, true, NOW(), NOW()),
  ('b1000000-0000-0000-0000-000000000012', '+79100000012', 'client12@mail.ru', 'Вера',       'Орлова',    '1996-10-17', 'FEMALE', 'WEB', u_k12, true, NOW(), NOW()),
  ('b1000000-0000-0000-0000-000000000013', '+79100000013', 'client13@mail.ru', 'Юлия',       'Соловьева', '1993-03-29', 'FEMALE', 'WEB', u_k13, true, NOW(), NOW()),
  ('b1000000-0000-0000-0000-000000000014', '+79100000014', 'client14@mail.ru', 'Галина',     'Тихонова',  '1980-07-11', 'FEMALE', 'WEB', u_k14, true, NOW(), NOW()),
  ('b1000000-0000-0000-0000-000000000015', '+79100000015', 'client15@mail.ru', 'Надежда',    'Кузьмина',  '1989-01-06', 'FEMALE', 'WEB', u_k15, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Loyalty accounts с разными баллами и уровнями
INSERT INTO loyalty_accounts (id, customer_id, tier, points_balance, reserved_points, total_spent, created_at, updated_at)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'GOLD',     12500, 0,  85000.00, NOW(), NOW()),
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 'SILVER',    4200, 0,  32000.00, NOW(), NOW()),
  ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003', 'PLATINUM', 35000, 0, 250000.00, NOW(), NOW()),
  ('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004', 'BRONZE',     850, 0,   5500.00, NOW(), NOW()),
  ('c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000005', 'SILVER',    3100, 0,  28000.00, NOW(), NOW()),
  ('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000006', 'BRONZE',     200, 0,   1800.00, NOW(), NOW()),
  ('c1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000007', 'GOLD',      9800, 0,  72000.00, NOW(), NOW()),
  ('c1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000008', 'BRONZE',      50, 0,    450.00, NOW(), NOW()),
  ('c1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000009', 'SILVER',    5600, 0,  41000.00, NOW(), NOW()),
  ('c1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000010', 'GOLD',     11200, 0,  79000.00, NOW(), NOW()),
  ('c1000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000011', 'SILVER',    2300, 0,  19000.00, NOW(), NOW()),
  ('c1000000-0000-0000-0000-000000000012', 'b1000000-0000-0000-0000-000000000012', 'BRONZE',     700, 0,   4200.00, NOW(), NOW()),
  ('c1000000-0000-0000-0000-000000000013', 'b1000000-0000-0000-0000-000000000013', 'PLATINUM', 22000, 0, 180000.00, NOW(), NOW()),
  ('c1000000-0000-0000-0000-000000000014', 'b1000000-0000-0000-0000-000000000014', 'GOLD',      8500, 0,  63000.00, NOW(), NOW()),
  ('c1000000-0000-0000-0000-000000000015', 'b1000000-0000-0000-0000-000000000015', 'BRONZE',     150, 0,   1100.00, NOW(), NOW())
ON CONFLICT DO NOTHING;

END $$;
