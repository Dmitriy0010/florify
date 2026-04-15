package ru.florify.catalog.security;

import org.springframework.security.test.context.support.WithSecurityContext;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
@WithSecurityContext(factory = WithMockUserPrincipalSecurityContextFactory.class)
public @interface WithMockUserPrincipal {
    String userId() default "d8d8d8d8-d8d8-4d8d-8d8d-d8d8d8d8d8d8";
    String[] roles() default {"CUSTOMER"};
}
