# ✅ AUTH-SERVICE — Полный чеклист до Production-Ready
**Проект:** Florify | **Сервис:** `auth-service`  
**Архитектура:** Hexagonal (Ports & Adapters) | **Стек:** Java 23, Spring Boot 3, JPA, Kafka, Redis

> Каждый пункт — конкретное действие. Выполнил → ставишь галку.  
> Порядок имеет значение: блоки идут от Domain → Application → Adapter (Inside-Out).

---

## 📦 БЛОК 0 — Структура модуля (привести к единому стилю)

### 0.1 Целевая структура пакетов
```
auth-service/src/main/java/ru/florify/auth/
│
├── domain/
│   ├── model/
│   │   ├── User.java
│   │   ├── RefreshToken.java          ← ДОБАВИТЬ
│   │   └── Role.java
│   ├── event/
│   │   └── UserRegisteredEvent.java   ← ДОБАВИТЬ
│   └── exception/
│       ├── AuthCredentialsInvalidException.java
│       ├── TokenExpiredException.java ← ДОБАВИТЬ
│       └── TokenInvalidException.java ← ДОБАВИТЬ
│
├── application/
│   ├── port/
│   │   ├── in/                        ← ПЕРЕМЕСТИТЬ UseCase-интерфейсы сюда
│   │   │   ├── RegisterUserUseCase.java
│   │   │   ├── LoginUserUseCase.java
│   │   │   ├── RefreshTokenUseCase.java    ← ДОБАВИТЬ
│   │   │   ├── LogoutUseCase.java          ← ДОБАВИТЬ
│   │   │   ├── GetCurrentUserUseCase.java  ← ДОБАВИТЬ
│   │   │   └── AssignRoleUseCase.java      ← ДОБАВИТЬ
│   │   └── out/
│   │       ├── UserRepository.java
│   │       ├── RefreshTokenRepository.java ← ДОБАВИТЬ
│   │       ├── PasswordHasher.java
│   │       ├── TokenBlacklist.java         ← ДОБАВИТЬ (Redis port)
│   │       └── EventPublisher.java         ← ДОБАВИТЬ (Kafka port)
│   ├── command/
│   │   ├── RegisterUserCommand.java
│   │   ├── LoginUserCommand.java
│   │   ├── RefreshTokenCommand.java    ← ДОБАВИТЬ
│   │   ├── LogoutCommand.java          ← ДОБАВИТЬ
│   │   └── AssignRoleCommand.java      ← ДОБАВИТЬ
│   └── service/
│       ├── RegisterUserInteractor.java
│       ├── LoginUserInteractor.java
│       ├── RefreshTokenInteractor.java  ← ДОБАВИТЬ
│       ├── LogoutInteractor.java        ← ДОБАВИТЬ
│       ├── GetCurrentUserInteractor.java← ДОБАВИТЬ
│       ├── AssignRoleInteractor.java    ← ДОБАВИТЬ
│       └── JwtService.java
│
└── adapter/
    ├── in/
    │   └── web/
    │       ├── AuthController.java
    │       └── dto/
    │           ├── RegisterRequest.java
    │           ├── LoginRequest.java
    │           ├── RefreshTokenRequest.java  ← ДОБАВИТЬ
    │           ├── AssignRoleRequest.java    ← ДОБАВИТЬ
    │           ├── TokenResponse.java        ← РАСШИРИТЬ
    │           └── UserResponse.java         ← ДОБАВИТЬ
    └── out/
        ├── persistence/
        │   ├── UserJpaEntity.java
        │   ├── UserJpaRepository.java
        │   ├── JpaUserRepositoryAdapter.java
        │   ├── RefreshTokenJpaEntity.java      ← ДОБАВИТЬ
        │   ├── RefreshTokenJpaRepository.java  ← ДОБАВИТЬ
        │   ├── JpaRefreshTokenRepositoryAdapter.java ← ДОБАВИТЬ
        │   └── UserMapper.java
        ├── security/
        │   └── BcryptPasswordHasher.java
        ├── cache/
        │   └── RedisTokenBlacklist.java        ← ДОБАВИТЬ
        ├── messaging/
        │   └── KafkaEventPublisher.java         ← ДОБАВИТЬ
        └── config/
            ├── SecurityConfig.java
            ├── KafkaConfig.java                ← ДОБАВИТЬ
            └── RedisConfig.java                ← ДОБАВИТЬ
```

