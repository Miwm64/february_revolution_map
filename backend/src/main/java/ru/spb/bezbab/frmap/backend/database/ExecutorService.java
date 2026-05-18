package ru.spb.bezbab.frmap.backend.database;

import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import ru.spb.bezbab.frmap.backend.entities.Event;
import ru.spb.bezbab.frmap.backend.entities.EventType;
import ru.spb.bezbab.frmap.backend.entities.Point;
import ru.spb.bezbab.frmap.backend.entities.TimePeriod;

import java.security.SecureRandom;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Base64;


public class ExecutorService {
    DataBase db;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final SecureRandom secureRandom = new SecureRandom();

    public ExecutorService(String url, String user, String password) {
        this.db = new DataBase(url, user, password);
        this.db.connect();
    }

    public ArrayList<Event> getEvents() {
        ArrayList<Event> events = new ArrayList<>();
        try {
            Statement st = db.getStatement();
            ResultSet rs = st.executeQuery("SELECT * FROM events;");

            while (rs.next()) {
                Event event = new Event(
                        rs.getInt("id"),
                        rs.getString("title"),
                        rs.getString("description"),
                        rs.getDate("time").toLocalDate(),
                        new Point(
                                rs.getDouble("x"),
                                rs.getDouble("y")
                        ),
                        rs.getObject("next_event", Integer.class),
                        rs.getObject("prev_event", Integer.class),
                        rs.getString("event_type") != null
                                ? EventType.valueOf(rs.getString("event_type"))
                                : null,
                        rs.getString("time_period") != null
                                ? TimePeriod.valueOf(rs.getString("time_period"))
                                : null
                );

                events.add(event);
            }
            st.close();
        }
        catch (SQLException e){
            db.connect();
            throw new RuntimeException("Couldn't get events");
        }
        return events;
    }

    public Event getEvent(Integer id) {
        Event event = null;
        try {
            Statement st = db.getStatement();
            ResultSet rs = st.executeQuery("SELECT * FROM events where id=" + id + ";");
            System.out.println(1);
            System.out.println("SELECT * FROM events where id=" + id + ";");
            if (rs.next()) {
            System.out.println(2);
                event = new Event(
                        rs.getInt("id"),
                        rs.getString("title"),
                        rs.getString("description"),
                        rs.getDate("time").toLocalDate(),
                        new Point(
                                rs.getDouble("x"),
                                rs.getDouble("y")
                        ),
                        rs.getObject("next_event", Integer.class),
                        rs.getObject("prev_event", Integer.class),
                        rs.getString("event_type") != null
                                ? EventType.valueOf(rs.getString("event_type"))
                                : null,
                        rs.getString("time_period") != null
                                ? TimePeriod.valueOf(rs.getString("time_period"))
                                : null
                );
            }
            st.close();
        }
        catch (SQLException e){
            db.connect();
            throw new RuntimeException("Couldn't get event");
        }
        return event;
    }

    public Boolean deleteEvent(String token, Integer id) {
        try {
            if (!checkToken(token)){
                throw new RuntimeException("Authentication failed");
            }
            Statement st = db.getStatement();
            System.out.println("DELETE FROM events where id=" + id + ";");
            st.execute("DELETE FROM events where id=" + id + ";");
            st.close();
        }
        catch (SQLException e){
            db.connect();
            throw new RuntimeException("Couldn't delete event");
        }
        return true;
    }

    public Integer createEvent(String token, Event event) {
        try {
            if (!checkToken(token)) {
                throw new RuntimeException("Authentication failed");
            }

            Statement st = db.getStatement();
            ResultSet rs = null;

            // Format LocalDateTime to PostgreSQL format
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            String formattedTime = event.time.format(formatter);

            String sql = "INSERT INTO events " +
                    "(title, description, date, x, y, next_event, prev_event, event_type, time_period) VALUES (" +
                    "'" + event.title + "', " +
                    "'" + event.description + "', " +
                    "'" + event.time + "', " +
                    event.coordinates.x + ", " +
                    event.coordinates.y + ", " +
                    (event.nextEvent != null ? event.nextEvent : "NULL") + ", " +
                    (event.prevEvent != null ? event.prevEvent : "NULL") + ", " +
                    (event.eventType != null
                            ? "'" + event.eventType + "'"
                            : "NULL") + ", " +
                    (event.timePeriod != null
                            ? "'" + event.timePeriod + "'"
                            : "NULL") +
                    ") RETURNING id";

            rs = st.executeQuery(sql);

            Integer newID = null;
            // Move to the first row
            if (rs.next()) {
                newID = rs.getInt(1);
            }

            // Clean up
            if (rs != null) rs.close();
            st.close();

            return newID;

        } catch (SQLException e) {
            e.printStackTrace();
            db.connect();
            throw new RuntimeException("Couldn't create event: " + e.getMessage());
        }
    }

