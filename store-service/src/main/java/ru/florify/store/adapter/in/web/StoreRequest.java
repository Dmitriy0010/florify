package ru.florify.store.adapter.in.web;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record StoreRequest(
    String name,
    String address,
    String phone,
    boolean active
) {}