- [ ] Переместить `UseCase`-интерфейсы из `application/usecase/` в `application/port/in/`
- [ ] Переместить `UserRepository`, `PasswordHasher` из `domain/port/` в `application/port/out/`
- [ ] Переместить `BcryptPasswordHasher` из `adapter/security/` в `adapter/out/security/`
- [ ] Переместить `JpaUserRepositoryAdapter` в `adapter/out/persistence/`
- [ ] Переместить `AuthController` в `adapter/in/web/`
- [ ] Убедиться что `SecurityConfig` лежит в `adapter/out/config/`
- [ ] Убедиться что пакет `domain` не содержит Spring-импортов (чистый Java)

---

## 🏛️ БЛОК 1 — Domain Layer

### 1.1 Обновить `Role.java`
- [ ] Добавить роли `ADMIN`, `CASHIER`, `SUPPLIER_MANAGER` в enum
```java
public enum Role {
    OWNER,
    ADMIN,
    FLORIST,
    CASHIER,
    COURIER,
    SUPPLIER_MANAGER,
    CLIENT
}
```

### 1.2 Обновить `User.java`
- [ ] Добавить поле `phone: String` (nullable, для клиентов B2C)
- [ ] Добавить поле `firstName: String` (nullable)
- [ ] Добавить поле `lastName: String` (nullable)
- [ ] Убедиться что класс `@Value @Builder` (immutable) — уже есть, оставить
- [ ] Убедиться что нет ни одного Spring/JPA импорта — чистый Java

### 1.3 Создать `RefreshToken.java` (новый domain model)
- [ ] Поля: `id: UUID`, `userId: UUID`, `tokenHash: String`, `deviceInfo: String`, `expiresAt: Instant`, `createdAt: Instant`, `isRevoked: boolean`
- [ ] Метод `isExpired()`: `return Instant.now().isAfter(expiresAt)`
- [ ] Метод `isValid()`: `return !isRevoked && !isExpired()`
- [ ] Статический фабричный метод `RefreshToken.create(userId, tokenHash, ttlDays, deviceInfo)`
- [ ] Метод `revoke()` — возвращает новый экземпляр с `isRevoked=true` (immutable)
- [ ] `@Value @Builder` — нет JPA-аннотаций

### 1.4 Создать `UserRegisteredEvent.java` (новый domain event)
- [ ] Поля: `eventId: UUID`, `userId: UUID`, `email: String`, `roles: Set<Role>`, `occurredAt: Instant`
- [ ] Статический фабричный метод `UserRegisteredEvent.from(User user)`
- [ ] Нет Spring-импортов

### 1.5 Создать `TokenExpiredException.java`
- [ ] Наследовать `ru.florify.common.exception.DomainException`
- [ ] Конструктор: `super("TOKEN_EXPIRED", "Token has expired")`

### 1.6 Создать `TokenInvalidException.java`
- [ ] Наследовать `ru.florify.common.exception.DomainException`
- [ ] Конструктор: `super("TOKEN_INVALID", "Token is invalid or has been revoked")`

### 1.7 Проверить `AuthCredentialsInvalidException.java`
- [ ] Наследует `ru.florify.common.exception.DomainException` — уже есть ✅

---

## 🚪 БЛОК 2 — Application Ports (Out)

### 2.1 Обновить `UserRepository.java`
- [ ] Метод `save(User user): User` — уже есть
- [ ] Метод `findById(UUID id): Optional<User>` — уже есть
- [ ] Метод `findByEmail(String email): Optional<User>` — уже есть
- [ ] Метод `existsByEmail(String email): boolean` — уже есть
- [ ] Добавить метод `findByPhone(String phone): Optional<User>`
- [ ] Добавить метод `existsByPhone(String phone): boolean`

### 2.2 Создать `RefreshTokenRepository.java`
- [ ] Метод `save(RefreshToken token): RefreshToken`
- [ ] Метод `findByTokenHash(String hash): Optional<RefreshToken>`
- [ ] Метод `findAllByUserId(UUID userId): List<RefreshToken>`
- [ ] Метод `revokeAllByUserId(UUID userId): void` (для logout-all-devices)

