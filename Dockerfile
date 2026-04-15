FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts settings.gradle.kts gradle.properties ./
COPY gradle/libs.versions.toml gradle/

# Copy all source directories
COPY common common
COPY auth-service auth-service
COPY customer-service customer-service
COPY inventory-service inventory-service
COPY order-service order-service
COPY product-catalog-service product-catalog-service
COPY florify-app florify-app

# Build the modular monolith app
RUN ./gradlew :florify-app:bootJar --no-daemon

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/florify-app/build/libs/florify-app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
