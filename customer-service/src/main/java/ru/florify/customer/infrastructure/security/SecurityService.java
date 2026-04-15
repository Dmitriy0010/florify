package ru.florify.customer.infrastructure.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import ru.florify.common.security.UserPrincipal;
import ru.florify.customer.application.port.out.CustomerRepository;
import ru.florify.customer.domain.model.Customer;

import java.util.UUID;

@Service("securityService")
@RequiredArgsConstructor
public class SecurityService {

    private final CustomerRepository customerRepository;

    public boolean isOwner(UUID customerId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            return false;
        }

        // Employees/Admins skip the check
        if (principal.getAuthorities().stream().anyMatch(a -> 
            a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_EMPLOYEE"))) {
            return true;
        }

        // For CLIENT role, check if userId in Customer record matches JWT userId
        return customerRepository.findById(customerId)
            .map(c -> c.getUserId() != null && c.getUserId().equals(principal.getUserId()))
            .orElse(false);
    }
}