### 2.3 Создать `TokenBlacklist.java` (Redis port)
- [ ] Метод `blacklist(String accessToken, Duration ttl): void`
- [ ] Метод `isBlacklisted(String accessToken): boolean`

### 2.4 Создать `EventPublisher.java` (Kafka port)
- [ ] Метод `publish(Object event): void`
- [ ] Интерфейс принимает `Object` — реализация знает топик по типу события

---

## ⚙️ БЛОК 3 — Application Commands

### 3.1 Обновить `RegisterUserCommand.java`
- [ ] Добавить поле `phone: String` (nullable)
- [ ] Добавить поля `firstName: String`, `lastName: String` (nullable)
- [ ] Поле `deviceInfo: String` — для записи в RefreshToken

### 3.2 Обновить `LoginUserCommand.java`
- [ ] Добавить поле `deviceInfo: String`

### 3.3 Создать `RefreshTokenCommand.java`
- [ ] Поля: `refreshToken: String`, `deviceInfo: String`

### 3.4 Создать `LogoutCommand.java`
- [ ] Поля: `accessToken: String`, `refreshToken: String`, `userId: UUID`

### 3.5 Создать `AssignRoleCommand.java`
- [ ] Поля: `targetUserId: UUID`, `role: Role`, `performerUserId: UUID`
- [ ] Валидация: `performerUserId` должен иметь роль `OWNER`

---

## ⚙️ БЛОК 4 — Application Ports (In) — Use Case интерфейсы

### 4.1 `RegisterUserUseCase.java` — переместить в `port/in/`
- [ ] Возвращаемый тип изменить: `AuthTokensResult` вместо `User` (см. блок 5)

### 4.2 `LoginUserUseCase.java` — переместить в `port/in/`
- [ ] Возвращаемый тип: `AuthTokensResult`

### 4.3 Создать `RefreshTokenUseCase.java`
```java
public interface RefreshTokenUseCase extends UseCase<RefreshTokenCommand, AuthTokensResult> {}
```

### 4.4 Создать `LogoutUseCase.java`
```java
public interface LogoutUseCase extends UseCase<LogoutCommand, Void> {}
```

### 4.5 Создать `GetCurrentUserUseCase.java`
```java
public interface GetCurrentUserUseCase extends UseCase<UUID, User> {}
```

### 4.6 Создать `AssignRoleUseCase.java`
```java
public interface AssignRoleUseCase extends UseCase<AssignRoleCommand, User> {}
```

### 4.7 Создать `AuthTokensResult.java` (Result DTO — в `application/`)
```java
public record AuthTokensResult(
    String accessToken,
    String refreshToken,
    Instant accessTokenExpiresAt,
    Instant refreshTokenExpiresAt,
    UUID userId,
    Set<Role> roles
) {}
```
- [ ] Это НЕ domain model и НЕ HTTP DTO — это Application-layer result

---

## ⚙️ БЛОК 5 — Application Services (Interactors)

### 5.1 Обновить `RegisterUserInteractor.java`
- [ ] Добавить проверку уникальности телефона если `phone != null`
- [ ] Добавить `firstName`, `lastName`, `phone` при создании `User`
- [ ] После `userRepository.save(newUser)`:
  - [ ] Вызвать `jwtService.generateAccessToken(user)` → access token
  - [ ] Сгенерировать refresh token: `UUID.randomUUID().toString()`
  - [ ] Хешировать refresh token: `passwordHasher.hash(rawRefreshToken)` 
  - [ ] Создать `RefreshToken.create(userId, hash, 30, command.deviceInfo())`
  - [ ] Сохранить через `refreshTokenRepository.save(...)`
  - [ ] Опубликовать `UserRegisteredEvent.from(user)` через `eventPublisher.publish(...)`
  - [ ] Вернуть `AuthTokensResult` с обоими токенами
- [ ] Убрать из контроллера вызов `jwtService` (логика генерации токенов — в интеракторе)

### 5.2 Обновить `LoginUserInteractor.java`
- [ ] Та же логика refresh token что в `RegisterUserInteractor`
- [ ] После успешного логина — создать новый refresh token
- [ ] Вернуть `AuthTokensResult`
- [ ] Убрать из контроллера вызов `jwtService`

