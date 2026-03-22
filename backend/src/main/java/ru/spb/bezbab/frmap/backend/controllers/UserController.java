package ru.spb.bezbab.frmap.backend.controllers;

import org.springframework.web.bind.annotation.*;
import ru.spb.bezbab.frmap.backend.database.ExecutorService;
import ru.spb.bezbab.frmap.backend.requests.LoginRequest;
import ru.spb.bezbab.frmap.backend.requests.TokenRequest;
import ru.spb.bezbab.frmap.backend.requests.UserRequest;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;

@RestController
public class UserController {
    private final ExecutorService executorService;
    public UserController(ExecutorService executorService) {
        this.executorService = executorService;
    }

    @PostMapping("/user")
    public Map<String, Boolean> createUser(@RequestBody UserRequest userRequest) {
        boolean result = executorService.createUser(userRequest.getUsername(), userRequest.getPassword());
        return Map.of("data", result);
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody LoginRequest loginRequest) {
        String result = executorService.login(loginRequest.getUsername(), loginRequest.getPassword());
        HashMap<String, String> response = new HashMap<>();
        response.put("data", result);
        return response;
    }

    @PostMapping("/token")
    public Map<String, Boolean> checkToken(@RequestBody TokenRequest tokenRequest) {
        boolean result = executorService.checkToken(tokenRequest.getToken());
        return Map.of("data", result);
    }
}