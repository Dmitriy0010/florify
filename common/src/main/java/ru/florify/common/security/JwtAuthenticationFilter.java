package ru.florify.common.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * JWT authentication filter executed once per HTTP request.
 * <p>
 * Flow:
 * <ol>
 *   <li>Reads the {@code Authorization: Bearer <token>} header.</li>
 *   <li>Validates and parses the JWT using the configured secret.</li>
 *   <li>Extracts roles from token claims.</li>
 *   <li>Builds a {@link UserPrincipal} and stores it in the Security Context.</li>
 * </ol>
 * If the token is missing or invalid the filter passes the request through
 * without setting authentication — Spring Security will then apply its own
 * access control rules (e.g. return 401 for protected endpoints).
 */
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProperties jwtProperties;
    private final TokenBlacklist tokenBlacklist;

    public JwtAuthenticationFilter(JwtProperties jwtProperties, TokenBlacklist tokenBlacklist) {
        this.jwtProperties = jwtProperties;
        this.tokenBlacklist = tokenBlacklist;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws IOException, jakarta.servlet.ServletException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            
            if (token.isEmpty()) {
                filterChain.doFilter(request, response);
                return;
            }
            
            if (tokenBlacklist != null && tokenBlacklist.isBlacklisted(token)) {
                log.warn("Token is blacklisted: {}", token);
            } else {
                UserPrincipal principal = parseToken(token);

                if (principal != null) {
                    log.info("Successfully authenticated user from JWT: {} with roles {}", principal.getUserId(), principal.getAuthorities());
                    var authentication = new UsernamePasswordAuthenticationToken(
                            principal, token, principal.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } else {
                    log.warn("Failed to parse/validate JWT token");
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private UserPrincipal parseToken(String token) {
        try {
            var key = Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
            Jws<Claims> jws = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);

            UUID userId = UUID.fromString(jws.getPayload().getSubject());
            
            @SuppressWarnings("unchecked")
            List<String> rolesList = jws.getPayload().get("roles", List.class);
            Set<String> roles = (rolesList != null) 
                    ? Set.copyOf(rolesList)
                    : Set.of();

            return new UserPrincipal(userId, roles);
        } catch (Exception ex) {
            log.warn("Invalid JWT token: {}", ex.getMessage());
            return null;
        }
    }
}
