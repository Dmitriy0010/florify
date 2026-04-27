package ru.florify.common.test;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.lang.NonNull;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import ru.florify.common.security.UserPrincipal;

import java.util.Set;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.securityContext;

/**
 * Utilities for simulating authenticated users in MockMvc tests.
 */
public class SecurityTestSupport {

    public static final UUID ADMIN_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");
    public static final UUID CUSTOMER_ID = UUID.fromString("00000000-0000-0000-0000-000000000002");
    public static final UUID FLORIST_ID = UUID.fromString("00000000-0000-0000-0000-000000000003");

    @NonNull
    public static RequestPostProcessor admin() {
        return authenticated(ADMIN_ID, Set.of("ADMIN", "OWNER"));
    }

    @NonNull
    public static RequestPostProcessor customer() {
        return authenticated(CUSTOMER_ID, Set.of("CUSTOMER"));
    }

    @NonNull
    public static RequestPostProcessor florist() {
        return authenticated(FLORIST_ID, Set.of("FLORIST"));
    }

    @NonNull
    public static RequestPostProcessor authenticated(UUID userId, Set<String> roles) {
        UserPrincipal principal = new UserPrincipal(userId, roles);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                principal, null, principal.getAuthorities()
        );

        return securityContext(contextWith(auth));
    }

    private static SecurityContext contextWith(UsernamePasswordAuthenticationToken auth) {
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        return context;
    }
}
