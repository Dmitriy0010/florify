plugins {
    `java-library`
    `java-test-fixtures`
}

dependencies {
    // Spring Security API (for UserDetails interface)
    implementation(rootProject.libs.spring.boot.starter.security)
    // Jakarta validation annotations (@NotBlank etc.)
    implementation(rootProject.libs.spring.boot.starter.validation)
    // Web layer needed for @RestControllerAdvice, HttpServletRequest
    implementation(rootProject.libs.spring.boot.starter.web)
    // JPA needed for OptimisticLockingFailureException in GlobalExceptionHandler
    implementation(rootProject.libs.spring.boot.starter.data.jpa)
    implementation(rootProject.libs.spring.boot.starter.data.redis)
    // JWT
    implementation(rootProject.libs.jjwt.api)
    runtimeOnly(rootProject.libs.jjwt.impl)
    runtimeOnly(rootProject.libs.jjwt.jackson)

    // JSONB Persistence
    api("io.hypersistence:hypersistence-utils-hibernate-63:3.9.0")
    implementation(rootProject.libs.spring.kafka)

    testFixturesApi(rootProject.libs.spring.boot.starter.test)
    testFixturesApi(rootProject.libs.spring.security.test)
}

// Ensure it produces a standard JAR
tasks.named<Jar>("jar") {
    enabled = true
}
