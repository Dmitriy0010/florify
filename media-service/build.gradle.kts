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
    implementation(libs.springdoc.openapi)

    // DB
    implementation(libs.flyway.core)
    runtimeOnly(libs.flyway.postgresql)
    runtimeOnly(libs.postgresql)

    // Media
    implementation(libs.minio)
    implementation("com.twelvemonkeys.imageio:imageio-webp:3.12.0")
    implementation("com.twelvemonkeys.imageio:imageio-core:3.12.0")
    implementation("net.coobird:thumbnailator:0.4.20")

    // Annotation Processing is handled in root build.gradle.kts
    
    testImplementation(libs.spring.boot.starter.test)
    testImplementation(libs.spring.security.test)
    testImplementation(libs.h2)
}

tasks.test {
    useJUnitPlatform()
}