    public boolean updateEvent(String token, Event event) {
        try {
            if (!checkToken(token)){
                throw new RuntimeException("Authentication failed");
            }

            Statement st = db.getStatement();

            String sql = "UPDATE events SET " +
                    "title = '" + event.title + "', " +
                    "description = '" + event.description + "', " +
                    "date = '" + event.time + "', " +
                    "x = " + event.coordinates.x + ", " +
                    "y = " + event.coordinates.y + ", " +
                    "next_event = " + (event.nextEvent != null ? event.nextEvent : "NULL") + ", " +
                    "prev_event = " + (event.prevEvent != null ? event.prevEvent : "NULL") + ", " +
                    "event_type = " + (event.eventType != null
                    ? "'" + event.eventType + "'"
                    : "NULL") + ", " +
                    "time_period = " + (event.timePeriod != null
                    ? "'" + event.timePeriod + "'"
                    : "NULL") + " " +
                    "WHERE id = " + event.id + ";";

            int updatedRows = st.executeUpdate(sql);

            if (updatedRows == 0) {
                return false;
            }
            st.close();
        }
        catch (SQLException e){
            db.connect();
            throw new RuntimeException("Couldn't update event");
        }
        return true;
    }

    public boolean createUser(String username, String password, String token) {
        try (Statement stmt = db.getStatement()) {
            if (!checkToken(token)){
                throw new RuntimeException("Authentication failed");
            }
            String hashedPassword = passwordEncoder.encode(password);

            String sql = "INSERT INTO users (username, password_hash) VALUES ('"
                    + username + "', '" + hashedPassword + "') RETURNING id";
            ResultSet rs = stmt.executeQuery(sql);

            if (rs.next()) {
                rs.getInt("id");
                return true;
            }
            return false;
        } catch (SQLException e) {
            throw new RuntimeException("Couldn't create user");
        }
    }

    public String login(String username, String password){
        try (Statement stmt = db.getStatement()) {
            String sql = "SELECT id, password_hash FROM users WHERE username = '" + username + "'";
            ResultSet rs = stmt.executeQuery(sql);

            if (rs.next()) {
                int userId = rs.getInt("id");
                String storedHash = rs.getString("password_hash");
                if (!passwordEncoder.matches(password, storedHash)) {
                    return null;
                }

                byte[] tokenBytes = new byte[32];
                secureRandom.nextBytes(tokenBytes);
                String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);

                Timestamp expiresAt = Timestamp.from(Instant.now().plusSeconds(86400));
                String tokenSql = "INSERT INTO token_user (user_id, token, created_at, expires_at) VALUES ("
                        + userId + ", '" + token + "', now(), '" + expiresAt + "')";
                stmt.executeUpdate(tokenSql);

                return token;
            }
            return null;
        } catch (SQLException e) {
            throw new RuntimeException("Couldn't login");
        }
    }

    public boolean checkToken(String token) {
        try (Statement stmt = db.getStatement()) {
            String sql = "SELECT id, expires_at FROM token_user WHERE token = '" + token + "'";
            ResultSet rs = stmt.executeQuery(sql);
            if (rs.next()){
                LocalDateTime expiraryDate = rs.getTimestamp("expires_at").toLocalDateTime();
                if (expiraryDate.isAfter(LocalDateTime.now())){
                    return true;
                }
            }
            return false;
        }

        catch (Exception e){
            throw new RuntimeException("Couldn't validate token");
        }
    }
}
