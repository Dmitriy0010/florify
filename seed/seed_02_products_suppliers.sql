-- =============================================================
-- SEED 02: PRODUCTS (30+) + SUPPLIERS + DELIVERY ZONES/SLOTS
-- Image URLs point to MinIO bucket "florify"
-- =============================================================

DO $$
DECLARE
  v_store_id UUID := '00000000-0000-0000-0000-000000000001';
  base_img TEXT := 'http://localhost:9000/florify/products/';

  -- Category IDs (fetched dynamically)
  cat_roses     UUID;
  cat_tulips    UUID;
  cat_chrysan   UUID;
  cat_lilies    UUID;
  cat_bouquets  UUID;
  cat_plants    UUID;
  cat_access    UUID;

  -- Product IDs
  p1  UUID := 'd1000000-0000-0000-0000-000000000001';
  p2  UUID := 'd1000000-0000-0000-0000-000000000002';
  p3  UUID := 'd1000000-0000-0000-0000-000000000003';
  p4  UUID := 'd1000000-0000-0000-0000-000000000004';
  p5  UUID := 'd1000000-0000-0000-0000-000000000005';
  p6  UUID := 'd1000000-0000-0000-0000-000000000006';
  p7  UUID := 'd1000000-0000-0000-0000-000000000007';
  p8  UUID := 'd1000000-0000-0000-0000-000000000008';
  p9  UUID := 'd1000000-0000-0000-0000-000000000009';
  p10 UUID := 'd1000000-0000-0000-0000-000000000010';
  p11 UUID := 'd1000000-0000-0000-0000-000000000011';
  p12 UUID := 'd1000000-0000-0000-0000-000000000012';
  p13 UUID := 'd1000000-0000-0000-0000-000000000013';
  p14 UUID := 'd1000000-0000-0000-0000-000000000014';
  p15 UUID := 'd1000000-0000-0000-0000-000000000015';
  p16 UUID := 'd1000000-0000-0000-0000-000000000016';
  p17 UUID := 'd1000000-0000-0000-0000-000000000017';
  p18 UUID := 'd1000000-0000-0000-0000-000000000018';
  p19 UUID := 'd1000000-0000-0000-0000-000000000019';
  p20 UUID := 'd1000000-0000-0000-0000-000000000020';
  p21 UUID := 'd1000000-0000-0000-0000-000000000021';
  p22 UUID := 'd1000000-0000-0000-0000-000000000022';
  p23 UUID := 'd1000000-0000-0000-0000-000000000023';
  p24 UUID := 'd1000000-0000-0000-0000-000000000024';
  p25 UUID := 'd1000000-0000-0000-0000-000000000025';
  p26 UUID := 'd1000000-0000-0000-0000-000000000026';
  p27 UUID := 'd1000000-0000-0000-0000-000000000027';
  p28 UUID := 'd1000000-0000-0000-0000-000000000028';
  p29 UUID := 'd1000000-0000-0000-0000-000000000029';
  p30 UUID := 'd1000000-0000-0000-0000-000000000030';
  p31 UUID := 'd1000000-0000-0000-0000-000000000031';
  p32 UUID := 'd1000000-0000-0000-0000-000000000032';

