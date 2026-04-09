-- Migration to add profile fields to users table
ALTER TABLE auth.users
    ADD COLUMN phone      VARCHAR(20)  UNIQUE,
    ADD COLUMN first_name VARCHAR(100),
    ADD COLUMN last_name  VARCHAR(100);
