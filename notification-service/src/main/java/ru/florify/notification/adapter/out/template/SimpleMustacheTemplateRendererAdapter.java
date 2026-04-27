package ru.florify.notification.adapter.out.template;

import org.springframework.stereotype.Component;
import ru.florify.notification.application.port.out.TemplateRendererPort;

import java.util.Map;

@Component
public class SimpleMustacheTemplateRendererAdapter implements TemplateRendererPort {

    @Override
    public String render(String template, Map<String, Object> variables) {
        if (template == null) {
            return "";
        }
        String result = template;
        if (variables != null) {
            for (var entry : variables.entrySet()) {
                String key = entry.getKey();
                Object val = entry.getValue();
                result = result.replace("{{" + key + "}}", val != null ? val.toString() : "");
            }
        }
        return result;
    }
}

