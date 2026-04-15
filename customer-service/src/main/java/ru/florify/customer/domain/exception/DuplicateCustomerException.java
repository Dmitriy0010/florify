package ru.florify.customer.domain.exception;

public class DuplicateCustomerException extends RuntimeException {
    public DuplicateCustomerException(String phone) {
        super("Customer already exists with phone: " + phone);
    }
}
