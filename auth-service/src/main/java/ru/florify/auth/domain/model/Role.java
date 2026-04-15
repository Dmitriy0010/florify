package ru.florify.auth.domain.model;

/**
 * Roles available in the Florify system.
 *
 * OWNER            — business owner, full access to all modules
 * ADMIN            — store administrator, manages staff and catalogue
 * FLORIST          — assembles orders, writes off stock
 * CASHIER          — POS terminal operator
 * COURIER          — delivery staff, sees only own assigned orders
 * SUPPLIER_MANAGER — manages suppliers and purchase invoices
 * CUSTOMER         — registered B2C customer (optional account)
 */
public enum Role {
    OWNER,
    ADMIN,
    FLORIST,
    CASHIER,
    COURIER,
    SUPPLIER_MANAGER,
    CUSTOMER
}
