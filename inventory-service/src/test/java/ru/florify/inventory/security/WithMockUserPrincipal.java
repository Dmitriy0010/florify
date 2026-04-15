package ru.florify.inventory.security;

import org.springframework.security.test.context.support.WithSecurityContext;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
@WithSecurityContext(factory = WithMockUserPrincipalSecurityContextFactory.class)
public @interface WithMockUserPrincipal {
    String userId() default "d8d3f6d7-83d1-4b1a-8c3a-872e811c0f16";
    String[] roles() default {"USER"};
}
