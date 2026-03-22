package ru.spb.bezbab.frmap.backend.controllers;

import java.util.ArrayList;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.spb.bezbab.frmap.backend.database.ExecutorService;
import ru.spb.bezbab.frmap.backend.entities.Event;


@RestController
@RequestMapping("/events")
public class EventsController {
    private final ExecutorService executorService;
    public EventsController(ExecutorService executorService) {
        this.executorService = executorService;
    }


    @GetMapping
    public Response<?> getEvents() {
        ArrayList<Event> events = executorService.getEvents();
        return new EventsGetResponse(events);
    }
}