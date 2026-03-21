package ru.spb.bezbab.frmap.backend;

import java.util.ArrayList;

public class EventsGetResponse extends Response<ArrayList<Event>> {
    public EventsGetResponse(ArrayList<Event> events) {
        super(true, events);
    }
}
