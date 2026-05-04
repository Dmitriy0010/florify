# Contributing Guide — Florify

## Ветки

| Ветка | Назначение |
|-------|-----------|
| `main` | Стабильный код, **нельзя коммитить напрямую** |
| `feature/<имя>-<краткое-описание>` | Новая фича (пример: `feature/dima-delivery`) |
| `fix/<имя>-<краткое-описание>` | Исправление бага |
| `hotfix/<описание>` | Срочный фикс в main |

## Workflow для каждого разработчика

### Начало новой фичи

```bash
# Убедись что main актуален
git checkout main
git pull origin main

# Создай ветку от свежего main
git checkout -b feature/<твоё-имя>-<описание>
```

### Ежедневная работа

```bash
# Каждое утро подтягивай изменения из main в свою ветку
git fetch origin main
git merge origin/main   # или rebase, смотри ниже
```

### Перед созданием Pull Request — разрешение конфликтов

```bash
# 1. Обновись от main
git fetch origin main

# 2. Перенеси свои изменения поверх актуального main (рекомендуется)
git rebase origin/main
# При конфликтах:
#   - открой файл, реши конфликт
#   - git add <файл>
#   - git rebase --continue

# 3. Запуши (с --force-with-lease если делал rebase)
git push --force-with-lease origin feature/<твоё-имя>-<описание>
```

### Создание Pull Request

1. Запушь ветку на GitHub
2. Открой Pull Request в `main`
3. CI запустится автоматически — дождись зелёных чеков
4. Если CI упал из-за конфликтов — смотри шаг выше
5. После прохождения CI — **Squash and Merge** (не обычный merge)

## Правила коммитов

Используем [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: добавить выбор слота доставки
fix: исправить ошибку авторизации в customer-service
chore: обновить зависимости
refactor: выделить CustomerOrderMapper
```

## Что НЕ должно попадать в репозиторий

- `node_modules/` — устанавливается через `pnpm install`
- `build/`, `dist/`, `.gradle/` — генерируются при сборке
- `*.log`, `build_error.log` — логи сборки
- `LLM_CONTEXT_PROD.txt` — большой контекстный файл для AI
- `.env` — переменные окружения (создавай `.env.example` вместо этого)

## Решение частых проблем

### "Cannot merge: conflicts"

```bash
git fetch origin main
git merge origin/main
# Открой конфликтующие файлы (помечены <<<<<<< HEAD)
# Реши конфликты, сохрани файлы
git add .
git commit -m "chore: resolve merge conflicts"
git push
```

### Случайно закоммитил в main напрямую

```bash
# Создай ветку от текущего состояния
git checkout -b feature/<имя>-<описание>
git push origin feature/<имя>-<описание>
# Затем сбрось main обратно
git checkout main
git reset --hard origin/main
```
