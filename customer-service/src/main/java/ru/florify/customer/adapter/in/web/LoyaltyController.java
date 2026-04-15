package ru.florify.customer.adapter.in.web;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.florify.common.security.UserPrincipal;
import ru.florify.customer.adapter.in.web.dto.LoyaltyAccountResponse;
import ru.florify.customer.adapter.in.web.dto.LoyaltyTransactionResponse;
import ru.florify.customer.adapter.in.web.mapper.LoyaltyWebMapper;
import ru.florify.customer.application.port.out.CustomerRepository;
import ru.florify.customer.application.port.out.LoyaltyAccountRepository;
import ru.florify.customer.application.port.out.LoyaltyTransactionRepository;
import ru.florify.customer.application.port.out.TierConfigRepository;
import ru.florify.customer.domain.exception.CustomerNotFoundException;
import ru.florify.customer.domain.model.Customer;
import ru.florify.customer.domain.model.LoyaltyAccount;
import ru.florify.customer.domain.model.LoyaltyTierConfig;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/loyalty")
@RequiredArgsConstructor
public class LoyaltyController {

    private final LoyaltyAccountRepository loyaltyAccountRepository;
    private final LoyaltyTransactionRepository transactionRepository;
    private final TierConfigRepository tierConfigRepository;
    private final CustomerRepository customerRepository;
    private final LoyaltyWebMapper mapper;

    @GetMapping("/accounts/me")
    public LoyaltyAccountResponse getMyAccount(@AuthenticationPrincipal UserPrincipal principal) {
        UUID customerId = customerRepository.findByUserId(principal.getUserId())
                .map(Customer::getId)
                .orElseThrow(() -> new CustomerNotFoundException(principal.getUserId()));
        
        LoyaltyAccount account = loyaltyAccountRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new CustomerNotFoundException(customerId));
        return mapper.toResponse(account);
    }

    @GetMapping("/accounts/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public LoyaltyAccountResponse getAccount(@PathVariable UUID customerId) {
        LoyaltyAccount account = loyaltyAccountRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new CustomerNotFoundException(customerId));
        return mapper.toResponse(account);
    }

    @GetMapping("/accounts/{customerId}/transactions")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE') or @securityService.isOwner(#customerId)")
    public List<LoyaltyTransactionResponse> getTransactions(@PathVariable UUID customerId) {
        LoyaltyAccount account = loyaltyAccountRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new CustomerNotFoundException(customerId));
        
        return transactionRepository.findByLoyaltyAccountId(account.getId()).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/tiers")
    public List<LoyaltyTierConfig> getTiers() {
        return tierConfigRepository.findAll();
    }
}