BEGIN

  SELECT id INTO cat_roses    FROM product_categories WHERE name = 'Розы'                LIMIT 1;
  SELECT id INTO cat_tulips   FROM product_categories WHERE name = 'Тюльпаны'            LIMIT 1;
  SELECT id INTO cat_chrysan  FROM product_categories WHERE name = 'Хризантемы'          LIMIT 1;
  SELECT id INTO cat_lilies   FROM product_categories WHERE name = 'Лилии'               LIMIT 1;
  SELECT id INTO cat_bouquets FROM product_categories WHERE name = 'Букеты'              LIMIT 1;
  SELECT id INTO cat_plants   FROM product_categories WHERE name = 'Горшечные растения'  LIMIT 1;
  SELECT id INTO cat_access   FROM product_categories WHERE name = 'Аксессуары'          LIMIT 1;

  -- ── ROSES ──
  INSERT INTO products (id, sku, name, description, category_id, unit, current_price, image_url, default_shelf_life_days, active)
  VALUES
    (p1,  'ROSE-RED-001',   'Роза красная Ред Наоми',     'Голландская красная роза 60 см',        cat_roses, 'шт', 180.00, base_img||'rose-red.jpg',       7, true),
    (p2,  'ROSE-PINK-001',  'Роза розовая Аква',          'Нежно-розовая роза 50 см',             cat_roses, 'шт', 150.00, base_img||'rose-pink.jpg',      7, true),
    (p3,  'ROSE-WHITE-001', 'Роза белая Аваланш',         'Белая роза премиум 60 см',             cat_roses, 'шт', 170.00, base_img||'rose-white.jpg',     7, true),
    (p4,  'ROSE-CORAL-001', 'Роза коралловая Фри Спирит', 'Коралловая роза 50 см',                cat_roses, 'шт', 160.00, base_img||'rose-coral.jpg',     7, true),
    (p5,  'ROSE-YELLOW-001','Роза жёлтая Пич Авалонч',    'Кремово-жёлтая роза 60 см',            cat_roses, 'шт', 155.00, base_img||'rose-yellow.jpg',    7, true),
    (p6,  'ROSE-SPRAY-001', 'Кустовая роза розовая',      'Кустовая роза 50 см, 5-7 бутонов',    cat_roses, 'шт', 120.00, base_img||'rose-spray.jpg',     7, true),
    (p7,  'ROSE-LILAC-001', 'Роза сиреневая Индиго',      'Редкая сиреневая роза 60 см',         cat_roses, 'шт', 220.00, base_img||'rose-lilac.jpg',     7, true)
  ON CONFLICT (sku) DO NOTHING;

  -- ── TULIPS ──
  INSERT INTO products (id, sku, name, description, category_id, unit, current_price, image_url, default_shelf_life_days, active)
  VALUES
    (p8,  'TULP-RED-001',   'Тюльпан красный',    'Классический красный тюльпан',      cat_tulips, 'шт', 80.00,  base_img||'tulip-red.jpg',    5, true),
    (p9,  'TULP-PINK-001',  'Тюльпан розовый',    'Нежно-розовый тюльпан',             cat_tulips, 'шт', 75.00,  base_img||'tulip-pink.jpg',   5, true),
    (p10, 'TULP-WHITE-001', 'Тюльпан белый',      'Белый тюльпан Пурисима',            cat_tulips, 'шт', 85.00,  base_img||'tulip-white.jpg',  5, true),
    (p11, 'TULP-PURPLE-001','Тюльпан фиолетовый', 'Фиолетовый тюльпан Ночь',          cat_tulips, 'шт', 90.00,  base_img||'tulip-purple.jpg', 5, true),
    (p12, 'TULP-PARROT-001','Тюльпан попугай',    'Декоративный тюльпан с бахромой',  cat_tulips, 'шт', 110.00, base_img||'tulip-parrot.jpg', 5, true)
  ON CONFLICT (sku) DO NOTHING;

  -- ── CHRYSANTHEMUMS ──
  INSERT INTO products (id, sku, name, description, category_id, unit, current_price, image_url, default_shelf_life_days, active)
  VALUES
    (p13, 'CHRY-WHITE-001', 'Хризантема белая кустовая',  'Пышная белая хризантема',      cat_chrysan, 'шт', 130.00, base_img||'chry-white.jpg',  14, true),
    (p14, 'CHRY-PINK-001',  'Хризантема розовая',         'Розовая хризантема 60 см',     cat_chrysan, 'шт', 120.00, base_img||'chry-pink.jpg',   14, true),
    (p15, 'CHRY-YELLOW-001','Хризантема жёлтая',          'Солнечная жёлтая хризантема',  cat_chrysan, 'шт', 115.00, base_img||'chry-yellow.jpg', 14, true)
  ON CONFLICT (sku) DO NOTHING;

  -- ── LILIES ──
  INSERT INTO products (id, sku, name, description, category_id, unit, current_price, image_url, default_shelf_life_days, active)
  VALUES
    (p16, 'LILY-WHITE-001', 'Лилия белая Oriental',   'Белая ориентальная лилия',   cat_lilies, 'шт', 200.00, base_img||'lily-white.jpg',  10, true),
    (p17, 'LILY-PINK-001',  'Лилия розовая Casablanca','Розовая лилия Касабланка',  cat_lilies, 'шт', 210.00, base_img||'lily-pink.jpg',   10, true),
    (p18, 'LILY-ORANGE-001','Лилия оранжевая Aztek',  'Азиатская лилия оранжевая', cat_lilies, 'шт', 180.00, base_img||'lily-orange.jpg', 10, true)
  ON CONFLICT (sku) DO NOTHING;

  -- ── BOUQUETS ──
  INSERT INTO products (id, sku, name, description, category_id, unit, current_price, image_url, default_shelf_life_days, active)
  VALUES
    (p19, 'BOQT-SPRING-001', 'Букет «Весенний»',      '25 тюльпанов микс',                  cat_bouquets, 'шт', 2500.00, base_img||'bouquet-spring.jpg',   5, true),
    (p20, 'BOQT-BRIDE-001',  'Букет «Невесты»',       'Белые розы и эустома',               cat_bouquets, 'шт', 5500.00, base_img||'bouquet-bride.jpg',    7, true),
    (p21, 'BOQT-LOVE-001',   'Букет «С любовью»',     '51 красная роза',                    cat_bouquets, 'шт', 9500.00, base_img||'bouquet-love.jpg',     7, true),
    (p22, 'BOQT-MONO-001',   'Монобукет из хризантем','15 кустовых хризантем',              cat_bouquets, 'шт', 2200.00, base_img||'bouquet-mono.jpg',     14, true),
    (p23, 'BOQT-GARDEN-001', 'Букет «Садовый»',       'Полевые цветы в крафт-бумаге',      cat_bouquets, 'шт', 1800.00, base_img||'bouquet-garden.jpg',    7, true),
    (p24, 'BOQT-VIP-001',    'Букет «VIP»',           '101 роза в шляпной коробке',        cat_bouquets, 'шт', 18500.00,base_img||'bouquet-vip.jpg',       7, true)
  ON CONFLICT (sku) DO NOTHING;

  -- ── PLANTS ──
  INSERT INTO products (id, sku, name, description, category_id, unit, current_price, image_url, default_shelf_life_days, active)
  VALUES
    (p25, 'PLNT-ORCHID-001', 'Орхидея фаленопсис белая', 'Орхидея в горшке, 2 стебля',        cat_plants, 'шт', 1800.00, base_img||'plant-orchid.jpg',  365, true),
    (p26, 'PLNT-SPAT-001',   'Спатифиллум',              'Женское счастье в горшке 15 см',    cat_plants, 'шт', 850.00,  base_img||'plant-spati.jpg',   365, true),
    (p27, 'PLNT-SUCC-001',   'Суккулент микс',           'Суккулент в горшке 7 см',           cat_plants, 'шт', 350.00,  base_img||'plant-succ.jpg',    365, true),
    (p28, 'PLNT-CACTUS-001', 'Кактус декоративный',      'Кактус в горшке 10 см',             cat_plants, 'шт', 450.00,  base_img||'plant-cactus.jpg',  365, true),
    (p29, 'PLNT-EUCAL-001',  'Эвкалипт срезанный',       'Ветки эвкалипта 60 см',             cat_plants, 'шт', 200.00,  base_img||'plant-eucal.jpg',    14, true)
  ON CONFLICT (sku) DO NOTHING;

  -- ── ACCESSORIES ──
  INSERT INTO products (id, sku, name, description, category_id, unit, current_price, image_url, default_shelf_life_days, active)
  VALUES
    (p30, 'ACCS-WRAP-001',  'Крафт-бумага упаковочная', 'Рулон 60 см, 10 м',          cat_access, 'шт', 250.00, base_img||'wrap-kraft.jpg',    365, true),
    (p31, 'ACCS-RIBBON-001','Лента атласная',            'Лента 4 см х 25 м, белая',   cat_access, 'шт', 180.00, base_img||'ribbon-white.jpg',  365, true),
    (p32, 'ACCS-VASE-001',  'Ваза цилиндр стеклянная',  'Ваза 30 см, прозрачная',     cat_access, 'шт', 650.00, base_img||'vase-glass.jpg',    365, true)
  ON CONFLICT (sku) DO NOTHING;

  -- ── STOCK BALANCES (начальные остатки) ──
  INSERT INTO stock_balances (id, product_id, store_id, quantity_in_stock, average_cost)
  SELECT gen_random_uuid(), id, v_store_id,
    CASE
      WHEN unit = 'шт' AND current_price < 200  THEN 150
      WHEN unit = 'шт' AND current_price < 1000 THEN 50
      ELSE 20
    END,
    current_price * 0.45
  FROM products
  WHERE id BETWEEN 'd1000000-0000-0000-0000-000000000001'::uuid
                AND 'd1000000-0000-0000-0000-000000000032'::uuid
  ON CONFLICT (product_id, store_id) DO NOTHING;

