package ru.florify.customer.adapter.in.web;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.florify.common.security.UserPrincipal;
import ru.florify.customer.adapter.in.web.dto.AdjustPointsRequest;
import ru.florify.customer.adapter.in.web.dto.LoyaltyAccountResponse;
import ru.florify.customer.adapter.in.web.dto.LoyaltyStatsResponse;
import ru.florify.customer.adapter.in.web.dto.LoyaltyTierInfoResponse;
import ru.florify.customer.adapter.in.web.dto.LoyaltyTransactionResponse;
import ru.florify.customer.adapter.in.web.mapper.LoyaltyWebMapper;
import ru.florify.customer.application.port.in.AdjustPointsUseCase;
import ru.florify.customer.application.port.out.CustomerRepository;
import ru.florify.customer.application.port.out.LoyaltyAccountRepository;
import ru.florify.customer.adapter.out.persistence.repository.LoyaltyAccountJpaRepository;
import ru.florify.customer.adapter.out.persistence.repository.LoyaltyTransactionJpaRepository;
import ru.florify.customer.application.port.out.LoyaltyTransactionRepository;
import ru.florify.customer.domain.enums.LoyaltyTier;
import ru.florify.customer.domain.exception.CustomerNotFoundException;
import ru.florify.customer.domain.model.Customer;
import ru.florify.customer.domain.model.LoyaltyAccount;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/loyalty")
@RequiredArgsConstructor
public class LoyaltyController {

    private final LoyaltyAccountRepository loyaltyAccountRepository;
    private final LoyaltyTransactionRepository transactionRepository;
    private final LoyaltyAccountJpaRepository loyaltyAccountJpaRepository;
    private final LoyaltyTransactionJpaRepository loyaltyTransactionJpaRepository;
    private final CustomerRepository customerRepository;
    private final AdjustPointsUseCase adjustPointsUseCase;
    private final LoyaltyWebMapper mapper;

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public LoyaltyStatsResponse getStats() {
        Long earned = loyaltyTransactionJpaRepository.sumTotalEarnedPoints();
        Long spent = loyaltyTransactionJpaRepository.sumTotalSpentPoints();
        Long active = loyaltyAccountJpaRepository.sumTotalActivePoints();
        
        List<LoyaltyTransactionResponse> recent = loyaltyTransactionJpaRepository.findAllGlobalRecent().stream()
                .limit(10)
                .map(mapper::toResponse)
                .toList();
                
        return new LoyaltyStatsResponse(
                earned != null ? earned : 0L,
                spent != null ? spent : 0L,
                active != null ? active : 0L,
                recent
        );
    }

    @GetMapping("/transactions/global")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public List<LoyaltyTransactionResponse> getGlobalTransactions() {
        return loyaltyTransactionJpaRepository.findAllGlobalRecent().stream()
                .map(mapper::toResponse)
                .toList();
    }

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
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'CASHIER')")
    public LoyaltyAccountResponse getAccount(@PathVariable UUID customerId) {
        LoyaltyAccount account = loyaltyAccountRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new CustomerNotFoundException(customerId));
        return mapper.toResponse(account);
    }

    @GetMapping("/accounts/{customerId}/transactions")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'CASHIER') or @securityService.isOwner(#customerId)")
    public List<LoyaltyTransactionResponse> getTransactions(@PathVariable UUID customerId) {
        LoyaltyAccount account = loyaltyAccountRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new CustomerNotFoundException(customerId));
        
        return transactionRepository.findByLoyaltyAccountId(account.getId()).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/tiers")
    public List<LoyaltyTierInfoResponse> getTiers() {
        return Arrays.stream(LoyaltyTier.values())
                .map(LoyaltyTierInfoResponse::from)
                .toList();
    }

    @PostMapping("/accounts/{customerId}/adjust")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public void adjustPoints(@PathVariable UUID customerId, @RequestBody AdjustPointsRequest request) {
        adjustPointsUseCase.execute(new AdjustPointsUseCase.AdjustPointsCommand(
                customerId,
                request.points(),
                request.type(),
                request.description()
        ));
    }
}
