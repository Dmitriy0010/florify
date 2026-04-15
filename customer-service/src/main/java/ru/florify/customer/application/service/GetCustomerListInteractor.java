package ru.florify.customer.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.customer.application.port.in.GetCustomerListUseCase;
import ru.florify.customer.application.port.out.CustomerRepository;
import ru.florify.customer.application.query.GetCustomerListQuery;
import ru.florify.common.application.query.PagedResult;
import ru.florify.customer.domain.model.Customer;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GetCustomerListInteractor implements GetCustomerListUseCase {

    private final CustomerRepository customerRepository;

    @Override
    public PagedResult<Customer> execute(GetCustomerListQuery query) {
        return customerRepository.findAll(query);
    }
}
