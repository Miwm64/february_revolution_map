package ru.spb.bezbab.frmap.backend.requests;

import ru.spb.bezbab.frmap.backend.entities.Event;

public class UpdateEventRequest extends TokenRequest{
    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    Event event;
}
