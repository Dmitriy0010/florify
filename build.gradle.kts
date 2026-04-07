import org.gradle.api.tasks.testing.logging.TestLogEvent

plugins {
    alias(libs.plugins.spring.boot) apply false
    alias(libs.plugins.spring.dependency.management) apply false
}

// -------------------------------------------------------------------
// Shared configuration for ALL subprojects (including common library)
// -------------------------------------------------------------------
subprojects {
    group   = "ru.florify"
    version = "0.0.1-SNAPSHOT"

    apply(plugin = "java")
    apply(plugin = "io.spring.dependency-management")

    repositories {
        mavenCentral()
    }

    java {
        toolchain {
            languageVersion.set(JavaLanguageVersion.of(libs.versions.java.get()))
        }
    }

    // Lombok annotation processor wired for both main and test sources
    configurations {
        named("compileOnly") {
            extendsFrom(configurations["annotationProcessor"])
        }
    }

    dependencies {
        "compileOnly"(libs.lombok)
        "annotationProcessor"(libs.lombok)
        "testCompileOnly"(libs.lombok)
        "testAnnotationProcessor"(libs.lombok)

        "testImplementation"(libs.spring.boot.starter.test)
        "testRuntimeOnly"("org.junit.platform:junit-platform-launcher")
    }

    tasks.withType<JavaCompile>().configureEach {
        options.encoding = "UTF-8"
        options.compilerArgs.addAll(listOf("-parameters"))   // needed for Spring MVC arg name resolution
    }

    tasks.withType<Test>().configureEach {
        useJUnitPlatform()
        testLogging {
            events(TestLogEvent.PASSED, TestLogEvent.SKIPPED, TestLogEvent.FAILED)
        }
    }
}
