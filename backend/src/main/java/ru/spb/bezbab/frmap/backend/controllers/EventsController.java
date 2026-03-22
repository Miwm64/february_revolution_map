package ru.spb.bezbab.frmap.backend.controllers;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.spb.bezbab.frmap.backend.database.ExecutorService;
import ru.spb.bezbab.frmap.backend.entities.Event;
import ru.spb.bezbab.frmap.backend.requests.LoginRequest;
import ru.spb.bezbab.frmap.backend.requests.TokenRequest;


@RestController
@RequestMapping("/events")
public class EventsController {
    private final ExecutorService executorService;
    public EventsController(ExecutorService executorService) {
        this.executorService = executorService;
    }


    @PostMapping
    public Map<String, List<Event>> getEvents(@RequestBody TokenRequest tokenRequest) {
        List<Event> result = executorService.getEvents(tokenRequest.getToken());
        HashMap<String, List<Event>> response = new HashMap<>();
        response.put("data", result);
        return response;
    }
}