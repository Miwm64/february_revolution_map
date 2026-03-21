package ru.spb.bezbab.frmap.backend.controllers;

import java.time.LocalDateTime;
import java.util.ArrayList;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.spb.bezbab.frmap.backend.database.Executor;
import ru.spb.bezbab.frmap.backend.entities.Event;


@RestController
@RequestMapping("/events")
public class Controller {
    Executor executor = new Executor(
            System.getenv("PG_URL"),
            System.getenv("PG_USER"),
            System.getenv("PG_PASSWORD"));

    @GetMapping
    public Response<?> getEvents() {
        ArrayList<Event> events = executor.getEvents();
        return new EventsGetResponse(events);
    }
}