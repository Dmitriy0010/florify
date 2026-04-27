plugins {
    java
    alias(libs.plugins.spring.dependency.management)
}

dependencies {
    implementation(project(":common"))

    implementation(libs.spring.boot.starter.web)
    implementation(libs.spring.boot.starter.security)
    implementation(libs.spring.boot.starter.data.jpa)
    implementation(libs.spring.boot.starter.validation)
    implementation(libs.spring.kafka)
    implementation(libs.springdoc.openapi)

    // Email (SMTP)
    implementation("org.springframework.boot:spring-boot-starter-mail")

    // DB
    implementation(libs.flyway.core)
    runtimeOnly(libs.flyway.postgresql)
    runtimeOnly(libs.postgresql)

    // Testing
    testImplementation(libs.spring.boot.starter.test)
    testImplementation("org.springframework.security:spring-security-test")
    testImplementation(libs.spring.kafka.test)
    testImplementation(platform(libs.testcontainers.bom))
    testImplementation(libs.testcontainers.postgres)
    testImplementation(libs.testcontainers.junit.jupiter)
}

tasks.test {
    useJUnitPlatform()
}