### 5.3 Создать `RefreshTokenInteractor.java`
```
Алгоритм:
1. Найти RefreshToken по хешу rawToken через refreshTokenRepository
2. Если не найден → throw TokenInvalidException
3. Если !token.isValid() → throw TokenExpiredException или TokenInvalidException
4. Загрузить User по token.getUserId()
5. Отозвать старый refresh token: token.revoke() → сохранить
6. Сгенерировать новую пару токенов (rotate refresh token)
7. Сохранить новый RefreshToken
8. Вернуть AuthTokensResult
```
- [ ] Имплементирует `RefreshTokenUseCase`
- [ ] `@Transactional`
- [ ] Rotation стратегия: старый refresh token отзывается, выдаётся новый

### 5.4 Создать `LogoutInteractor.java`
```
Алгоритм:
1. Добавить accessToken в Redis blacklist: tokenBlacklist.blacklist(token, remainingTtl)
2. Найти RefreshToken по хешу → revoke() → сохранить
3. Вернуть Void
```
- [ ] Имплементирует `LogoutUseCase`
- [ ] TTL для blacklist = оставшееся время жизни access-токена (парсить из JWT)

### 5.5 Создать `GetCurrentUserInteractor.java`
```
Алгоритм:
1. userRepository.findById(userId)
2. Если не найден → throw NotFoundException("User", userId)
3. Вернуть User
```
- [ ] Имплементирует `GetCurrentUserUseCase`
- [ ] `@Transactional(readOnly = true)`

### 5.6 Создать `AssignRoleInteractor.java`
```
Алгоритм:
1. Загрузить performer (кто назначает)
2. Проверить что performer имеет роль OWNER → иначе ForbiddenException
3. Загрузить targetUser
4. Нельзя назначить OWNER другому (только один владелец) → проверка
5. Обновить роли targetUser → сохранить
6. Вернуть обновлённый User
```
- [ ] Имплементирует `AssignRoleUseCase`
- [ ] `@Transactional`

### 5.7 Обновить `JwtService.java`
- [ ] Метод `generateAccessToken(User user): String` — уже есть, убедиться что TTL 15 мин (не 1440!)
- [ ] Добавить метод `getRemainingTtl(String token): Duration` — для blacklist при logout
- [ ] Добавить метод `extractUserId(String token): UUID` — публичный (используется в LogoutInteractor)
- [ ] Убедиться что roles кладутся в claim как список, а не строка через запятую:
```java
// ❌ Сейчас — строка "OWNER,FLORIST"
.claim("roles", rolesStr)

// ✅ Должно быть — JSON-массив
.claim("roles", user.getRoles().stream().map(Enum::name).toList())
```
- [ ] Обновить `JwtAuthenticationFilter` в `common` — парсить roles как `List<String>` из claim

---

## 🔌 БЛОК 6 — Adapters (Out)

### 6.1 Обновить `UserJpaEntity.java`
- [ ] Добавить поля `phone VARCHAR(20) UNIQUE NULLABLE`, `first_name`, `last_name`
- [ ] Убедиться что `@Table(name = "users", schema = "auth")`

### 6.2 Обновить `UserJpaRepository.java`
- [ ] Добавить `findByPhone(String phone): Optional<UserJpaEntity>`
- [ ] Добавить `existsByPhone(String phone): boolean`

### 6.3 Обновить `JpaUserRepositoryAdapter.java`
- [ ] Реализовать `findByPhone` и `existsByPhone`

### 6.4 Обновить `UserMapper.java` (MapStruct)
- [ ] Добавить маппинг новых полей `phone`, `firstName`, `lastName`
- [ ] Убедиться что `@Mapper(componentModel = "spring", unmappedTargetPolicy = ERROR)` — строгий режим

### 6.5 Создать `RefreshTokenJpaEntity.java`
```java
@Entity
@Table(name = "refresh_tokens", schema = "auth")
// Поля:
UUID id
UUID userId  → @Column + индекс
String tokenHash  → @Column(unique = true)
String deviceInfo
Instant expiresAt
Instant createdAt
boolean revoked
```
- [ ] `@Index` на `user_id` для быстрого `findAllByUserId`
- [ ] Нет `@Version` — refresh токены не нуждаются в optimistic lock

