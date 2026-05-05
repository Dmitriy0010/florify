-- ============================================================
-- MIGRATION 10: Migrate orphaned stock from dummy store
-- ============================================================

DO $$
DECLARE
    target_store_id UUID;
    dummy_store_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    -- Find the first real active store
    SELECT id INTO target_store_id FROM stores WHERE id != dummy_store_id AND active = true LIMIT 1;
    
    IF target_store_id IS NOT NULL THEN
        -- 1. Merge stock balances
        -- We insert dummy store's data into target store rows. 
        -- If target store already has the product, we add quantities.
        INSERT INTO stock_balances (id, product_id, store_id, quantity_in_stock, average_cost)
        SELECT 
            gen_random_uuid(),
            product_id,
            target_store_id,
            quantity_in_stock,
            average_cost
        FROM stock_balances
        WHERE store_id = dummy_store_id
        ON CONFLICT (product_id, store_id) DO UPDATE 
        SET quantity_in_stock = stock_balances.quantity_in_stock + EXCLUDED.quantity_in_stock,
            average_cost = CASE 
                WHEN (stock_balances.quantity_in_stock + EXCLUDED.quantity_in_stock) > 0 
                THEN (stock_balances.average_cost * stock_balances.quantity_in_stock + EXCLUDED.average_cost * EXCLUDED.quantity_in_stock) / (stock_balances.quantity_in_stock + EXCLUDED.quantity_in_stock)
                ELSE stock_balances.average_cost
            END;
        
        -- 2. Delete merged balances from dummy store
        DELETE FROM stock_balances WHERE store_id = dummy_store_id;

        -- 3. Update batches
        UPDATE stock_batches SET store_id = target_store_id WHERE store_id = dummy_store_id;

        -- 4. Update transactions
        UPDATE stock_transactions SET store_id = target_store_id WHERE store_id = dummy_store_id;
        
        RAISE NOTICE 'Migrated orphaned stock to store %', target_store_id;
    ELSE
        RAISE NOTICE 'No real store found to migrate stock to.';
    END IF;
END $$;
