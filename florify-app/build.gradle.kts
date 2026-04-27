plugins {
    java
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.spring.dependency.management)
}

dependencies {
    implementation(project(":common"))
    implementation(project(":auth-service"))
    implementation(project(":customer-service"))
    implementation(project(":inventory-service"))
    implementation(project(":order-service"))
    implementation(project(":product-catalog-service"))
    implementation(project(":supplier-service"))
    implementation(project(":employee-service"))
    implementation(project(":analytics-service"))
    implementation(project(":notification-service"))
    implementation(project(":media-service"))
    implementation(project(":finance-service"))
    implementation(project(":delivery-service"))
    implementation(project(":store-service"))

    implementation(libs.spring.boot.starter.web)
    implementation(libs.spring.boot.starter.security)
    implementation(libs.spring.boot.starter.validation)
    implementation(libs.springdoc.openapi)
    implementation(libs.spring.boot.starter.actuator)
    implementation(libs.spring.boot.starter.data.jpa)

    implementation(libs.flyway.core)
    runtimeOnly(libs.flyway.postgresql)
    runtimeOnly(libs.postgresql)

    implementation(libs.spring.kafka)

    testImplementation(libs.spring.boot.starter.test)
    testImplementation(platform(libs.testcontainers.bom))
    testImplementation(libs.testcontainers.junit.jupiter)
    testImplementation(libs.testcontainers.postgres)
}

tasks.bootJar {
    archiveFileName.set("florify-app.jar")
}
