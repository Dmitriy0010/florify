FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

RUN apk add --no-cache bash

COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts settings.gradle.kts gradle.properties ./
COPY gradle/libs.versions.toml gradle/

COPY common common
COPY auth-service auth-service
COPY customer-service customer-service
COPY inventory-service inventory-service
COPY order-service order-service
COPY product-catalog-service product-catalog-service
COPY florify-app florify-app

RUN chmod +x gradlew && sed -i 's/\r$//' gradlew

RUN bash ./gradlew :florify-app:bootJar --no-daemon