FROM amazoncorretto:23-alpine AS builder

WORKDIR /workspace

# Copying common gradle files
COPY gradlew gradlew
COPY gradlew.bat gradlew.bat
COPY settings.gradle.kts settings.gradle.kts
COPY build.gradle.kts build.gradle.kts
COPY gradle gradle

RUN chmod +x gradlew
# Download dependencies for faster rebuilds
RUN ./gradlew --no-daemon dependencies || true

# Copy source code (later we will add modules)
COPY . .

# Root build (since it is modular monolith)
RUN chmod +x gradlew
RUN ./gradlew --no-daemon bootJar

FROM amazoncorretto:23-alpine AS runtime

ENV TZ=UTC \
    LANG=C.UTF-8 \
    JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -Dspring.threads.virtual.enabled=true"

WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring

# Final application JAR will be located here after build
COPY --from=builder /workspace/*/build/libs/*-SNAPSHOT.jar /app/app.jar

RUN chown -R spring:spring /app

USER spring

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
