package ru.spb.bezbab.frmap.backend.controllers;

import org.springframework.web.bind.annotation.*;
import ru.spb.bezbab.frmap.backend.database.ExecutorService;

import java.sql.*;
import java.time.Instant;
import java.util.Base64;
import java.security.SecureRandom;

@RestController
@RequestMapping("/user")
public class UserController {
    private final SecureRandom secureRandom = new SecureRandom();
    private final ExecutorService executorService;
    public UserController(ExecutorService executorService) {
        this.executorService = executorService;
    }

    @PostMapping("/users")
    public String createUser(@RequestParam String username, @RequestParam String password) {
        executorService.createUser(username, password);
    }

    @PostMapping("/login")
    public String login(@RequestParam String username, @RequestParam String password) {
        executorService.login(username, password);
    }

}