package ru.spb.bezbab.frmap.backend.entities;

import java.time.LocalDateTime;

public class Event {
    public final Integer id;
    public final String title;
    public final String description;
    public final LocalDateTime time;
    public final Point coordinates;
    public final Integer nextEvent;
    public final Integer prevEvent;

    public Event(Integer id, String title, String description, LocalDateTime time, Point coordinates, Integer nextEvent, Integer prevEvent) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.time = time;
        this.coordinates = coordinates;
        this.nextEvent = nextEvent;
        this.prevEvent = prevEvent;
    }
}
