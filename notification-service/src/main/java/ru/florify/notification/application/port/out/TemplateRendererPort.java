package ru.florify.notification.application.port.out;

import java.util.Map;

public interface TemplateRendererPort {
    String render(String template, Map<String, Object> variables);
}

