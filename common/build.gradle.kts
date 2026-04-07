// Common is a plain Java library — NOT a Spring Boot application.
// It has no main class and produces a plain JAR consumed by other modules.
plugins {
    java
}

dependencies {
    // Spring Security API (for UserDetails interface)
    implementation(libs.spring.boot.starter.security)
    // Jakarta validation annotations (@NotBlank etc.)
    implementation(libs.spring.boot.starter.validation)
    // Web layer needed for @RestControllerAdvice, HttpServletRequest
    implementation(libs.spring.boot.starter.web)
    // JWT
    implementation(libs.jjwt.api)
    runtimeOnly(libs.jjwt.impl)
    runtimeOnly(libs.jjwt.jackson)
}

// This module is a library, not a runnable app
tasks.named<org.springframework.boot.gradle.tasks.bundling.BootJar>("bootJar") {
    enabled = false
}
tasks.named<Jar>("jar") {
    enabled = true
}
