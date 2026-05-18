package ru.spb.bezbab.frmap.backend.entities;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class Event {
    public final Integer id;
    public final String title;
    public final String description;
    public final LocalDate time;
    public final Point coordinates;
    public final Integer nextEvent;
    public final Integer prevEvent;
    public final EventType eventType;
    public final TimePeriod timePeriod;

    public Event(Integer id, String title, String description, LocalDate time, Point coordinates,
                 Integer nextEvent, Integer prevEvent, EventType eventType,
                 TimePeriod timePeriod) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.time = time;
        this.coordinates = coordinates;
        this.nextEvent = nextEvent;
        this.prevEvent = prevEvent;
        this.timePeriod = timePeriod;
        this.eventType = eventType;
    }
}