### 6.6 Создать `RefreshTokenJpaRepository.java`
```java
Optional<RefreshTokenJpaEntity> findByTokenHash(String hash);
List<RefreshTokenJpaEntity> findAllByUserId(UUID userId);

@Modifying
@Query("UPDATE RefreshTokenJpaEntity t SET t.revoked = true WHERE t.userId = :userId")
void revokeAllByUserId(@Param("userId") UUID userId);
```

### 6.7 Создать `JpaRefreshTokenRepositoryAdapter.java`
- [ ] Имплементирует `RefreshTokenRepository` (порт)
- [ ] Маппинг domain ↔ entity вручную (без MapStruct — слишком простая модель)

### 6.8 Создать `RedisTokenBlacklist.java`
```java
@Component
@RequiredArgsConstructor
public class RedisTokenBlacklist implements TokenBlacklist {
    private final ReactiveRedisTemplate<String, String> redisTemplate;
    // ИЛИ StringRedisTemplate если не реактивный

    private static final String PREFIX = "auth:blacklist:";

    @Override
    public void blacklist(String token, Duration ttl) {
        // ключ = PREFIX + SHA256(token) чтобы не хранить сам токен
        String key = PREFIX + DigestUtils.sha256Hex(token);
        redisTemplate.opsForValue().set(key, "1", ttl);
    }

    @Override
    public boolean isBlacklisted(String token) {
        String key = PREFIX + DigestUtils.sha256Hex(token);
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }
}
```
- [ ] В `JwtAuthenticationFilter` (в `common`) добавить вызов `tokenBlacklist.isBlacklisted(token)` → если true → не аутентифицировать
- [ ] Ключ — хеш токена (SHA-256), не сам токен (безопасность)

### 6.9 Создать `KafkaEventPublisher.java`
```java
@Component
@RequiredArgsConstructor
public class KafkaEventPublisher implements EventPublisher {
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final Map<Class<?>, String> TOPIC_MAP = Map.of(
        UserRegisteredEvent.class, "auth.user.registered"
    );

    @Override
    public void publish(Object event) {
        String topic = TOPIC_MAP.get(event.getClass());
        if (topic == null) throw new IllegalArgumentException("Unknown event type: " + event.getClass());
        kafkaTemplate.send(topic, event);
    }
}
```

---

## 🔌 БЛОК 7 — Adapters (In) — REST Controller

### 7.1 Обновить `AuthController.java`
- [ ] Убрать инжект `JwtService` из контроллера — он не должен туда знать про токены
- [ ] Добавить инжект всех новых UseCase-ов
- [ ] Все эндпоинты возвращают `ResponseEntity<>`

#### Полный список эндпоинтов:

**POST `/api/auth/register`** — уже есть, обновить
- [ ] Request body: `RegisterRequest` (добавить `phone`, `firstName`, `lastName`, `deviceInfo`)
- [ ] Ответ: `TokenResponse` с `accessToken` + `refreshToken` + `expiresAt`
- [ ] HTTP 201 Created

**POST `/api/auth/login`** — уже есть, обновить
- [ ] Request body: `LoginRequest` (добавить `deviceInfo`)
- [ ] Ответ: `TokenResponse`
- [ ] HTTP 200

**POST `/api/auth/refresh`** — ДОБАВИТЬ
- [ ] Request body: `RefreshTokenRequest(refreshToken: String)`
- [ ] Ответ: `TokenResponse`
- [ ] HTTP 200
- [ ] Публичный endpoint (не требует access token)

**POST `/api/auth/logout`** — ДОБАВИТЬ
- [ ] Требует: `Authorization: Bearer <accessToken>` header
- [ ] Request body: `{ "refreshToken": "..." }`
- [ ] Достать accessToken из заголовка через `HttpServletRequest`
- [ ] Достать userId из `@AuthenticationPrincipal UserPrincipal`
- [ ] HTTP 204 No Content

**GET `/api/auth/me`** — ДОБАВИТЬ
- [ ] Требует аутентификации
- [ ] Достать userId из `@AuthenticationPrincipal UserPrincipal`
- [ ] Ответ: `UserResponse(id, email, phone, firstName, lastName, roles, createdAt)`
- [ ] HTTP 200

