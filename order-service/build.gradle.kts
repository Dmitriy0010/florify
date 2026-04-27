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
    implementation(libs.spring.boot.starter.websocket)
    implementation(libs.spring.kafka)
    implementation(libs.springdoc.openapi)
    implementation(libs.spring.retry)
    implementation(libs.spring.aspects)

    implementation(libs.flyway.core)
    runtimeOnly(libs.flyway.postgresql)
    runtimeOnly(libs.postgresql)

    // Annotation Processing
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")
    compileOnly("org.mapstruct:mapstruct:1.6.3")
    annotationProcessor("org.mapstruct:mapstruct-processor:1.6.3")

    // Tests
    testImplementation(libs.spring.boot.starter.test)
    testImplementation(libs.spring.security.test)
    testImplementation(libs.h2)
    testImplementation(platform(libs.testcontainers.bom))
    testImplementation(libs.testcontainers.postgres)
    testImplementation("org.testcontainers:testcontainers")
    testImplementation(libs.spring.kafka.test)
    testImplementation("org.awaitility:awaitility:4.2.2")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}


tasks.test {
    useJUnitPlatform()
}

