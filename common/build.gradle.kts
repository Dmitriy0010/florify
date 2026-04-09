// Common is a plain Java library — NOT a Spring Boot application.
plugins {
    java
}

dependencies {
    // Spring Security API (for UserDetails interface)
    implementation(rootProject.libs.spring.boot.starter.security)
    // Jakarta validation annotations (@NotBlank etc.)
    implementation(rootProject.libs.spring.boot.starter.validation)
    // Web layer needed for @RestControllerAdvice, HttpServletRequest
    implementation(rootProject.libs.spring.boot.starter.web)
    // JWT
    implementation(rootProject.libs.jjwt.api)
    runtimeOnly(rootProject.libs.jjwt.impl)
    runtimeOnly(rootProject.libs.jjwt.jackson)
}

// Ensure it produces a standard JAR
tasks.named<Jar>("jar") {
    enabled = true
}
