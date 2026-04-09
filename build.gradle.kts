import org.gradle.api.tasks.testing.logging.TestLogEvent

plugins {
    alias(libs.plugins.spring.boot) apply false
    alias(libs.plugins.spring.dependency.management) apply false
    java
}

// Extract version to a local variable to be accessible in subprojects closure
val javaVersion = libs.versions.java.get()

subprojects {
    group   = "ru.florify"
    version = "0.0.1-SNAPSHOT"

    apply(plugin = "java")
    apply(plugin = "io.spring.dependency-management")

    configure<io.spring.gradle.dependencymanagement.dsl.DependencyManagementExtension> {
        imports {
            mavenBom("org.springframework.boot:spring-boot-dependencies:${rootProject.libs.versions.springBoot.get()}")
        }
    }

    repositories {
        mavenCentral()
    }

    // Configure Java toolchain using the local variable
    configure<JavaPluginExtension> {
        toolchain {
            languageVersion.set(JavaLanguageVersion.of(javaVersion))
        }
    }

    configurations {
        named("compileOnly") {
            extendsFrom(configurations["annotationProcessor"])
        }
    }

    dependencies {
        // Access libs through rootProject if directly not available in subproject scope
        "compileOnly"(rootProject.libs.lombok)
        "annotationProcessor"(rootProject.libs.lombok)
        "annotationProcessor"(rootProject.libs.lombok.mapstruct.binding)
        
        "implementation"(rootProject.libs.mapstruct)
        "annotationProcessor"(rootProject.libs.mapstruct.processor)

        "testCompileOnly"(rootProject.libs.lombok)
        "testAnnotationProcessor"(rootProject.libs.lombok)
        "testAnnotationProcessor"(rootProject.libs.mapstruct.processor)

        "testImplementation"(rootProject.libs.spring.boot.starter.test)
        "testRuntimeOnly"("org.junit.platform:junit-platform-launcher")
    }

    tasks.withType<JavaCompile>().configureEach {
        options.encoding = "UTF-8"
        options.compilerArgs.addAll(listOf("-parameters"))
    }

    tasks.withType<Test>().configureEach {
        useJUnitPlatform()
        testLogging {
            events(TestLogEvent.PASSED, TestLogEvent.SKIPPED, TestLogEvent.FAILED)
        }
    }
}
