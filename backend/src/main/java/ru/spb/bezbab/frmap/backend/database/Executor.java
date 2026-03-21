package ru.spb.bezbab.frmap.backend.database;

import ru.spb.bezbab.frmap.backend.entities.Event;
import ru.spb.bezbab.frmap.backend.entities.Point;

import java.sql.ResultSet;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;

public class Executor {
    DataBase db;
    public Executor(String url, String user, String password){
        db = new DataBase(url, user, password);
        db.connect();
    }

    public ArrayList<Event> getEvents() {
        ArrayList<Event> events = new ArrayList<>();
        try {
            Statement st = db.getStatement();
            st.executeQuery("SELECT * FROM events;");
            ResultSet rs = st.getResultSet();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSSSSS");
            while (rs.next()) {
                Event event = new Event(
                        rs.getInt("id"),
                        rs.getString("title"),
                        rs.getString("description"),
                        LocalDateTime.parse(rs.getString("time"), formatter),
                        new Point(
                                rs.getDouble("x"),
                                rs.getDouble("y")
                        ),
                        rs.getObject("next_event", Integer.class),
                        rs.getObject("prev_event", Integer.class)
                );
                events.add(event);
            }
        }
        catch (Exception e){
            db.connect();
        }
        return events;
    }
}
