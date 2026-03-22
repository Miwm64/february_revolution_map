package ru.spb.bezbab.frmap.backend.controllers;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.spb.bezbab.frmap.backend.database.ExecutorService;
import ru.spb.bezbab.frmap.backend.entities.Event;
import ru.spb.bezbab.frmap.backend.requests.EventRequest;
import ru.spb.bezbab.frmap.backend.requests.LoginRequest;
import ru.spb.bezbab.frmap.backend.requests.TokenRequest;


@RestController
public class EventsController {
    private final ExecutorService executorService;
    public EventsController(ExecutorService executorService) {
        this.executorService = executorService;
    }


    @GetMapping("/events")
    public Map<String, List<Event>> getEvents() {
        List<Event> result = executorService.getEvents();
        HashMap<String, List<Event>> response = new HashMap<>();
        response.put("data", result);
        return response;
    }

    @PostMapping("/event")
    public Map<String, Event> getEvent(@RequestBody EventRequest eventRequest) {
        Event result = executorService.getEvent(eventRequest.getId());
        HashMap<String, Event> response = new HashMap<>();
        response.put("data", result);
        return response;
    }
}