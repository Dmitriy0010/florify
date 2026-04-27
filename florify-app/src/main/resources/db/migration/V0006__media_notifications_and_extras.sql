-- ============================================================
-- MIGRATION 6: Media, Notifications, Shedlock, Seed Data
-- ============================================================

-- ============================================================
-- MEDIA
-- ============================================================

CREATE TABLE media_files (
    id                UUID PRIMARY KEY,
    original_filename VARCHAR(500) NOT NULL,
    mime_type         VARCHAR(100) NOT NULL,
    bucket            VARCHAR(100) NOT NULL,
    base_path         VARCHAR(500) NOT NULL,
    status            VARCHAR(50) NOT NULL,
    uploaded_by       UUID NOT NULL,
    uploaded_at       TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_media_files_status ON media_files(status);
CREATE INDEX idx_media_files_uploaded_by ON media_files(uploaded_by);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notification_templates (
    id            UUID PRIMARY KEY,
    code          VARCHAR(200) NOT NULL,
    channel       VARCHAR(30) NOT NULL,
    subject       VARCHAR(500),
    body_template TEXT NOT NULL,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uk_notification_templates_code_channel UNIQUE (code, channel)
);
CREATE INDEX idx_notification_templates_code ON notification_templates(code);
CREATE INDEX idx_notification_templates_channel ON notification_templates(channel);
CREATE INDEX idx_notification_templates_active ON notification_templates(is_active);

CREATE TABLE notification_logs (
    id                UUID PRIMARY KEY,
    recipient_id      UUID NOT NULL,
    recipient_contact VARCHAR(500) NOT NULL,
    channel           VARCHAR(30) NOT NULL,
    template_code     VARCHAR(200) NOT NULL,
    status            VARCHAR(30) NOT NULL,
    sent_at           TIMESTAMPTZ,
    error_message     TEXT
);
CREATE INDEX idx_notification_logs_recipient_id ON notification_logs(recipient_id);
CREATE INDEX idx_notification_logs_template_code ON notification_logs(template_code);
CREATE INDEX idx_notification_logs_status ON notification_logs(status);
CREATE INDEX idx_notification_logs_sent_at ON notification_logs(sent_at DESC);

-- ============================================================
-- SHEDLOCK (distributed locking)
-- ============================================================

CREATE TABLE IF NOT EXISTS shedlock (
    name       VARCHAR(64) NOT NULL,
    lock_until TIMESTAMP NOT NULL,
    locked_at  TIMESTAMP NOT NULL,
    locked_by  VARCHAR(255) NOT NULL,
    PRIMARY KEY (name)
);

-- ============================================================
-- USER INDEXES (additional performance indexes)
-- ============================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone) WHERE phone IS NOT NULL;
