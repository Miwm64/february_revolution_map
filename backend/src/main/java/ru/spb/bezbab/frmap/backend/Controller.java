package ru.spb.bezbab.frmap.backend;

import java.util.ArrayList;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/events")
public class Controller {
    @GetMapping
    public Response<?> getEvents() {
        ArrayList<Event> events = new ArrayList<>();
        events.add(
                new Event(
                        1, "test", "test description",
                        new Point(1d, 2d),
                        null, null
                )
        );
        return new EventsGetResponse(events);
    }
}