END $$;

-- ── SUPPLIERS ────────────────────────────────────────────────────────
INSERT INTO suppliers (id, name, contact_person, phone, email, address, tax_id, payment_terms, rating, notes, active, created_at)
VALUES
  ('e1000000-0000-0000-0000-000000000001', 'ОптФлора Москва',      'Игорь Семёнов',    '+74951234567', 'opt@optflora.ru',     'г. Москва, Рижский рынок, пав. 12',       '7701234567', 'NET_30', 5, 'Основной поставщик голландских роз',    true, NOW()),
  ('e1000000-0000-0000-0000-000000000002', 'ЦветОк Оптовый',       'Наталья Крюкова',  '+78007654321', 'order@cvetok-opt.ru', 'г. Москва, Цветочная база, стр. 3',       '7709876543', 'NET_14', 4, 'Тюльпаны и хризантемы, быстрая доставка', true, NOW()),
  ('e1000000-0000-0000-0000-000000000003', 'ЭквадорРозы',          'Карлос Рамирес',   '+74957778899', 'carlos@ecroses.com',  'г. Москва, Хлебный переулок, 5',          '7712345670', 'NET_7',  5, 'Эквадорские розы, импорт напрямую',       true, NOW()),
  ('e1000000-0000-0000-0000-000000000004', 'ГринСад Растения',     'Ольга Быкова',     '+74951112233', 'info@greensad.ru',    'г. Москва, ул. Садовая, 100',             '7798765432', 'NET_30', 4, 'Горшечные растения и зелень',             true, NOW()),
  ('e1000000-0000-0000-0000-000000000005', 'УпаковкаПро',          'Виктор Лазарев',   '+74959998877', 'v.lazarev@upakpro.ru','г. Москва, ул. Промышленная, 15',         '7787654321', 'NET_30', 3, 'Упаковочные материалы и аксессуары',      true, NOW())
ON CONFLICT (tax_id) DO NOTHING;

-- ── DELIVERY ZONES ───────────────────────────────────────────────────
INSERT INTO delivery_zones (id, name, polygon, delivery_fee, min_order_amount, active, created_at)
VALUES
  ('f1000000-0000-0000-0000-000000000001', 'Центр города',   NULL, 200.00,  500.00,  true, NOW()),
  ('f1000000-0000-0000-0000-000000000002', 'Ближний район',  NULL, 350.00,  800.00,  true, NOW()),
  ('f1000000-0000-0000-0000-000000000003', 'Дальний район',  NULL, 500.00, 1200.00,  true, NOW())
ON CONFLICT (name) DO NOTHING;

-- ── DELIVERY SLOTS (на ближайшие 7 дней) ────────────────────────────
INSERT INTO delivery_slots (id, date, start_time, end_time, max_capacity, current_load)
SELECT
  gen_random_uuid(),
  CURRENT_DATE + d,
  s::time,
  (s::time + interval '2 hours'),
  10,
  0
FROM
  generate_series(0, 6) AS d,
  unnest(ARRAY['09:00','11:00','13:00','15:00','17:00']) AS s
ON CONFLICT (date, start_time, end_time) DO NOTHING;
