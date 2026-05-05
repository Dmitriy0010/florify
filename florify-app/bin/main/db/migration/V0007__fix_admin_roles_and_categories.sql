-- Fix category naming (localization)
UPDATE product_categories SET name = 'Общее' WHERE name = 'GENERAL';

-- Assign roles to admin@florify.ru if he exists
-- We extract the id from the logs or try to find by email
DO $$
DECLARE
    admin_id UUID;
BEGIN
    SELECT id INTO admin_id FROM users WHERE email = 'admin@florify.ru';
    
    IF admin_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role) VALUES (admin_id, 'ADMIN') ON CONFLICT DO NOTHING;
        INSERT INTO user_roles (user_id, role) VALUES (admin_id, 'OWNER') ON CONFLICT DO NOTHING;
    END IF;
END $$;