**PUT `/api/auth/users/{userId}/role`** — ДОБАВИТЬ
- [ ] Требует роли `OWNER` (`@PreAuthorize("hasRole('OWNER')")`)
- [ ] Request body: `AssignRoleRequest(role: Role)`
- [ ] HTTP 200, возвращает обновлённый `UserResponse`

### 7.2 Обновить `TokenResponse.java`
```java
public record TokenResponse(
    String accessToken,
    String refreshToken,
    Instant accessTokenExpiresAt,
    Instant refreshTokenExpiresAt
) {}
```

### 7.3 Создать `UserResponse.java`
```java
public record UserResponse(
    UUID id,
    String email,
    String phone,
    String firstName,
    String lastName,
    Set<Role> roles,
    Instant createdAt
) {
    public static UserResponse from(User user) { ... }
}
```

### 7.4 Создать `AssignRoleRequest.java`
```java
public record AssignRoleRequest(
    @NotNull Role role
) {}
```

### 7.5 Обновить `RegisterRequest.java`
- [ ] Добавить `phone` (nullable, паттерн: `@Pattern(regexp = "^\\+?[0-9]{10,15}$")`)
- [ ] Добавить `firstName` (nullable)
- [ ] Добавить `lastName` (nullable)
- [ ] Добавить `deviceInfo` (nullable, default: "unknown")

### 7.6 Обновить `LoginRequest.java`
- [ ] Добавить `deviceInfo` (nullable)

### 7.7 Создать `RefreshTokenRequest.java`
```java
public record RefreshTokenRequest(
    @NotBlank String refreshToken
) {}
```

---

## 🔌 БЛОК 8 — Config (Adapters)

### 8.1 Обновить `SecurityConfig.java`
- [ ] Добавить `/api/auth/refresh` в `.permitAll()`
- [ ] Убедиться что `@PreAuthorize` включено: добавить `@EnableMethodSecurity` на класс
- [ ] CORS: настроить явно (не `disable`) — разрешить фронтенд-домен
```java
.cors(cors -> cors.configurationSource(corsConfigurationSource()))

@Bean
CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:3000", "${app.frontend-url}"));
    config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    return new UrlBasedCorsConfigurationSource();
}
```

### 8.2 Создать `RedisConfig.java`
```java
@Configuration
public class RedisConfig {
    @Bean
    public RedisTemplate<String, String> redisTemplate(RedisConnectionFactory factory) {
        StringRedisTemplate template = new StringRedisTemplate(factory);
        return template; // StringRedisTemplate достаточно для blacklist
    }
}
```

### 8.3 Создать `KafkaConfig.java`
```java
@Configuration
public class KafkaConfig {

    @Bean
    public ProducerFactory<String, Object> producerFactory(KafkaProperties props) {
        Map<String, Object> config = new HashMap<>();
        config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, props.getBootstrapServers());
        config.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        config.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        // Идемпотентный продюсер — exactly-once на уровне брокера
        config.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
        config.put(ProducerConfig.ACKS_CONFIG, "all");
        config.put(ProducerConfig.RETRIES_CONFIG, 3);
        return new DefaultKafkaProducerFactory<>(config);
    }

    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate(ProducerFactory<String, Object> pf) {
        return new KafkaTemplate<>(pf);
    }
}
```

---

## 🗄️ БЛОК 9 — Database Migrations (Flyway)

### 9.1 Обновить `V1__init_auth_schema.sql`
- [ ] Добавить `phone`, `first_name`, `last_name` в таблицу `auth.users`
```sql
ALTER TABLE auth.users ADD COLUMN phone VARCHAR(20) UNIQUE;
ALTER TABLE auth.users ADD COLUMN first_name VARCHAR(100);
ALTER TABLE auth.users ADD COLUMN last_name VARCHAR(100);
```
> ⚠️ Если БД ещё не в проде — редактировать прямо V1, иначе — создавать V2

