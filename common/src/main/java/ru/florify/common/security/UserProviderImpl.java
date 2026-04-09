package ru.florify.common.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import ru.florify.common.exception.UnauthorizedException;

import java.util.UUID;

/**
 * Default implementation of {@link UserProvider}.
 * Reads {@link UserPrincipal} from the Spring Security Context.
 */
@Component
@RequiredArgsConstructor
public class UserProviderImpl implements UserProvider {

    @Override
    public UUID getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            throw new UnauthorizedException();
        }

        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        return principal.getUserId();
    }
}
