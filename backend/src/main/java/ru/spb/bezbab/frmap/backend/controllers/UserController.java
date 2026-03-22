package ru.spb.bezbab.frmap.backend.controllers;

import org.springframework.web.bind.annotation.*;
import ru.spb.bezbab.frmap.backend.database.ExecutorService;
import ru.spb.bezbab.frmap.backend.requests.LoginRequest;
import ru.spb.bezbab.frmap.backend.requests.TokenRequest;
import ru.spb.bezbab.frmap.backend.requests.UserRequest;

import java.security.SecureRandom;

@RestController
public class UserController {
    private final SecureRandom secureRandom = new SecureRandom();
    private final ExecutorService executorService;
    public UserController(ExecutorService executorService) {
        this.executorService = executorService;
    }

    @PostMapping("/user")
    public Boolean createUser(@RequestBody UserRequest userRequest) {
        return executorService.createUser(userRequest.getUsername(), userRequest.getPassword());
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest loginRequest) {
        return executorService.login(loginRequest.getUsername(), loginRequest.getPassword());
    }

    @PostMapping("/token")
    public Boolean checkToken(@RequestBody TokenRequest tokenRequest) {
        return executorService.checkToken(tokenRequest.getToken());
    }
}