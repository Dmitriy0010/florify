plugins {
    java
        alias(libs.plugins.spring.dependency.management)
}

dependencies {
    implementation(project(":common"))
    testImplementation(testFixtures(project(":common")))

    implementation(libs.spring.boot.starter.web)
    implementation(libs.spring.boot.starter.security)
    implementation(libs.spring.boot.starter.data.jpa)
    implementation(libs.spring.boot.starter.validation)
    implementation(libs.spring.boot.starter.actuator)
    implementation(libs.spring.boot.starter.data.redis)
    implementation(libs.spring.kafka)
    implementation(libs.springdoc.openapi)
    implementation(libs.spring.retry)
    implementation(libs.spring.aspects)

    implementation(libs.flyway.core)
    runtimeOnly(libs.flyway.postgresql)
    runtimeOnly(libs.postgresql)

    implementation(libs.jjwt.api)
    runtimeOnly(libs.jjwt.impl)
    runtimeOnly(libs.jjwt.jackson)

    implementation(libs.mapstruct)
    annotationProcessor(libs.mapstruct.processor)
    annotationProcessor(libs.lombok)
    annotationProcessor(libs.lombok.mapstruct.binding)
    implementation(libs.commons.codec)

    // Testing
    testImplementation(libs.spring.boot.starter.test)
    testImplementation(libs.spring.security.test)
    testImplementation(libs.h2)
    testImplementation(platform(libs.testcontainers.bom))
    testImplementation(libs.testcontainers.postgres)
    testImplementation(libs.testcontainers.junit.jupiter)
}


