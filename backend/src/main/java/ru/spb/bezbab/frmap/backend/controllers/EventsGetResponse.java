package ru.spb.bezbab.frmap.backend.controllers;

import ru.spb.bezbab.frmap.backend.entities.Event;

import java.util.ArrayList;

public class EventsGetResponse extends Response<ArrayList<Event>> {
    public EventsGetResponse(ArrayList<Event> events) {
        super(true, events);
    }
}
