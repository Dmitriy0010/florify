-- ============================================================
-- DELIVERY SLOTS REFRESH
-- Генерирует слоты доставки на 14 дней вперёд начиная с сегодня.
-- Безопасно запускать повторно (ON CONFLICT DO NOTHING).
-- ============================================================
INSERT INTO delivery_slots (id, date, start_time, end_time, max_capacity, current_load)
SELECT
  gen_random_uuid(),
  CURRENT_DATE + d,
  s::time,
  (s::time + interval '2 hours'),
  10,  -- max_capacity: заказов на слот
  0
FROM
  generate_series(0, 13) AS d,           -- 14 дней вперёд
  unnest(ARRAY['09:00','11:00','13:00','15:00','17:00']) AS s  -- 5 окон в день
ON CONFLICT (date, start_time, end_time) DO NOTHING;