### 9.2 Создать `V2__add_refresh_tokens.sql`
```sql
CREATE TABLE auth.refresh_tokens (
    id           UUID PRIMARY KEY,
    user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash   VARCHAR(255) UNIQUE NOT NULL,
    device_info  VARCHAR(255),
    expires_at   TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    revoked      BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_refresh_tokens_user_id ON auth.refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON auth.refresh_tokens(token_hash);
-- Индекс для очистки устаревших токенов
CREATE INDEX idx_refresh_tokens_expires_at ON auth.refresh_tokens(expires_at)
    WHERE revoked = FALSE;
```

### 9.3 Создать `V3__add_indexes.sql`
```sql
-- Индексы для частых запросов
CREATE INDEX idx_users_email ON auth.users(email);
CREATE INDEX idx_users_phone ON auth.users(phone) WHERE phone IS NOT NULL;
```

---

## ⚙️ БЛОК 10 — application.yaml

### 10.1 Исправить TTL access-токена
```yaml
jwt:
  secret: ${JWT_SECRET:very-long-secret-key-for-dev-only-change-in-prod}
  issuer: florify-auth
  access-token-ttl-minutes: 15        # ← ИСПРАВИТЬ (сейчас 1440!)
  refresh-token-ttl-days: 30          # ← ДОБАВИТЬ
```

### 10.2 Добавить Redis конфигурацию
```yaml
spring:
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
      password: ${REDIS_PASSWORD:}
```

### 10.3 Добавить Kafka конфигурацию
```yaml
spring:
  kafka:
    bootstrap-servers: ${KAFKA_BOOTSTRAP_SERVERS:localhost:9092}
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
```

### 10.4 Добавить переменные окружения для прода
```yaml
app:
  frontend-url: ${FRONTEND_URL:http://localhost:3000}
```

### 10.5 Изменить порт сервиса
```yaml
server:
  port: 8081   # ← auth-service должен быть на 8081, не 8080
```

---

## 🔧 БЛОК 11 — build.gradle (зависимости)

### 11.1 Убедиться что все нужные зависимости есть
```kotlin
dependencies {
    implementation(project(":common"))

    // Spring Boot
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-actuator")

    // Database
    implementation("org.flywaydb:flyway-core")
    implementation("org.flywaydb:flyway-database-postgresql")
    runtimeOnly("org.postgresql:postgresql")

    // Redis
    implementation("org.springframework.boot:spring-boot-starter-data-redis") // ← ДОБАВИТЬ

    // Kafka
    implementation("org.springframework.kafka:spring-kafka")                   // ← ДОБАВИТЬ

    // JWT
    implementation("io.jsonwebtoken:jjwt-api:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.6")

    // MapStruct
    implementation("org.mapstruct:mapstruct:1.6.3")
    annotationProcessor("org.mapstruct:mapstruct-processor:1.6.3")

    // Lombok
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok-mapstruct-binding:0.2.0")

    // OpenAPI
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.8")

    // Commons Codec (для SHA-256 в blacklist)
    implementation("commons-codec:commons-codec:1.17.1")               // ← ДОБАВИТЬ
}
```

---

## 🧩 БЛОК 12 — Обновить `common` модуль

### 12.1 Обновить `JwtAuthenticationFilter.java`
- [ ] Парсить `roles` из claim как `List<String>` (не split по запятой)
- [ ] Добавить зависимость на `TokenBlacklist` порт (через constructor injection)
- [ ] После парсинга токена — проверить `tokenBlacklist.isBlacklisted(token)` → если true → не аутентифицировать
- [ ] Проблема: `JwtAuthenticationFilter` в `common` не должен знать о Redis напрямую → передавать реализацию `TokenBlacklist` через конструктор из конкретного сервиса

### 12.2 Обновить `GlobalExceptionHandler.java` в common
- [ ] Добавить handler для `TokenExpiredException` → 401
- [ ] Добавить handler для `TokenInvalidException` → 401

---

## 🧪 БЛОК 13 — Тесты (архитектурное требование)

> Тесты — не опционально для дипломной работы и для прода.

### 13.1 Unit-тесты Domain
- [ ] `RefreshTokenTest` — тесты `isExpired()`, `isValid()`, `revoke()`
- [ ] `UserTest` — тесты создания через builder

### 13.2 Unit-тесты Interactors (чистые, без Spring)
- [ ] `RegisterUserInteractorTest` — мокировать все порты через Mockito
  - [ ] Тест: успешная регистрация → создаёт User + RefreshToken + публикует событие
  - [ ] Тест: email занят → `ConflictException`
  - [ ] Тест: телефон занят → `ConflictException`
