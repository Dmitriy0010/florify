package ru.florify.order.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import ru.florify.order.application.port.out.OrderNumberGenerator;

@Component
@RequiredArgsConstructor
public class DatabaseOrderNumberGenerator implements OrderNumberGenerator {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public String next() {
        Long nextVal = jdbcTemplate.queryForObject("SELECT nextval('order_number_seq')", Long.class);
        return String.format("ORD-%06d", nextVal);
    }
}
