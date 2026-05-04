package ru.florify.customer.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.florify.customer.application.port.out.CustomerRepository;
import ru.florify.common.application.query.PagedResult;
import ru.florify.customer.application.port.in.GetCustomerListUseCase;
import ru.florify.customer.application.query.GetCustomerListQuery;
import ru.florify.customer.domain.model.Customer;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GetCustomerListInteractorTest {

    @Mock
    private CustomerRepository customerRepository;

    private GetCustomerListInteractor interactor;

    @BeforeEach
    void setUp() {
        interactor = new GetCustomerListInteractor(customerRepository);
    }

    @Test
    @DisplayName("Should returning paged result from repository")
    void shouldReturnPagedResult() {
        // given
        GetCustomerListQuery query = new GetCustomerListQuery(null, null, null, 0, 10);
        PagedResult<Customer> expected = new PagedResult<>(List.of(mock(Customer.class)), 0, 10, 1);
        when(customerRepository.findAll(query, false)).thenReturn(expected);

        // when
        PagedResult<Customer> result = interactor.execute(query, false);

        // then
        assertThat(result).isEqualTo(expected);
    }
}