- [ ] `LoginUserInteractorTest`
  - [ ] Тест: успешный логин
  - [ ] Тест: неверный пароль → `AuthCredentialsInvalidException`
  - [ ] Тест: неактивный аккаунт → `ForbiddenException`
- [ ] `RefreshTokenInteractorTest`
  - [ ] Тест: валидный refresh → новая пара токенов, старый отозван
  - [ ] Тест: просроченный refresh → `TokenExpiredException`
  - [ ] Тест: отозванный refresh → `TokenInvalidException`
- [ ] `LogoutInteractorTest`
  - [ ] Тест: access token попадает в blacklist
  - [ ] Тест: refresh token отзывается

### 13.3 Integration-тесты (Testcontainers)
- [ ] `AuthControllerIntegrationTest` — поднять PostgreSQL + Redis через Testcontainers
  - [ ] POST /register → 201 + два токена
  - [ ] POST /login → 200
  - [ ] POST /refresh → 200 + новые токены
  - [ ] POST /logout → 204
  - [ ] GET /me (с токеном) → 200
  - [ ] GET /me (без токена) → 401
  - [ ] GET /me (с blacklisted токеном) → 401

---

## 📋 БЛОК 14 — Финальная проверка

### 14.1 Архитектурные инварианты
- [ ] `domain/` — нет ни одного импорта из `org.springframework`, `jakarta.persistence`, JPA
- [ ] `application/` — нет импортов из `org.springframework.web`, нет HTTP-специфики
- [ ] `application/port/out/` — только интерфейсы, никаких реализаций
- [ ] `adapter/` — единственное место где живут Spring, JPA, Kafka, Redis аннотации
- [ ] Все Interactors инжектируют порты (интерфейсы), а не адаптеры напрямую

### 14.2 Безопасность
- [ ] JWT secret в `application.yaml` — только placeholder, реальный секрет через `${JWT_SECRET}`
- [ ] Access token TTL = 15 минут (не 1440!)
- [ ] Refresh token хранится хешированным (не plaintext)
- [ ] Access token blacklist использует SHA-256 хеш токена как ключ Redis
- [ ] CORS настроен явно, не `disable()`
- [ ] Пароль не возвращается ни в одном HTTP-ответе (проверить `UserResponse`)

### 14.3 Идемпотентность и надёжность
- [ ] Регистрация с тем же email → 409, не 500
- [ ] Refresh с уже отозванным токеном → 401, не 500
- [ ] Logout дважды с тем же токеном → 204 (idempotent, не падает)

### 14.4 OpenAPI документация
- [ ] Все контроллеры аннотированы `@Tag(name = "Auth")`
- [ ] Все эндпоинты аннотированы `@Operation(summary = "...")`
- [ ] Все ответы аннотированы `@ApiResponse`
- [ ] Swagger UI доступен на `/swagger-ui.html`

### 14.5 Actuator и observability
- [ ] `/actuator/health` возвращает UP
- [ ] `/actuator/prometheus` возвращает метрики (для Grafana)
- [ ] Все Interactors логируют: вход (`log.info`), ошибки (`log.warn`/`log.error`)
- [ ] Нет `e.printStackTrace()` нигде — только `log.error("msg", e)`

---

## 🏁 Итог — порядок выполнения

```
День 1:  Блок 0 (структура) + Блок 1 (domain) + Блок 2-4 (ports + commands)
День 2:  Блок 5 (все interactors) + Блок 9 (миграции)
День 3:  Блок 6 (adapters out: Redis, Kafka, JPA) + Блок 7 (controller)
День 4:  Блок 8 (configs) + Блок 10 (yaml) + Блок 11 (gradle)
День 5:  Блок 12 (common update) + Блок 13 (тесты) + Блок 14 (финальная проверка)
```

**После завершения этого чеклиста `auth-service` будет:**
- Полностью production-ready
- Покрыт тестами
- Следовать гексагональной архитектуре без единого отступления
- Готов к интеграции с `customer-service`, `employee-service` через Kafka
- Безопасен: blacklist, хешированные refresh токены, правильный TTL
