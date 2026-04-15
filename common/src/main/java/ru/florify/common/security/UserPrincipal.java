package ru.florify.common.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Immutable representation of an authenticated Florify user
 * stored inside the Spring Security Context.
 * <p>
 * Carries only what is needed for authorization: userId and roles.
 * Password is intentionally absent — it is not stored in the token.
 */
public final class UserPrincipal implements UserDetails {

    private final UUID userId;
    private final Set<String> roles;

    public UserPrincipal(UUID userId, Set<String> roles) {
        this.userId = userId;
        this.roles  = Set.copyOf(roles);
    }

    public UUID getUserId() {
        return userId;
    }

    public Set<String> getRoles() {
        return roles;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.replace("ROLE_", "")))
                .collect(Collectors.toUnmodifiableList());
    }

    // Password is not stored here — JWT is stateless
    @Override public String  getPassword()           { return null; }
    @Override public String  getUsername()           { return userId.toString(); }
    @Override public boolean isAccountNonExpired()   { return true; }
    @Override public boolean isAccountNonLocked()    { return true; }
    @Override public boolean isCredentialsNonExpired(){ return true; }
    @Override public boolean isEnabled()             { return true; }
}
